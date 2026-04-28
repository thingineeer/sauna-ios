import XCTest
@testable import PixelMascot

final class PixelMascotSmokeTests: XCTestCase {
    func testModuleLoads() {
        XCTAssertEqual(PixelMascotModule.moduleName, "PixelMascot")
    }
}
