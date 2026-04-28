import SwiftUI

/// Renders 콩이 (the sauna mascot) by walking a sprite grid and drawing
/// pixels via SwiftUI Canvas.
///
/// `size` picks 16×16 or 32×32 sprites; `scale` is integer pixel multiplier.
/// Smoothing is off (image-rendering: pixelated equivalent).
public struct PixelMascotView: View {
    public let pose: MascotPose
    public let tone: MascotTone
    public let size: Int    // 16 or 32
    public let scale: CGFloat

    public init(
        pose: MascotPose = .idle,
        tone: MascotTone = .warm,
        size: Int = 16,
        scale: CGFloat = 4
    ) {
        self.pose = pose
        self.tone = tone
        self.size = size
        self.scale = scale
    }

    private var grid: [String] {
        if size == 32, let g = Sprites32.grid(pose: pose, tone: tone) { return g }
        return Sprites16.grid(pose: pose, tone: tone)
    }

    public var body: some View {
        let gridLocal = grid
        let cells = gridLocal.count
        let s = scale
        Canvas(rendersAsynchronously: false) { ctx, _ in
            for (y, row) in gridLocal.enumerated() {
                for (x, ch) in row.enumerated() {
                    if let color = PixelPalette.color(for: ch) {
                        let r = CGRect(x: CGFloat(x) * s, y: CGFloat(y) * s, width: s, height: s)
                        ctx.fill(Path(r), with: .color(color))
                    }
                }
            }
        }
        .frame(width: CGFloat(cells) * s, height: CGFloat(cells) * s)
        .drawingGroup() // off-screen render so antialiasing of edges stays sharp
    }
}
