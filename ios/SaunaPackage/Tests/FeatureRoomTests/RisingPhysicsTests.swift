import XCTest
import CoreGraphics
@testable import FeatureRoom

final class RisingPhysicsTests: XCTestCase {
    func testYStartAndEnd() {
        XCTAssertEqual(RisingPhysics.y(progress: 0.0), RisingPhysics.bottomY)
        XCTAssertEqual(RisingPhysics.y(progress: 1.0), RisingPhysics.topY)
        // Midway should be the midpoint of a linear interpolation.
        let mid = (RisingPhysics.bottomY + RisingPhysics.topY) / 2
        XCTAssertEqual(RisingPhysics.y(progress: 0.5), mid, accuracy: 0.01)
    }

    func testOpacityEnvelope() {
        XCTAssertEqual(RisingPhysics.opacity(progress: 0.0), 0.0, accuracy: 1e-6)
        XCTAssertEqual(RisingPhysics.opacity(progress: 0.05), 0.5, accuracy: 1e-6)
        XCTAssertEqual(RisingPhysics.opacity(progress: 0.1),  1.0, accuracy: 1e-6)
        XCTAssertEqual(RisingPhysics.opacity(progress: 0.5),  1.0, accuracy: 1e-6)
        XCTAssertEqual(RisingPhysics.opacity(progress: 0.72), 1.0, accuracy: 1e-6)
        XCTAssertEqual(RisingPhysics.opacity(progress: 1.0),  0.0, accuracy: 1e-6)
        // Halfway through fade-out (0.86) should give ~0.5 opacity
        XCTAssertEqual(RisingPhysics.opacity(progress: 0.86), 0.5, accuracy: 0.01)
    }

    func testBlurOnlyAtTheEnd() {
        XCTAssertEqual(RisingPhysics.blurRadius(progress: 0.0), 0)
        XCTAssertEqual(RisingPhysics.blurRadius(progress: 0.62), 0)
        XCTAssertGreaterThan(RisingPhysics.blurRadius(progress: 0.7), 0)
        XCTAssertEqual(RisingPhysics.blurRadius(progress: 1.0), (1 - 0.62) * 12, accuracy: 0.001)
    }

    func testScaleGrowsWithProgress() {
        XCTAssertEqual(RisingPhysics.scale(progress: 0.0), 0.9, accuracy: 1e-6)
        XCTAssertEqual(RisingPhysics.scale(progress: 1.0), 1.05, accuracy: 1e-6)
    }

    func testHorizontalSwayBoundedAroundAnchor() {
        // 12px maximum sway per the design.
        let xRel: CGFloat = 0.5
        let width: CGFloat = 393
        let anchor = xRel * width
        for t in stride(from: 0.0, to: 1.0, by: 0.05) {
            let x = RisingPhysics.x(width: width, xRel: xRel, progress: t, jitterSeed: 7)
            XCTAssertLessThanOrEqual(abs(x - anchor), 12.0,
                "horizontal sway out of bounds at t=\(t): \(x - anchor)")
        }
    }
}
