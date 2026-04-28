import XCTest
@testable import Sauna

/// App-target smoke tests. The bulk of behavior is tested in SPM
/// (SaunaPackage). This target exists so the .xcodeproj has a TEST_HOST and
/// TestFlight uploads can run a quick post-build sanity check.
final class SaunaAppHostSmokeTests: XCTestCase {
    func testTargetBuildsAndLoads() {
        // No-op — if this file compiles, the iOS target was wired correctly.
        XCTAssertTrue(true)
    }
}
