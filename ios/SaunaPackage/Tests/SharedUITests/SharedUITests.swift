import XCTest
@testable import SharedUI

final class SharedUISmokeTests: XCTestCase {
    func testModuleLoads() {
        XCTAssertEqual(SharedUIModule.moduleName, "SharedUI")
    }
}
