import SwiftUI
import DesignSystem
import CustomIcons
import PixelMascot
import SharedUI

public struct JjimSplash: View {
    public init() {}
    public var body: some View {
        ClayWall {
            // central radial glow behind logo
            RadialGradient(
                colors: [Color(red: 1.0, green: 0.59, blue: 0.235).opacity(0.25), .clear],
                center: .center, startRadius: 0, endRadius: 280
            )
            .ignoresSafeArea()
            .allowsHitTesting(false)

            VStack(spacing: 20) {
                // 황토 가마 형태 로고
                ZStack {
                    UnevenRoundedRectangle(
                        topLeadingRadius: 48, bottomLeadingRadius: 18,
                        bottomTrailingRadius: 18, topTrailingRadius: 48
                    )
                    .fill(
                        RadialGradient(
                            colors: [
                                JJIM.Clay.bright,
                                JJIM.Accent.primary,
                                JJIM.Accent.deepEnd,
                                Color(red: 0.353, green: 0.125, blue: 0.063),
                            ],
                            center: UnitPoint(x: 0.5, y: 0.65),
                            startRadius: 0, endRadius: 96
                        )
                    )
                    .frame(width: 96, height: 96)
                    .shadow(color: JJIM.Accent.primary.opacity(0.55), radius: 25)

                    IcSaunaMark(size: 52)
                        .foregroundStyle(Color(red: 0.165, green: 0.063, blue: 0.0))
                }

                Text("Sauna")
                    .font(.system(size: 34, weight: .heavy))
                    .kerning(-0.8)
                    .foregroundStyle(JJIM.Text.primary)
                    .shadow(color: JJIM.Accent.primary.opacity(0.45), radius: 7, y: 2)

                JjimMonoTag("땀 · 수다 · 휘발")

                PixelMascotView(pose: .idle, tone: .warm, size: 16, scale: 3)
                    .padding(.top, 18)
                    .shadow(color: .black.opacity(0.7), radius: 4, y: 4)
            }
            .frame(maxHeight: .infinity)

            ClayFloor(height: 120)

            VStack {
                Spacer()
                Text("v 0.1 · 익명 휘발성 대화")
                    .font(.system(size: 11))
                    .foregroundStyle(JJIM.Text.muted)
                    .padding(.bottom, 38)
            }
        }
    }
}

#Preview { JjimSplash().frame(width: 393, height: 852) }
