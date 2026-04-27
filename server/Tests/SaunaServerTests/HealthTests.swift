import XCTVapor
@testable import SaunaServer

final class HealthTests: XCTestCase {
    func testHealthEndpointReturnsOk() async throws {
        let app = try await Application.make(.testing)
        try await configure(app)

        try await app.test(.GET, "health") { res async throws in
            XCTAssertEqual(res.status, .ok)
            let body = try res.content.decode(HealthResponse.self)
            XCTAssertTrue(body.ok)
            XCTAssertEqual(body.version, HealthController.version)
        }

        try await app.asyncShutdown()
    }
}
