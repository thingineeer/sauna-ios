import XCTest
@testable import FeatureRoom

final class FeatureRoomSmokeTests: XCTestCase {
    func testModuleLoads() {
        XCTAssertEqual(FeatureRoom.moduleName, "FeatureRoom")
    }
}
