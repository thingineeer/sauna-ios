import XCTVapor
@testable import SaunaServer

/// PasskeyController exercises the begin/finish challenge cycle. End-to-end
/// WebAuthn (CBOR + COSE) is phase 3 — these tests verify the wire contract
/// and challenge-store guard so iOS can plumb against a stable surface.
final class PasskeyControllerTests: XCTestCase {

    func testRegisterBeginReturns32ByteChallenge() async throws {
        let app = try await Application.make(.testing)
        defer { Task { try? await app.asyncShutdown() } }
        try await configure(app)

        try await app.testable().test(
            .POST, "/auth/passkey/register/begin",
            beforeRequest: { req in
                try req.content.encode(["displayName": "Tester"])
            },
            afterResponse: { res async in
                XCTAssertEqual(res.status, .ok)
                let body = try? res.content.decode(RegisterBeginResponse.self)
                XCTAssertNotNil(body)
                XCTAssertFalse(body?.challenge.isEmpty ?? true)
                XCTAssertFalse(body?.userId.isEmpty ?? true)
                XCTAssertEqual(body?.userName, "Tester")
                // base64url has no padding
                XCTAssertFalse(body?.challenge.contains("=") ?? true)
            }
        )
    }

    func testRegisterFinishWithoutBeginIsRejected() async throws {
        let app = try await Application.make(.testing)
        defer { Task { try? await app.asyncShutdown() } }
        try await configure(app)

        try await app.testable().test(
            .POST, "/auth/passkey/register/finish",
            beforeRequest: { req in
                try req.content.encode([
                    "userId": "no-begin-was-called",
                    "credentialId": "Y3JlZA",
                    "rawAttestation": "YXR0",
                    "rawClientData": "Y2xp",
                ])
            },
            afterResponse: { res async in
                XCTAssertEqual(res.status, .badRequest)
            }
        )
    }

    func testHasReturnsFalseForUnknownUser() async throws {
        let app = try await Application.make(.testing)
        defer { Task { try? await app.asyncShutdown() } }
        try await configure(app)

        try await app.testable().test(
            .GET, "/auth/passkey/has?userId=ghost",
            afterResponse: { res async in
                XCTAssertEqual(res.status, .ok)
                let body = try? res.content.decode(HasResponse.self)
                XCTAssertEqual(body?.has, false)
            }
        )
    }

    func testLoginBeginReturnsChallenge() async throws {
        let app = try await Application.make(.testing)
        defer { Task { try? await app.asyncShutdown() } }
        try await configure(app)

        try await app.testable().test(
            .POST, "/auth/passkey/login/begin",
            beforeRequest: { req in
                try req.content.encode([String: String]())
            },
            afterResponse: { res async in
                XCTAssertEqual(res.status, .ok)
                let body = try? res.content.decode(LoginBeginResponse.self)
                XCTAssertNotNil(body)
                XCTAssertFalse(body?.challenge.isEmpty ?? true)
            }
        )
    }
}
