import XCTest
@testable import Data

final class DataModuleSmokeTests: XCTestCase {
    func testModuleLoads() {
        XCTAssertEqual(DataLayer.moduleName, "Data")
    }
}
