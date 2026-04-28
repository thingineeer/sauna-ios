import XCTest
@testable import FeatureHome

final class TimeOfDayTests: XCTestCase {
    func testEachToDProvidesAllThreeRoomsAndUniqueClock() {
        let snapshots = TimeOfDay.allCases.map(\.snapshot)
        XCTAssertEqual(Set(snapshots.map(\.clock)).count, 3,
            "morning/evening/night must each have a distinct clock")
        for s in snapshots {
            XCTAssertGreaterThanOrEqual(s.daily.head, 0)
            XCTAssertGreaterThanOrEqual(s.stock.head, 0)
            XCTAssertGreaterThanOrEqual(s.job.head, 0)
            XCTAssertFalse(s.nickname.isEmpty)
        }
    }

    func testFromHourBuckets() {
        XCTAssertEqual(TimeOfDay.from(hour: 0),  .night)
        XCTAssertEqual(TimeOfDay.from(hour: 4),  .night)
        XCTAssertEqual(TimeOfDay.from(hour: 5),  .morning)
        XCTAssertEqual(TimeOfDay.from(hour: 10), .morning)
        XCTAssertEqual(TimeOfDay.from(hour: 11), .evening)
        XCTAssertEqual(TimeOfDay.from(hour: 21), .evening)
        XCTAssertEqual(TimeOfDay.from(hour: 22), .night)
        XCTAssertEqual(TimeOfDay.from(hour: 23), .night)
    }

    func testEveningPeakDailyBigger() {
        let m = TimeOfDay.morning.snapshot
        let e = TimeOfDay.evening.snapshot
        let n = TimeOfDay.night.snapshot
        XCTAssertGreaterThan(e.daily.head, n.daily.head, "evening daily room must be busier than night")
        XCTAssertGreaterThan(m.stock.head, e.stock.head, "morning stock peak vs evening cooldown")
    }
}
