import XCTest
@testable import FeatureMe

@MainActor
final class SettingsViewModelTests: XCTestCase {
    func testDefaultsMatchDesign() {
        let vm = SettingsViewModel()
        XCTAssertTrue(vm.roomPeakNotif,  "default room peak notif on")
        XCTAssertTrue(vm.vibrate,        "default vibrate on")
        XCTAssertTrue(vm.alwaysDark,     "v1 is dark only")
        XCTAssertFalse(vm.reduceMotion,  "motion full by default")
        XCTAssertEqual(vm.fontSize, "중간")
        XCTAssertEqual(vm.quietHours, "22:00 ~ 07:00")
        XCTAssertFalse(vm.aboutSheetOpen)
    }

    func testToggling() {
        let vm = SettingsViewModel()
        vm.vibrate = false
        XCTAssertFalse(vm.vibrate)
    }
}

@MainActor
final class NotifPrefsViewModelTests: XCTestCase {
    func testDefaultsMatchDesignPreview() {
        let vm = NotifPrefsViewModel()
        XCTAssertTrue(vm.dailyPeak)
        XCTAssertTrue(vm.stockPeak)
        XCTAssertFalse(vm.jobPeak, "취준 방 피크는 디자인상 기본 OFF")
        XCTAssertEqual(vm.cooldown,   "최소 2시간")
        XCTAssertEqual(vm.quietHours, "22:00 ~ 07:00")
    }
}
