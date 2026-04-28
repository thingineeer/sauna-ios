import XCTest
import DomainInterface
@testable import Domain

final class SlidingWindowRateLimiterTests: XCTestCase {
    func testTwoCallsInOneSecondAreOK() {
        let limiter = SlidingWindowRateLimiter(maxBurst: 2, window: 1.0)
        let t0 = Date(timeIntervalSinceReferenceDate: 0)
        XCTAssertNil(limiter.checkAndRecord(at: t0))
        XCTAssertNil(limiter.checkAndRecord(at: t0.addingTimeInterval(0.4)))
    }

    func testThirdCallInWindowIsRejected() {
        let limiter = SlidingWindowRateLimiter(maxBurst: 2, window: 1.0)
        let t0 = Date(timeIntervalSinceReferenceDate: 0)
        _ = limiter.checkAndRecord(at: t0)
        _ = limiter.checkAndRecord(at: t0.addingTimeInterval(0.2))
        let retry = limiter.checkAndRecord(at: t0.addingTimeInterval(0.5))
        XCTAssertNotNil(retry)
        XCTAssertEqual(retry!, 0.5, accuracy: 0.01,
                        "retry should be (1.0 - (0.5 - 0.0)) = 0.5")
    }

    func testWindowSlides() {
        let limiter = SlidingWindowRateLimiter(maxBurst: 2, window: 1.0)
        let t0 = Date(timeIntervalSinceReferenceDate: 0)
        _ = limiter.checkAndRecord(at: t0)
        _ = limiter.checkAndRecord(at: t0.addingTimeInterval(0.5))
        // After a full second from t0, the first record falls out of the window.
        XCTAssertNil(limiter.checkAndRecord(at: t0.addingTimeInterval(1.05)))
    }
}
