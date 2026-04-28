import XCTest
@testable import FeatureOnboarding

@MainActor
final class OnboardingFlowViewModelTests: XCTestCase {

    func testForwardPath() {
        let vm = OnboardingFlowViewModel()
        XCTAssertEqual(vm.step, .splash)
        vm.splashDidFinish();   XCTAssertEqual(vm.step, .onboard1)
        vm.goNext();            XCTAssertEqual(vm.step, .onboard2)
        vm.goNext();            XCTAssertEqual(vm.step, .onboard3)
        vm.goNext();            XCTAssertEqual(vm.step, .passkey1)
        vm.goNext();            XCTAssertEqual(vm.step, .passkey2)
        vm.goNext();            XCTAssertEqual(vm.step, .passkey3)
        vm.goNext();            XCTAssertEqual(vm.step, .done)
        vm.goNext();            XCTAssertEqual(vm.step, .done, "stays done past the end")
    }

    func testBackPath() {
        let vm = OnboardingFlowViewModel(initial: .passkey3)
        vm.goBack(); XCTAssertEqual(vm.step, .passkey2)
        vm.goBack(); XCTAssertEqual(vm.step, .passkey1)
        vm.goBack(); XCTAssertEqual(vm.step, .onboard3)
        vm.goBack(); XCTAssertEqual(vm.step, .onboard2)
        vm.goBack(); XCTAssertEqual(vm.step, .onboard1)
        vm.goBack(); XCTAssertEqual(vm.step, .onboard1, "onboard1 is the leftmost back stop")
    }

    func testSkipJumpsToPasskey1() {
        let vm = OnboardingFlowViewModel(initial: .onboard1)
        vm.skipOnboarding()
        XCTAssertEqual(vm.step, .passkey1)
    }

    func testRerollEnforcesDailyLimit() {
        let vm = OnboardingFlowViewModel()
        XCTAssertTrue(vm.rerollNickname(value: "쉬는고양이", tag: "ABCD"))
        XCTAssertEqual(vm.nicknameValue, "쉬는고양이")
        XCTAssertEqual(vm.nicknameTag, "ABCD")
        XCTAssertFalse(vm.rerollNickname(value: "다른이름", tag: "0000"),
                        "second reroll on same day must be rejected")
        XCTAssertEqual(vm.nicknameValue, "쉬는고양이", "rejected reroll keeps prior name")
    }

    func testSetNicknameAlwaysAllowed() {
        let vm = OnboardingFlowViewModel()
        vm.setNickname(value: "새이름", tag: "ABCD")
        XCTAssertEqual(vm.nicknameValue, "새이름")
        XCTAssertEqual(vm.nicknameTag, "ABCD")
        // setNickname should not consume reroll budget
        XCTAssertTrue(vm.rerollNickname(value: "다른", tag: "0001"))
    }
}
