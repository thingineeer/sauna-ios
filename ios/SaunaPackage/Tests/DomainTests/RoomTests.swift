import XCTest
@testable import Domain

final class RoomTests: XCTestCase {
    func testCrowdBucketing() {
        XCTAssertEqual(Room.crowd(forHeadcount: 0),   .lonely)
        XCTAssertEqual(Room.crowd(forHeadcount: 8),   .lonely)
        XCTAssertEqual(Room.crowd(forHeadcount: 29),  .lonely)
        XCTAssertEqual(Room.crowd(forHeadcount: 30),  .medium)
        XCTAssertEqual(Room.crowd(forHeadcount: 142), .medium)
        XCTAssertEqual(Room.crowd(forHeadcount: 199), .medium)
        XCTAssertEqual(Room.crowd(forHeadcount: 200), .packed)
        XCTAssertEqual(Room.crowd(forHeadcount: 312), .packed)
    }

    func testKindRawValuesAreStableForServerWire() {
        // Server expects exactly these strings on the WS path.
        XCTAssertEqual(Room.Kind.daily.rawValue, "daily")
        XCTAssertEqual(Room.Kind.stock.rawValue, "stock")
        XCTAssertEqual(Room.Kind.job.rawValue,   "job")
    }

    func testAllCasesOrderMatchesDesign() {
        XCTAssertEqual(Room.Kind.allCases, [.daily, .stock, .job])
    }
}
