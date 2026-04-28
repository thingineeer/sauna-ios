import SwiftUI
import DesignSystem

/// The brick-wall enclosure used by every "inside the sauna" screen.
/// Set `glowOnly = true` for the "lobby" screens (Home, Settings) which use the
/// dark gradient instead of the brick texture but keep the kiln glow.
public struct ClayWall<Content: View>: View {
    public let glowOnly: Bool
    @ViewBuilder public let content: () -> Content

    public init(glowOnly: Bool = false, @ViewBuilder content: @escaping () -> Content) {
        self.glowOnly = glowOnly
        self.content = content
    }

    public var body: some View {
        ZStack {
            if glowOnly {
                JjimGradient.roomDark.ignoresSafeArea()
            } else {
                ClayBrickPattern().ignoresSafeArea()
                JjimGradient.clayWall.ignoresSafeArea()
            }
            JjimGradient.ceilingGlowTop
                .ignoresSafeArea()
                .allowsHitTesting(false)
            JjimGradient.ceilingGlowBottom
                .ignoresSafeArea()
                .allowsHitTesting(false)
            content()
        }
        .background(JJIM.Bg.appDeep)
        .preferredColorScheme(.dark)
    }
}

/// Wood floor band — sits at the bottom of every room/onboarding screen.
public struct ClayFloor: View {
    public let height: CGFloat
    public init(height: CGFloat = 140) { self.height = height }
    public var body: some View {
        VStack {
            Spacer()
            ClayFloorPattern()
                .frame(height: height)
                .overlay(
                    Color.black.opacity(0.5)
                        .blendMode(.softLight)
                        .blur(radius: 6)
                        .frame(height: 16),
                    alignment: .top
                )
        }
        .allowsHitTesting(false)
    }
}

/// The small kiln-style ceiling lamp (top-right by default).
public struct ClayLamp: View {
    public let scale: CGFloat
    public init(scale: CGFloat = 1.0) { self.scale = scale }

    public var body: some View {
        let w = 32 * scale
        let h = 38 * scale
        return UnevenRoundedRectangle(
            topLeadingRadius: w / 2, bottomLeadingRadius: 8,
            bottomTrailingRadius: 8, topTrailingRadius: w / 2
        )
        .fill(
            RadialGradient(
                colors: [
                    JJIM.Clay.bright,
                    JJIM.Accent.primary,
                    JJIM.Accent.deepEnd,
                    Color(red: 0.353, green: 0.125, blue: 0.063),
                ],
                center: UnitPoint(x: 0.5, y: 0.7),
                startRadius: 0, endRadius: w
            )
        )
        .frame(width: w, height: h)
        .shadow(color: JJIM.Accent.primary.opacity(0.55), radius: 14)
        .overlay(
            UnevenRoundedRectangle(
                topLeadingRadius: w / 2, bottomLeadingRadius: 8,
                bottomTrailingRadius: 8, topTrailingRadius: w / 2
            )
            .stroke(Color(red: 0.314, green: 0.118, blue: 0.039).opacity(0.6), lineWidth: 1)
        )
    }
}
