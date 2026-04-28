import XCTest
@testable import FeatureOnboarding

final class FeatureOnboardingSmokeTests: XCTestCase {
    func testModuleLoads() {
        XCTAssertEqual(FeatureOnboarding.moduleName, "FeatureOnboarding")
    }
}
