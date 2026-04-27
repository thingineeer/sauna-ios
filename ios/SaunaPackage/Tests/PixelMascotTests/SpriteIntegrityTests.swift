import XCTest
@testable import PixelMascot

final class SpriteIntegrityTests: XCTestCase {
    /// 16x16 grids must all be exactly 16 rows of 16 chars.
    func testAll16Sprites() {
        for pose in MascotPose.allCases {
            let tone: MascotTone = (pose == .soak) ? .cool : .warm
            let g = Sprites16.grid(pose: pose, tone: tone)
            XCTAssertEqual(g.count, 16, "\(pose) rows")
            for (i, row) in g.enumerated() {
                XCTAssertEqual(row.count, 16, "\(pose) row \(i) width")
            }
        }
    }

    func test32SpriteIs32x32() throws {
        let g = try XCTUnwrap(Sprites32.grid(pose: .idle, tone: .warm))
        XCTAssertEqual(g.count, 32)
        for row in g { XCTAssertEqual(row.count, 32) }
    }

    func testFallbackOnUnknownComboReturnsIdle() {
        // Cool + idle isn't in the bank — should fall back to idle_warm.
        let g = Sprites16.grid(pose: .idle, tone: .cool)
        XCTAssertEqual(g, Sprites16.idleWarm)
    }

    func testPaletteCoversEverySpriteCharacter() {
        let allChars = MascotPose.allCases.reduce(Set<Character>()) { acc, pose in
            let tone: MascotTone = (pose == .soak) ? .cool : .warm
            return acc.union(Sprites16.grid(pose: pose, tone: tone).joined())
        }
        for ch in allChars where ch != "." {
            XCTAssertNotNil(PixelPalette.color(for: ch),
                "palette missing '\(ch)' — every non-'.' sprite char must have a color")
        }
    }
}
