import Foundation
import Logging
import NIOCore
import NIOPosix
@preconcurrency import RediStack

/// Redis-backed `PubSubBus` (production path).
///
/// Architecture:
/// - **Publisher** is a single `RedisConnection` used only for `PUBLISH`.
/// - **Subscriber** is a single `RedisConnection` placed in pub/sub mode.
///   It multiplexes every active `room:*` subscription across one TCP
///   connection. Per-subscription handlers are kept in an actor.
///
/// Failure model:
/// - `connect(...)` throws if either connection cannot be opened.
///   Caller (`configure(_:)`) is expected to fall back to
///   `InMemoryPubSubBus` and log a warning.
/// - Once connected, individual publish failures are logged (count + reason
///   only — never the payload bytes) and swallowed; pub/sub is best-effort.
///
/// Sendability: `RedisConnection` is event-loop-confined and not formally
/// `Sendable`, but every operation we perform on it returns to the bound
/// event loop internally. We therefore mark the wrapper `@unchecked Sendable`.
public final class RedisPubSubBus: PubSubBus, @unchecked Sendable {
    private let publisher: RedisConnection
    private let subscriber: RedisConnection
    private let state = State()
    private let logger: Logger

    /// Connect to Redis using an `redis://[:password@]host:port[/db]` URL.
    public static func connect(
        urlString: String,
        eventLoopGroup: EventLoopGroup,
        logger: Logger
    ) async throws -> RedisPubSubBus {
        let cfg = try RedisConnection.Configuration(url: urlString, defaultLogger: logger)
        let pub = try await RedisConnection.make(
            configuration: cfg,
            boundEventLoop: eventLoopGroup.next()
        ).get()
        let sub = try await RedisConnection.make(
            configuration: cfg,
            boundEventLoop: eventLoopGroup.next()
        ).get()
        return RedisPubSubBus(publisher: pub, subscriber: sub, logger: logger)
    }

    init(publisher: RedisConnection, subscriber: RedisConnection, logger: Logger) {
        self.publisher = publisher
        self.subscriber = subscriber
        self.logger = logger
    }

    public func subscribe(
        channel: String,
        handler: @Sendable @escaping (Data) -> Void
    ) async throws -> SubscriptionToken {
        let token = SubscriptionToken(channel: channel)
        let isFirst = await state.add(token: token, handler: handler)
        if isFirst {
            // Open the channel on Redis the first time anyone subscribes.
            try await subscriber.subscribe(
                to: [RedisChannelName(channel)],
                messageReceiver: { [weak self] _, value in
                    guard let self else { return }
                    guard let data = value.data else { return }
                    Task { await self.deliver(channel: channel, data: data) }
                },
                onSubscribe: nil,
                onUnsubscribe: nil
            ).get()
        }
        return token
    }

    public func publish(channel: String, payload: Data) async throws {
        // Do NOT log payload bytes (PII rule).
        do {
            _ = try await publisher.publish(payload, to: RedisChannelName(channel)).get()
        } catch {
            logger.error(
                "redis publish failed",
                metadata: [
                    "channel": .string(channel),
                    "bytes": .stringConvertible(payload.count),
                    "reason": .string("\(type(of: error))"),
                ]
            )
            throw error
        }
    }

    public func unsubscribe(_ token: SubscriptionToken) async {
        let isLast = await state.remove(token: token)
        if isLast {
            do {
                try await subscriber.unsubscribe(from: [RedisChannelName(token.channel)]).get()
            } catch {
                logger.warning(
                    "redis unsubscribe failed",
                    metadata: [
                        "channel": .string(token.channel),
                        "reason": .string("\(type(of: error))"),
                    ]
                )
            }
        }
    }

    /// Internal: shutdown both connections. Call during graceful shutdown.
    public func shutdown() async {
        try? await publisher.close().get()
        try? await subscriber.close().get()
    }

    private func deliver(channel: String, data: Data) async {
        for h in await state.handlers(for: channel) {
            Task.detached { h(data) }
        }
    }

    // MARK: - State

    private actor State {
        private var channels: [String: [UUID: @Sendable (Data) -> Void]] = [:]

        /// Adds a token; returns `true` if this is the first subscriber on the channel.
        func add(token: SubscriptionToken, handler: @Sendable @escaping (Data) -> Void) -> Bool {
            let wasEmpty = (channels[token.channel]?.isEmpty ?? true)
            channels[token.channel, default: [:]][token.id] = handler
            return wasEmpty
        }

        /// Removes a token; returns `true` if this was the last subscriber on the channel.
        func remove(token: SubscriptionToken) -> Bool {
            channels[token.channel]?.removeValue(forKey: token.id)
            let isEmpty = channels[token.channel]?.isEmpty ?? true
            if isEmpty { channels.removeValue(forKey: token.channel) }
            return isEmpty
        }

        func handlers(for channel: String) -> [@Sendable (Data) -> Void] {
            Array(channels[channel]?.values ?? [:].values)
        }
    }
}
