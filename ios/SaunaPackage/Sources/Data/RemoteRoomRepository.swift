import Foundation
import Domain
import DomainInterfaces
import NetworkCore

/// Talks to the Vapor server. WebSocket per active room (subscribe-on-open,
/// unsubscribe-on-close). Sends/occupancy go over plain HTTP for simplicity.
public final class RemoteRoomRepository: RoomRepository, @unchecked Sendable {
    public struct Config: Sendable {
        public let baseURL: URL
        public let wsBaseURL: URL
        public let authTokenProvider: @Sendable () async -> String?
        public init(
            baseURL: URL,
            wsBaseURL: URL,
            authTokenProvider: @escaping @Sendable () async -> String?
        ) {
            self.baseURL = baseURL
            self.wsBaseURL = wsBaseURL
            self.authTokenProvider = authTokenProvider
        }
    }

    private let config: Config
    private let http: NetworkClient
    private let ws: WebSocketClient

    public init(
        config: Config,
        http: NetworkClient,
        ws: WebSocketClient
    ) {
        self.config = config
        self.http = http
        self.ws = ws
    }

    public func observeMessages(for room: Room.Kind) -> AsyncStream<Message> {
        AsyncStream { continuation in
            Task { [weak self] in
                guard let self else { continuation.finish(); return }
                let url = self.config.wsBaseURL.appendingPathComponent("ws/rooms/\(room.rawValue)")
                let token = await self.config.authTokenProvider()
                let headers = token.map { ["Authorization": "Bearer \($0)"] } ?? [:]
                do {
                    try await self.ws.connect(url, headers: headers)
                    let stream = await self.ws.messages()
                    for await raw in stream {
                        if let m = Self.decode(raw, room: room) {
                            continuation.yield(m)
                        }
                    }
                } catch {
                    // Surface as silent termination — caller's stream just ends.
                }
                continuation.finish()
            }
            continuation.onTermination = { [weak self] _ in
                Task { await self?.ws.close() }
            }
        }
    }

    public func send(_ text: String, to room: Room.Kind) async throws {
        let url = config.baseURL
        let body = try JSONEncoder().encode(SendBody(text: text))
        var headers = ["Content-Type": "application/json"]
        if let token = await config.authTokenProvider() {
            headers["Authorization"] = "Bearer \(token)"
        }
        let endpoint = Endpoint(
            baseURL: url,
            path: "/rooms/\(room.rawValue)/send",
            method: .POST,
            headers: headers,
            body: body
        )
        try await http.send(endpoint)
    }

    public func occupancy(of room: Room.Kind) async throws -> Int {
        let endpoint = Endpoint(
            baseURL: config.baseURL,
            path: "/rooms/\(room.rawValue)/occupancy"
        )
        let response: OccupancyDTO = try await http.request(endpoint, as: OccupancyDTO.self)
        return response.head
    }

    public func rooms() async throws -> [Room] {
        let endpoint = Endpoint(baseURL: config.baseURL, path: "/rooms")
        let response: [RoomDTO] = try await http.request(endpoint, as: [RoomDTO].self)
        return response.compactMap { $0.toDomain() }
    }

    // MARK: - DTO

    private struct SendBody: Encodable { let text: String }

    private struct OccupancyDTO: Decodable { let head: Int }

    private struct RoomDTO: Decodable {
        let id: String
        let head: Int

        func toDomain() -> Room? {
            guard let kind = Room.Kind(rawValue: id) else { return nil }
            let label: String = {
                switch kind {
                case .daily: return "일상 황토방"
                case .stock: return "주식 황토방"
                case .job:   return "취준 황토방"
                }
            }()
            let subtitle: String = {
                switch kind {
                case .daily: return "하루 흘려보내기"
                case .stock: return "장 식히기"
                case .job:   return "잠시 숨고르기"
                }
            }()
            return Room(
                id: kind, label: label, subtitle: subtitle,
                occupancy: head, crowd: Room.crowd(forHeadcount: head)
            )
        }
    }

    private struct WireMessage: Decodable {
        let id: String
        let nickname: String
        let text: String
        let ts: TimeInterval
        let senderId: String
    }

    private static func decode(_ raw: String, room: Room.Kind) -> Message? {
        guard let data = raw.data(using: .utf8),
              let wire = try? JSONDecoder().decode(WireMessage.self, from: data),
              let uuid = UUID(uuidString: wire.id) else { return nil }
        return Message(
            id: uuid,
            roomId: room,
            nickname: wire.nickname,
            text: wire.text,
            createdAt: Date(timeIntervalSince1970: wire.ts),
            senderId: wire.senderId
        )
    }
}
