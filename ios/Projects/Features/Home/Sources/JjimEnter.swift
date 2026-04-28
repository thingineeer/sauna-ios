import SwiftUI
import DesignSystem
import CustomIcons
import SharedUI

/// "Door opening" transition from Home → Room. Visual only — for v1 the actual
/// navigation animation happens in App layer; this view is the state shown
/// during the brief 입탕 wait.
public struct JjimEnter: View {
    public let roomTag: String
    public let progress: Double  // 0...1
    public init(roomTag: String = "ENTERING DAILY", progress: Double = 0.65) {
        self.roomTag = roomTag
        self.progress = progress
    }

    public var body: some View {
        ClayWall {
            RadialGradient(
                colors: [JJIM.Accent.warm.opacity(0.4), .clear],
                center: .center, startRadius: 0, endRadius: 240
            )
            .ignoresSafeArea()
            .allowsHitTesting(false)

            VStack(spacing: 22) {
                Spacer()
                ZStack {
                    UnevenRoundedRectangle(
                        topLeadingRadius: 50, bottomLeadingRadius: 18,
                        bottomTrailingRadius: 18, topTrailingRadius: 50
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
                            startRadius: 0, endRadius: 100
                        )
                    )
                    .frame(width: 100, height: 100)
                    .shadow(color: JJIM.Accent.primary.opacity(0.5), radius: 18)
                    IcDoor(size: 56)
                        .foregroundStyle(Color(red: 1.0, green: 0.78, blue: 0.439))
                }

                JjimMonoTag(roomTag, color: JJIM.Accent.primary)

                Text("황토 문을 엽니다…")
                    .font(.system(size: 22, weight: .bold))
                    .kerning(-0.3)
                    .foregroundStyle(JJIM.Text.primary)

                Capsule()
                    .fill(JJIM.Accent.warm.opacity(0.18))
                    .frame(width: 140, height: 3)
                    .overlay(
                        GeometryReader { geo in
                            Capsule()
                                .fill(LinearGradient(colors: [JJIM.Accent.warm, JJIM.Accent.deepEnd],
                                                       startPoint: .leading, endPoint: .trailing))
                                .frame(width: geo.size.width * progress)
                                .shadow(color: JJIM.Accent.warm.opacity(0.7), radius: 6)
                        }
                    )

                Text("따뜻한 황토 열기가 얼굴에 닿아요")
                    .font(.system(size: 11))
                    .foregroundStyle(JJIM.Text.tertiary)

                Spacer()
            }
        }
    }
}

#Preview { JjimEnter().frame(width: 393, height: 852) }
