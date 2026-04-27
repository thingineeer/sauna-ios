import NIOCore
import NIOPosix
import WebSocketKit
import XCTVapor
@testable import SaunaServer

final class RoomControllerTests: XCTestCase {
    /// Domain-level: the parser is the boundary between path → typed enum.
    func testRoomKindParsesAcceptedValues() {
        XCTAssertNotNil(RoomKind.parse("daily"))
        XCTAssertNotNil(RoomKind.parse("stock"))
        XCTAssertNotNil(RoomKind.parse("job"))
        XCTAssertNil(RoomKind.parse("DAILY"))
        XCTAssertNil(RoomKind.parse(""))
        XCTAssertNil(RoomKind.parse("season"))
    }

    /// Unknown roomIds must NOT have a registered route — Vapor returns 404
    /// at the HTTP layer, the upgrade is never attempted, and the WS client
    /// throws `invalidResponseStatus(404)`.
    func testInvalidRoomIdRejectsUpgrade() async throws {
        let app = try await makeRunningApp()

        let port = try XCTUnwrap(app.http.server.shared.localAddress?.port)
        var caughtError: Error?
        do {
            try await WebSocket.connect(
                to: "ws://127.0.0.1:\(port)/ws/rooms/garbage",
                on: MultiThreadedEventLoopGroup.singleton
            ) { _ in
                XCTFail("upgrade should never succeed for an unknown room")
            }
        } catch {
            caughtError = error
        }
        XCTAssertNotNil(caughtError, "WebSocket.connect must throw on rejected handshake")

        await app.server.shutdown()
        try await app.asyncShutdown()
    }

    /// Valid roomIds must complete the upgrade handshake and let the client
    /// close cleanly.
    func testValidRoomIdAcceptsUpgrade() async throws {
        let app = try await makeRunningApp()

        let port = try XCTUnwrap(app.http.server.shared.localAddress?.port)
        let opened = expectation(description: "ws upgraded")
        try await WebSocket.connect(
            to: "ws://127.0.0.1:\(port)/ws/rooms/daily?userId=tester",
            on: MultiThreadedEventLoopGroup.singleton
        ) { ws in
            opened.fulfill()
            _ = ws.close()
        }
        await fulfillment(of: [opened], timeout: 5)

        await app.server.shutdown()
        try await app.asyncShutdown()
    }

    func testRateLimiterEnforcesCapacity() async throws {
        // Deterministic clock: every call returns 0 → all events fall in the
        // same window.
        let limiter = RateLimiter(capacity: 2, windowMillis: 1_000, now: { 0 })

        let v1 = await limiter.check(userId: "u1")
        let v2 = await limiter.check(userId: "u1")
        let v3 = await limiter.check(userId: "u1")

        XCTAssertTrue(v1.allowed)
        XCTAssertTrue(v2.allowed)
        XCTAssertFalse(v3.allowed, "third event in the same window must be denied")

        // Different user: independent bucket.
        let other = await limiter.check(userId: "u2")
        XCTAssertTrue(other.allowed)
    }

    func testRateLimiterResetsAfterWindow() async throws {
        let clock = ClockBox(initial: 0)
        let limiter = RateLimiter(
            capacity: 1,
            windowMillis: 100,
            now: { clock.read() }
        )

        let first = await limiter.check(userId: "u1")
        XCTAssertTrue(first.allowed)
        let denied = await limiter.check(userId: "u1")
        XCTAssertFalse(denied.allowed)

        clock.set(150)
        let afterWindow = await limiter.check(userId: "u1")
        XCTAssertTrue(afterWindow.allowed, "window should reset")
    }

    // MARK: - Test helpers

    /// Boots a real HTTP listener bound to an ephemeral port, configures
    /// the app, returns it. Caller is responsible for shutdown.
    private func makeRunningApp() async throws -> Application {
        let app = try await Application.make(.testing)
        app.http.server.configuration.hostname = "127.0.0.1"
        app.http.server.configuration.port = 0
        try await configure(app)
        try app.server.start()
        return app
    }
}

/// Minimal mutable clock for deterministic limiter tests.
private final class ClockBox: @unchecked Sendable {
    private let lock = NSLock()
    private var value: Int64
    init(initial: Int64) { self.value = initial }
    func read() -> Int64 {
        lock.lock(); defer { lock.unlock() }
        return value
    }
    func set(_ v: Int64) {
        lock.lock(); defer { lock.unlock() }
        value = v
    }
}
