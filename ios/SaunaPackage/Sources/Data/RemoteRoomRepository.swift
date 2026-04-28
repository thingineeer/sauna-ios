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

    /// 메시지 stream — 임시 단계는 1초 폴링.
    /// 디자인 정본의 spawn 주기 (700ms~3200ms) 대비 충분한 해상도.
    /// AWS Vapor 로 이전하면 WebSocket 으로 원복 (NetworkCore.WebSocketClient 그대로 사용).
    public func observeMessages(for room: Room.Kind) -> AsyncStream<Message> {
        AsyncStream { continuation in
            let task = Task { [weak self] in
                guard let self else { continuation.finish(); return }
                var since: TimeInterval = 0
                let pollInterval: UInt64 = 1_000_000_000 // 1s
                while !Task.isCancelled {
                    do {
                        let response: PollResponse = try await self.fetchMessages(
                            room: room, since: since
                        )
                        for wire in response.messages {
                            if let m = wire.toDomain(room: room) {
                                continuation.yield(m)
                            }
                            since = max(since, wire.ts)
                        }
                    } catch {
                        // 일시적 실패는 무시하고 다음 tick 에 재시도. AsyncStream 은 계속.
                    }
                    try? await Task.sleep(nanoseconds: pollInterval)
                }
                continuation.finish()
            }
            continuation.onTermination = { _ in task.cancel() }
        }
    }

    private func fetchMessages(room: Room.Kind, since: TimeInterval) async throws -> PollResponse {
        var headers: [String: String] = [:]
        if let token = await config.authTokenProvider() {
            headers["Authorization"] = "Bearer \(token)"
        }
        let endpoint = Endpoint(
            baseURL: config.baseURL,
            path: "/rooms/\(room.rawValue)/messages",
            method: .GET,
            headers: headers,
            queryItems: [
                URLQueryItem(name: "since", value: String(Int(since))),
                URLQueryItem(name: "limit", value: "20"),
            ]
        )
        return try await http.request(endpoint, as: PollResponse.self)
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

    fileprivate struct WireMessage: Decodable, Sendable {
        let id: String
        let nickname: String
        let text: String
        let ts: TimeInterval        // unix ms
        let senderId: String

        func toDomain(room: Room.Kind) -> Message? {
            // Firebase Firestore doc IDs aren't UUIDs — map deterministically.
            let id = UUID(uuidString: id) ?? Self.uuidFromString(self.id)
            return Message(
                id: id,
                roomId: room,
                nickname: nickname,
                text: text,
                createdAt: Date(timeIntervalSince1970: ts / 1000.0),
                senderId: senderId
            )
        }

        private static func uuidFromString(_ s: String) -> UUID {
            // Hash the doc id to a stable UUID. Not cryptographic — just stable for SwiftUI ForEach.
            let bytes = Array(s.utf8)
            var out = [UInt8](repeating: 0, count: 16)
            for (i, b) in bytes.enumerated() { out[i % 16] ^= b }
            // RFC4122 변형 + version 4 마킹.
            out[6] = (out[6] & 0x0F) | 0x40
            out[8] = (out[8] & 0x3F) | 0x80
            return UUID(uuid: (out[0], out[1], out[2], out[3], out[4], out[5], out[6], out[7],
                                out[8], out[9], out[10], out[11], out[12], out[13], out[14], out[15]))
        }
    }

    fileprivate struct PollResponse: Decodable, Sendable {
        let messages: [WireMessage]
        let serverTs: TimeInterval
    }
}
