import XCTest
@testable import FeatureHome

final class FeatureHomeSmokeTests: XCTestCase {
    func testModuleLoads() {
        XCTAssertEqual(FeatureHome.moduleName, "FeatureHome")
    }
}
