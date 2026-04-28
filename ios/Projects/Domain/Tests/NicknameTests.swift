import XCTest
import DomainInterface
@testable import Domain

final class NicknameTests: XCTestCase {
    func testIsValidWindow() {
        let issuedAt = Date(timeIntervalSinceReferenceDate: 0)
        let expiresAt = issuedAt.addingTimeInterval(86400)
        let nick = Nickname(value: "노곤한사슴", tag: "4F29", issuedAt: issuedAt, expiresAt: expiresAt)

        XCTAssertTrue(nick.isValid(at: issuedAt))
        XCTAssertTrue(nick.isValid(at: issuedAt.addingTimeInterval(43200)))
        XCTAssertFalse(nick.isValid(at: expiresAt), "exact expiry boundary is invalid")
        XCTAssertFalse(nick.isValid(at: issuedAt.addingTimeInterval(-1)))
    }

    func testDisplayHandle() {
        let n = Nickname(value: "노곤한사슴", tag: "4F29",
                          issuedAt: .distantPast, expiresAt: .distantFuture)
        XCTAssertEqual(n.displayHandle, "노곤한사슴#4F29")
    }
}
