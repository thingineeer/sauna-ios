import XCTest
import DomainInterface
import Domain

/// Smoke check that the Domain types compose without surprises across module
/// boundaries — catches accidental access-control regressions early.
final class AppCompositionSmokeTests: XCTestCase {
    func testRoomKindCanBeUsedAcrossModules() {
        let r = Room(id: .daily, label: "일상", subtitle: "쉬자",
                              occupancy: 142, crowd: .medium)
        XCTAssertEqual(r.id, .daily)
    }
}
