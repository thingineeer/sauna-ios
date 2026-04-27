import XCTest
import SwiftUI
@testable import DesignSystem

final class JJIMTokenTests: XCTestCase {
    /// Tokens must remain stable — accidental color drift is a visual regression.
    func testClayBaseHex() throws {
        let c = JJIM.Clay.base
        let (r, g, b) = try Self.rgb(of: c)
        XCTAssertEqual(r, 0.722, accuracy: 0.01)
        XCTAssertEqual(g, 0.416, accuracy: 0.01)
        XCTAssertEqual(b, 0.251, accuracy: 0.01)
    }

    func testTextPrimaryIsCream() throws {
        let (r, g, b) = try Self.rgb(of: JJIM.Text.primary)
        XCTAssertEqual(r, 1.000, accuracy: 0.01)
        XCTAssertEqual(g, 0.910, accuracy: 0.01)
        XCTAssertEqual(b, 0.784, accuracy: 0.01)
    }

    func testRadiusScaleMonotonic() {
        XCTAssertLessThan(JJIM.Radius.sm, JJIM.Radius.md)
        XCTAssertLessThan(JJIM.Radius.md, JJIM.Radius.lg)
        XCTAssertLessThan(JJIM.Radius.lg, JJIM.Radius.xl)
        XCTAssertLessThan(JJIM.Radius.xl, JJIM.Radius.xxl)
    }

    func testSpacingScaleMonotonic() {
        XCTAssertLessThan(JJIM.Spacing.xs, JJIM.Spacing.sm)
        XCTAssertLessThan(JJIM.Spacing.sm, JJIM.Spacing.md)
        XCTAssertLessThan(JJIM.Spacing.md, JJIM.Spacing.lg)
        XCTAssertLessThan(JJIM.Spacing.lg, JJIM.Spacing.xl)
    }

    // MARK: - helpers
    private static func rgb(of color: Color) throws -> (Double, Double, Double) {
        #if canImport(UIKit)
        let ui = UIColor(color)
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        guard ui.getRed(&r, green: &g, blue: &b, alpha: &a) else {
            throw NSError(domain: "rgb", code: -1)
        }
        return (Double(r), Double(g), Double(b))
        #else
        throw NSError(domain: "noUIKit", code: -1)
        #endif
    }
}
