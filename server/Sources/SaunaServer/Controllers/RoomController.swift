import Foundation
import NIOCore
import NIOHTTP1
import Vapor
import WebSocketKit

/// `WebSocket /ws/rooms/:roomId` — the only message-bearing endpoint.
///
/// Spec (tech-stack-final §2.3):
/// 1. Client connects to `wss://api.sauna.app/ws/rooms/<roomId>`.
/// 2. Server validates `roomId` ∈ {`daily`, `stock`, `job`}.
/// 3. Server subscribes the connection to `room:<roomId>` on the bus.
/// 4. Inbound `send` frames are rate-limited (per userId) and re-published.
/// 5. Bus messages fan out to every subscriber on the channel.
///
/// Persistence rule (PRD §8): never store text. Anything beyond the in-flight
/// fanout is forbidden. Logs include connection counts and error reasons only.
public struct RoomController: RouteCollection, Sendable {
    /// Per-user fixed window. Defaults match tech-stack-final §2.3
    /// ("발화 1초 2개").
    let rateLimiter: RateLimiter

    public init(rateLimiter: RateLimiter = RateLimiter()) {
        self.rateLimiter = rateLimiter
    }

    public func boot(routes: RoutesBuilder) throws {
        let limiter = self.rateLimiter

        // Register one WS route per known room. This is intentional:
        // unknown roomIds get a 404 from Vapor's router (clean, observable)
        // rather than dangling on a failed upgrade promise, which is what
        // happens if we validate inside `shouldUpgrade`.
        for room in RoomKind.allCases {
            routes.webSocket(
                "ws", "rooms", PathComponent(stringLiteral: room.rawValue),
                onUpgrade: { req, ws in
                    let bus = req.application.pubSubBus
                    let logger = req.logger
                    // Attach userId from a query param for the scaffold.
                    // Phase 3 replaces this with the verified Passkey JWT subject.
                    let userId = (try? req.query.get(String.self, at: "userId"))
                        ?? "anon-\(UUID().uuidString.prefix(8))"

                    await Self.handleSession(
                        ws: ws,
                        room: room,
                        userId: String(userId),
                        bus: bus,
                        rateLimiter: limiter,
                        logger: logger
                    )
                }
            )
        }
    }

    /// One WebSocket session: subscribe to the room channel, then forward
    /// inbound `send` frames as published `ChatMessage` payloads.
    @Sendable
    static func handleSession(
        ws: WebSocket,
        room: RoomKind,
        userId: String,
        bus: any PubSubBus,
        rateLimiter: RateLimiter,
        logger: Logger
    ) async {
        let channel = PubSubChannel.room(room)
        logger.info(
            "ws open",
            metadata: ["room": .string(room.rawValue), "userId": .string(userId)]
        )

        // ---- 1. Subscribe to the bus and forward to this socket ----
        // The bus delivers handler invocations on a detached Task, so we
        // must hop back onto the WebSocket's event loop before touching it.
        let wsEventLoop = ws.eventLoop
        let token: SubscriptionToken
        do {
            token = try await bus.subscribe(channel: channel) { data in
                guard let str = String(data: data, encoding: .utf8) else { return }
                wsEventLoop.execute {
                    ws.send(str, promise: nil)
                }
            }
        } catch {
            logger.error(
                "ws subscribe failed",
                metadata: [
                    "room": .string(room.rawValue),
                    "reason": .string("\(type(of: error))"),
                ]
            )
            try? await ws.close(code: .unexpectedServerError)
            return
        }

        // ---- 2. Wire inbound text frames ----
        let context = SessionContext(
            ws: ws,
            room: room,
            userId: userId,
            bus: bus,
            rateLimiter: rateLimiter,
            logger: logger
        )
        // `ws.onText` writes to a NIOLoopBoundBox; the assignment must happen
        // on the channel's event loop. Wrap the callback so the actor-bound
        // handler runs in a Task.
        wsEventLoop.execute {
            ws.onText { _, text in
                Task { await context.onText(text) }
            }
        }

        // ---- 3. Wait for close ----
        try? await ws.onClose.get()
        await bus.unsubscribe(token)
        logger.info(
            "ws close",
            metadata: ["room": .string(room.rawValue), "userId": .string(userId)]
        )
    }
}

/// Per-connection mutable context. Wrapped in an actor so concurrent
/// `onText` deliveries can't race.
private actor SessionContext {
    let ws: WebSocket
    let room: RoomKind
    let userId: String
    let bus: any PubSubBus
    let rateLimiter: RateLimiter
    let logger: Logger
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    init(
        ws: WebSocket,
        room: RoomKind,
        userId: String,
        bus: any PubSubBus,
        rateLimiter: RateLimiter,
        logger: Logger
    ) {
        self.ws = ws
        self.room = room
        self.userId = userId
        self.bus = bus
        self.rateLimiter = rateLimiter
        self.logger = logger
    }

    func onText(_ text: String) async {
        guard let frameBytes = text.data(using: .utf8) else { return }
        let frame: InboundFrame
        do {
            frame = try decoder.decode(InboundFrame.self, from: frameBytes)
        } catch {
            await sendError(code: "bad_frame", reason: "invalid frame")
            return
        }

        switch frame {
        case .send(let payload):
            await handleSend(payload)
        }
    }

    private func handleSend(_ payload: InboundFrame.SendPayload) async {
        // 1. Rate limit
        let verdict = await rateLimiter.check(userId: userId)
        if !verdict.allowed {
            logger.info(
                "rate limited",
                metadata: [
                    "room": .string(room.rawValue),
                    "userId": .string(userId),
                    "usage": .stringConvertible(verdict.usage),
                ]
            )
            await sendError(code: "rate_limited", reason: "too many messages")
            return
        }

        // 2. Reject empty / oversize text. Server-side bound, client also enforces.
        let trimmed = payload.text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard (1...500).contains(trimmed.count) else {
            await sendError(code: "bad_text", reason: "invalid text length")
            return
        }

        // 3. Build wire message and publish.
        let nowMillis = Int64(Date().timeIntervalSince1970 * 1_000)
        let message = ChatMessage(
            id: UUID().uuidString,
            room: room,
            senderId: userId,
            // Nickname assignment will move to Phase 3 (Passkey daily roll).
            // For now echo a placeholder so wire shape is correct.
            nickname: "anon",
            text: trimmed,
            sentAtMillis: nowMillis
        )
        let outbound = OutboundFrame.message(message)

        do {
            let body = try encoder.encode(outbound)
            try await bus.publish(channel: PubSubChannel.room(room), payload: body)
            // Log COUNTS only — never the text.
            logger.trace(
                "msg published",
                metadata: [
                    "room": .string(room.rawValue),
                    "bytes": .stringConvertible(body.count),
                ]
            )
        } catch {
            logger.error(
                "publish failed",
                metadata: [
                    "room": .string(room.rawValue),
                    "reason": .string("\(type(of: error))"),
                ]
            )
            await sendError(code: "publish_failed", reason: "server error")
        }
    }

    private func sendError(code: String, reason: String) async {
        let frame = OutboundFrame.error(.init(code: code, reason: reason))
        guard let data = try? encoder.encode(frame),
              let str = String(data: data, encoding: .utf8) else { return }
        // Hop onto the channel event loop before mutating the socket.
        let socket = ws
        ws.eventLoop.execute { socket.send(str, promise: nil) }
    }
}
