import SwiftUI
import DesignSystem
import CustomIcons
import PixelMascot
import SharedUI

public struct JjimPasskey3: View {
    public let nickname: String
    public let onEnter: () -> Void
    public init(nickname: String = "노곤한사슴", onEnter: @escaping () -> Void = {}) {
        self.nickname = nickname
        self.onEnter = onEnter
    }

    public var body: some View {
        ClayWall {
            RadialGradient(
                colors: [JJIM.Accent.primary.opacity(0.32), .clear],
                center: UnitPoint(x: 0.5, y: 0.4),
                startRadius: 0, endRadius: 320
            )
            .ignoresSafeArea()
            .allowsHitTesting(false)

            VStack(spacing: 0) {
                Spacer()

                // 가마 + 체크
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
                    .shadow(color: JJIM.Accent.primary.opacity(0.55), radius: 25)

                    Canvas { ctx, sz in
                        var p = Path()
                        p.move(to: CGPoint(x: 10, y: 24))
                        p.addLine(to: CGPoint(x: 20, y: 32))
                        p.addLine(to: CGPoint(x: 36, y: 14))
                        ctx.stroke(p,
                            with: .color(Color(red: 0.165, green: 0.063, blue: 0.0)),
                            style: StrokeStyle(lineWidth: 4.5, lineCap: .round, lineJoin: .round))
                        _ = sz
                    }
                    .frame(width: 46, height: 46)
                }
                .padding(.bottom, 16)

                JjimMonoTag("PASSKEY READY")
                Text("이제 들어갈 준비 끝")
                    .font(.system(size: 28, weight: .heavy))
                    .kerning(-0.5)
                    .foregroundStyle(JJIM.Text.primary)
                    .shadow(color: JJIM.Accent.primary.opacity(0.4), radius: 9, y: 2)
                    .padding(.top, 10)

                (
                    Text("닉네임 ")
                    + Text(nickname).bold().foregroundColor(JJIM.Accent.soft)
                    + Text("으로\n오늘 자정까지 활동해.")
                )
                .multilineTextAlignment(.center)
                .font(.system(size: 14))
                .foregroundStyle(JJIM.Text.secondary)
                .lineSpacing(4)
                .padding(.top, 14)

                PixelMascotView(pose: .peek, tone: .warm, size: 16, scale: 4)
                    .padding(.top, 22)
                    .shadow(color: .black.opacity(0.6), radius: 3, y: 3)

                Spacer()
            }

            ClayFloor(height: 130)

            VStack {
                Spacer()
                ClayButton("황토방 들어가기", action: onEnter) {
                    IcDoor(size: 18)
                        .foregroundStyle(Color(red: 0.165, green: 0.063, blue: 0.0))
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 58)
            }
        }
    }
}

#Preview { JjimPasskey3().frame(width: 393, height: 852) }
