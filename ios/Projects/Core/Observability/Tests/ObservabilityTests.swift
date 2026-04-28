import XCTest
@testable import Observability

final class ObservabilityBootstrapTests: XCTestCase {
    func testBootstrapWithNilDSNInstallsNoop() {
        Observability.bootstrap(dsn: nil, environment: "test", release: "0.0.0")
        // Should be safe to call any method without side effects.
        Observability.shared.capture(message: "hello", level: .info)
        Observability.shared.breadcrumb(category: "test", message: "x", level: .debug)
        Observability.shared.setUser(anonymousId: "anon")
        Observability.shared.clearUser()
        // Just asserting we didn't crash.
        XCTAssertTrue(true)
    }

    func testBootstrapWithEmptyDSNInstallsNoop() {
        Observability.bootstrap(dsn: "", environment: "test", release: "0.0.0")
        Observability.shared.capture(message: "hello", level: .info)
        XCTAssertTrue(true)
    }

    func testCustomSinkCanBeInstalled() {
        let spy = SpySink()
        Observability.install(spy)
        Observability.shared.capture(message: "hello", level: .warning)
        XCTAssertEqual(spy.captures, ["hello"])
    }

    final class SpySink: ObservabilitySink, @unchecked Sendable {
        var captures: [String] = []
        func start(dsn: String, environment: String, release: String) {}
        func capture(message: String, level: ObservabilityLevel) {
            captures.append(message)
        }
        func capture(error: Error, additionalContext: [String: String]) {}
        func breadcrumb(category: String, message: String, level: ObservabilityLevel) {}
        func setUser(anonymousId: String) {}
        func clearUser() {}
    }
}
