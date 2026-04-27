import SwiftUI
import DesignSystem

/// Round avatar with the kiln gradient + a small person silhouette.
/// Used in Home (top-right) and Profile.
public struct JjimAvatar: View {
    public let size: CGFloat
    public init(size: CGFloat = 44) { self.size = size }

    public var body: some View {
        ZStack {
            Circle()
                .fill(JjimGradient.avatarKiln)
                .overlay(
                    Circle().stroke(Color.white.opacity(0.25), lineWidth: 1)
                        .blendMode(.softLight)
                )

            Canvas { ctx, sz in
                let scale = size * 0.5 / 24
                let originX = (sz.width - 24 * scale) / 2
                let originY = (sz.height - 24 * scale) / 2
                func P(_ x: CGFloat, _ y: CGFloat) -> CGPoint {
                    .init(x: originX + x * scale, y: originY + y * scale)
                }
                let head = Path(ellipseIn: CGRect(
                    x: P(8.6, 5.6).x, y: P(8.6, 5.6).y,
                    width: 6.8 * scale, height: 6.8 * scale
                ))
                ctx.fill(head, with: .color(Color(red: 0.165, green: 0.063, blue: 0.0)))
                var torso = Path()
                torso.move(to: P(5, 19))
                torso.addQuadCurve(to: P(19, 19), control: P(12, 14))
                torso.addLine(to: P(19, 22))
                torso.addLine(to: P(5, 22))
                torso.closeSubpath()
                ctx.fill(torso, with: .color(Color(red: 0.165, green: 0.063, blue: 0.0)))
            }
        }
        .frame(width: size, height: size)
        .shadow(color: .black.opacity(0.35), radius: 4, y: 2)
    }
}
