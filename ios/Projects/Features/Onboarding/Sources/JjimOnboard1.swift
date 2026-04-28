import SwiftUI
import DesignSystem
import CustomIcons
import PixelMascot
import SharedUI

public struct JjimOnboard1: View {
    public let onNext: () -> Void
    public let onSkip: () -> Void
    public init(onNext: @escaping () -> Void = {}, onSkip: @escaping () -> Void = {}) {
        self.onNext = onNext
        self.onSkip = onSkip
    }
    public var body: some View {
        ClayWall {
            HStack {
                ClayLamp(scale: 0.8).padding(.leading, 32).padding(.top, 88)
                Spacer()
                ClayLamp(scale: 0.8).padding(.trailing, 32).padding(.top, 88)
            }
            .frame(maxHeight: .infinity, alignment: .top)

            VStack(spacing: 0) {
                Spacer().frame(height: 100)
                JjimMonoTag("STEP 1 OF 3")
                Text("여긴 황토방이야")
                    .font(.system(size: 30, weight: .heavy))
                    .kerning(-0.6)
                    .foregroundStyle(JJIM.Text.primary)
                    .shadow(color: Color(red: 0.196, green: 0.059, blue: 0.0).opacity(0.85), radius: 4, y: 2)
                    .padding(.top, 14)
                (
                    Text("뜨거운 황토 벽돌방에 앉아서\n얼굴 모르는 사람들이랑\n")
                    + Text("땀 흘리듯").bold().foregroundColor(JJIM.Accent.soft)
                    + Text(" 말을 뱉는 곳.")
                )
                .multilineTextAlignment(.center)
                .font(.system(size: 15))
                .foregroundStyle(JJIM.Text.secondary)
                .lineSpacing(6)
                .padding(.top, 18)
                .padding(.horizontal, 28)
                .shadow(color: .black.opacity(0.6), radius: 1.5, y: 1)

                Spacer()

                // 콩이 졸기 자세
                PixelMascotView(pose: .doze, tone: .warm, size: 32, scale: 5)
                    .shadow(color: .black.opacity(0.7), radius: 4, y: 4)
                    .padding(.bottom, 16)

                // 증기 장식
                HStack(spacing: 18) {
                    IcSteam(size: 32)
                    IcSteam(size: 48)
                    IcSteam(size: 32)
                }
                .foregroundStyle(JJIM.Accent.soft)
                .opacity(0.32)
                .padding(.bottom, 80)
            }
            .frame(maxWidth: .infinity)

            ClayFloor(height: 210)

            VStack {
                Spacer()
                JjimPagination(index: 0)
                    .padding(.bottom, 78)
                HStack(spacing: 10) {
                    ClayButton<EmptyView>("건너뛰기", style: .secondary, fullWidth: false, action: onSkip)
                        .frame(width: 96)
                    ClayButton<EmptyView>("다음", action: onNext)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 58)
            }
        }
    }
}

#Preview { JjimOnboard1().frame(width: 393, height: 852) }
