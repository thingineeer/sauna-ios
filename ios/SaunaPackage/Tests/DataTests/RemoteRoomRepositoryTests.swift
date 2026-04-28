import XCTest
import Domain
import DomainInterfaces
import NetworkCore
@testable import Data

@MainActor
final class RemoteRoomRepositoryTests: XCTestCase {
    func testSendBuildsCorrectRequest() async throws {
        let http = SpyHTTP()
        let ws = NoopWS()
        // swiftlint:disable:next force_unwrapping
        let repo = RemoteRoomRepository(
            config: .init(
                baseURL: URL(string: "https://api.test")!,
                wsBaseURL: URL(string: "wss://api.test")!,
                authTokenProvider: { "tok-123" }
            ),
            http: http,
            ws: ws
        )
        try await repo.send("hi", to: .daily)
        XCTAssertEqual(http.lastSent?.path, "/rooms/daily/send")
        XCTAssertEqual(http.lastSent?.method, .POST)
        XCTAssertEqual(http.lastSent?.headers["Authorization"], "Bearer tok-123")
        XCTAssertEqual(http.lastSent?.headers["Content-Type"], "application/json")
        let bodyJSON = try JSONSerialization.jsonObject(
            with: http.lastSent?.body ?? Data()) as? [String: String]
        XCTAssertEqual(bodyJSON, ["text": "hi"])
    }

    func testOccupancyDecodesHead() async throws {
        let http = SpyHTTP()
        let ws = NoopWS()
        // The DTO is private inside RemoteRoomRepository; stub by JSON-decoding
        // a literal payload of the right shape and casting to T at runtime.
        http.decodedResponseFactory = { type in
            // swiftlint:disable:next force_unwrapping
            let data = #"{"head":312}"#.data(using: .utf8)!
            return try? JSONDecoder().decode(type, from: data)
        }
        // swiftlint:disable:next force_unwrapping
        let repo = RemoteRoomRepository(
            config: .init(
                baseURL: URL(string: "https://api.test")!,
                wsBaseURL: URL(string: "wss://api.test")!,
                authTokenProvider: { nil }
            ),
            http: http,
            ws: ws
        )
        let n = try await repo.occupancy(of: .stock)
        XCTAssertEqual(n, 312)
    }

    // MARK: - spies

    final class SpyHTTP: NetworkClient, @unchecked Sendable {
        var lastSent: Endpoint?
        /// Returns an instance that already decodes correctly for the requested
        /// generic `T`. Tests that don't need a return value can leave it nil.
        var decodedResponseFactory: (@Sendable (any Decodable.Type) -> Any?)?
        func request<T: Decodable & Sendable>(_ endpoint: Endpoint, as: T.Type) async throws -> T {
            lastSent = endpoint
            if let r = decodedResponseFactory?(T.self) as? T { return r }
            throw NetworkError.transport("no stub")
        }
        func send(_ endpoint: Endpoint) async throws { lastSent = endpoint }
    }

    struct NoopWS: WebSocketClient {
        func connect(_ url: URL, headers: [String: String]) async throws {}
        func send(_ text: String) async throws {}
        func messages() async -> AsyncStream<String> { AsyncStream { $0.finish() } }
        func close() async {}
    }
}
