import SwiftUI
import DesignSystem
import CustomIcons
import PixelMascot
import SharedUI

public struct JjimOnboard3: View {
    public let nicknameValue: String
    public let nicknameTag: String
    public let onNext: () -> Void
    public let onReroll: () -> Void

    public init(
        nicknameValue: String = "노곤한사슴",
        nicknameTag: String = "4F29",
        onNext: @escaping () -> Void = {},
        onReroll: @escaping () -> Void = {}
    ) {
        self.nicknameValue = nicknameValue
        self.nicknameTag = nicknameTag
        self.onNext = onNext
        self.onReroll = onReroll
    }

    public var body: some View {
        ClayWall {
            HStack { Spacer(); ClayLamp(scale: 0.8).padding(.trailing, 32).padding(.top, 88) }
                .frame(maxHeight: .infinity, alignment: .top)

            VStack(spacing: 0) {
                Spacer().frame(height: 100)
                JjimMonoTag("STEP 3 OF 3")
                Text("오늘의 너는")
                    .font(.system(size: 26, weight: .heavy))
                    .kerning(-0.4)
                    .foregroundStyle(JJIM.Text.primary)
                    .shadow(color: Color(red: 0.196, green: 0.059, blue: 0.0).opacity(0.85), radius: 4, y: 2)
                    .padding(.top, 10)

                // Nickname card
                VStack(spacing: 0) {
                    PixelMascotView(pose: .idle, tone: .warm, size: 32, scale: 4)
                        .shadow(color: .black.opacity(0.5), radius: 3, y: 3)
                        .padding(.bottom, 14)

                    Text(nicknameValue)
                        .font(.system(size: 26, weight: .heavy))
                        .kerning(-0.4)
                        .foregroundStyle(JJIM.Accent.soft)
                        .shadow(color: JJIM.Accent.warm.opacity(0.55), radius: 11)

                    Text("#\(nicknameTag)")
                        .font(.system(size: 11, weight: .regular, design: .monospaced))
                        .tracking(1.5)
                        .foregroundStyle(JJIM.Text.tertiary)
                        .padding(.top, 4)

                    Text("내일 자정이 되면 새 이름이 와. 오늘 무슨 말을 해도 내일의 너랑은 연결되지 않아.")
                        .font(.system(size: 11.5))
                        .foregroundStyle(JJIM.Text.secondary)
                        .multilineTextAlignment(.center)
                        .lineSpacing(3.5)
                        .padding(14)
                        .background(Color(red: 0.078, green: 0.031, blue: 0.008).opacity(0.5))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .padding(.top, 18)
                        .padding(.horizontal, 6)
                }
                .padding(20)
                .padding(.vertical, 8)
                .background(JjimGradient.card)
                .overlay(
                    RoundedRectangle(cornerRadius: JJIM.Radius.xxl)
                        .stroke(JJIM.Surface.hairlineStrong, lineWidth: 1.5)
                )
                .clipShape(RoundedRectangle(cornerRadius: JJIM.Radius.xxl))
                .padding(.horizontal, 24)
                .padding(.top, 28)
                .shadow(color: .black.opacity(0.5), radius: 16, y: 6)

                Button(action: onReroll) {
                    HStack(spacing: 6) {
                        IcDice(size: 14)
                        Text("다시 뽑기 (오늘 1회)")
                    }
                    .font(.system(size: 12))
                    .foregroundStyle(JJIM.Text.tertiary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                }
                .buttonStyle(.plain)
                .padding(.top, 14)

                Spacer()
            }

            ClayFloor(height: 130)

            VStack {
                Spacer()
                JjimPagination(index: 2).padding(.bottom, 78)
                ClayButton("다음 — 패스키 등록", action: onNext) {
                    IcDoor(size: 18)
                        .foregroundStyle(Color(red: 0.165, green: 0.063, blue: 0.0))
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 58)
            }
        }
    }
}

#Preview { JjimOnboard3().frame(width: 393, height: 852) }
