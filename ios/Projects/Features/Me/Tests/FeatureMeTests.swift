import XCTest
@testable import FeatureMe

final class FeatureMeSmokeTests: XCTestCase {
    func testModuleLoads() {
        XCTAssertEqual(FeatureMe.moduleName, "FeatureMe")
    }
}
