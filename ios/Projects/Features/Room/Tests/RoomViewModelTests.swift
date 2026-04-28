import XCTest
import Domain
import DomainInterface
@testable import FeatureRoom

@MainActor
final class RoomViewModelTests: XCTestCase {

    func testHeadcountByCrowd() {
        XCTAssertEqual(RoomViewModel(roomId: .daily, crowd: .lonely).headcount, 8)
        XCTAssertEqual(RoomViewModel(roomId: .daily, crowd: .medium).headcount, 142)
        XCTAssertEqual(RoomViewModel(roomId: .daily, crowd: .packed).headcount, 312)
    }

    func testSpawnIntervalsMatchDesign() {
        XCTAssertEqual(RoomViewModel(roomId: .daily, crowd: .lonely).spawnInterval, 3.2, accuracy: 0.01)
        XCTAssertEqual(RoomViewModel(roomId: .daily, crowd: .medium).spawnInterval, 1.4, accuracy: 0.01)
        XCTAssertEqual(RoomViewModel(roomId: .daily, crowd: .packed).spawnInterval, 0.7, accuracy: 0.01)
    }

    func testSpawnFromBankAddsBubble() {
        let now = Date(timeIntervalSinceReferenceDate: 0)
        let vm = RoomViewModel(
            roomId: .daily, crowd: .medium,
            clock: FixedClock(now),
            random: StubRandomGenerator(doubles: [0.3, 1.0], ints: [3])
        )
        let b = vm.spawnFromBank(isMine: false)
        XCTAssertEqual(vm.bubbles.count, 1)
        XCTAssertEqual(b.spawnAt, now)
        XCTAssertEqual(b.life, 8.5 + 1.0, accuracy: 0.0001,
                        "life = 8.5 + random(0...2.5) — second double drives it")
        XCTAssertEqual(b.xRel, 0.18 + 0.3, accuracy: 0.0001,
                        "xRel = 0.18 + random(0...0.64) — first double drives it")
    }

    func testCapsAtEightBubbles() {
        let vm = RoomViewModel(
            roomId: .daily, crowd: .medium,
            clock: FixedClock(.distantPast),
            random: StubRandomGenerator(doubles: Array(repeating: 0.5, count: 30),
                                          ints: Array(repeating: 0, count: 15))
        )
        for _ in 0..<12 { vm.spawnFromBank(isMine: false) }
        XCTAssertEqual(vm.bubbles.count, 8)
    }

    func testTickRemovesExpired() {
        let t0 = Date(timeIntervalSinceReferenceDate: 0)
        let clock = FixedClock(t0)
        let vm = RoomViewModel(
            roomId: .daily, crowd: .medium, clock: clock,
            random: StubRandomGenerator(doubles: [0.0, 0.0], ints: [0])
        )
        let b = vm.spawnFromBank(isMine: false)
        let life = b.life
        clock.advance(by: life + 0.1)
        vm.tick(now: clock.now())
        XCTAssertTrue(vm.bubbles.isEmpty)
    }

    func testSendInputAppendsBubbleAndClearsField() {
        let t0 = Date(timeIntervalSinceReferenceDate: 0)
        let vm = RoomViewModel(
            roomId: .daily, crowd: .medium,
            clock: FixedClock(t0),
            random: StubRandomGenerator(doubles: [0.5, 0.5])
        )
        vm.inputText = "  hello  "
        vm.sendInput()
        XCTAssertEqual(vm.bubbles.count, 1)
        XCTAssertEqual(vm.bubbles[0].text, "hello")
        XCTAssertEqual(vm.bubbles[0].nickname, "나")
        XCTAssertTrue(vm.bubbles[0].isMine)
        XCTAssertEqual(vm.inputText, "")
    }

    func testSendInputIgnoresWhitespace() {
        let vm = RoomViewModel(roomId: .daily, crowd: .medium,
                                clock: FixedClock(.distantPast),
                                random: StubRandomGenerator())
        vm.inputText = "   \n\t  "
        vm.sendInput()
        XCTAssertTrue(vm.bubbles.isEmpty)
    }
}
