import SwiftUI
import DesignSystem
import CustomIcons
import PixelMascot
import SharedUI

public struct JjimProfile: View {
    public let nicknameValue: String
    public let nicknameTag: String
    public let sessionsToday: Int
    public let minutesToday: Int
    public let sessionsThisWeek: Int
    public let regularRoom: String

    public init(
        nicknameValue: String = "노곤한사슴",
        nicknameTag: String = "4F29",
        sessionsToday: Int = 2,
        minutesToday: Int = 47,
        sessionsThisWeek: Int = 9,
        regularRoom: String = "일상"
    ) {
        self.nicknameValue = nicknameValue
        self.nicknameTag = nicknameTag
        self.sessionsToday = sessionsToday
        self.minutesToday = minutesToday
        self.sessionsThisWeek = sessionsThisWeek
        self.regularRoom = regularRoom
    }

    public var body: some View {
        ClayWall(glowOnly: true) {
            VStack(alignment: .leading, spacing: 0) {
                Spacer().frame(height: 60)
                JjimMonoTag("MY SAUNA")
                Text("나")
                    .font(.system(size: 26, weight: .heavy))
                    .kerning(-0.5)
                    .foregroundStyle(JJIM.Text.primary)
                    .padding(.top, 4)

                // identity card
                HStack(spacing: 16) {
                    PixelMascotView(pose: .idle, tone: .warm, size: 32, scale: 2.4)
                        .shadow(color: .black.opacity(0.6), radius: 2, y: 2)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(nicknameValue)
                            .font(.system(size: 18, weight: .heavy))
                            .kerning(-0.3)
                            .foregroundStyle(JJIM.Accent.soft)
                        Text("TODAY · #\(nicknameTag)")
                            .font(.system(size: 10, weight: .regular, design: .monospaced))
                            .tracking(1.5)
                            .foregroundStyle(JJIM.Text.tertiary)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 0) {
                        Text("내일 자정")
                        Text("새 이름")
                    }
                    .font(.system(size: 11))
                    .foregroundStyle(JJIM.Text.tertiary)
                    .lineSpacing(2)
                    .multilineTextAlignment(.trailing)
                }
                .padding(.horizontal, 18).padding(.vertical, 20)
                .background(JjimGradient.card)
                .overlay(
                    RoundedRectangle(cornerRadius: JJIM.Radius.lg)
                        .stroke(JJIM.Surface.hairlineStrong, lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: JJIM.Radius.lg))
                .padding(.top, 18)

                LazyVGrid(columns: [GridItem(.flexible(), spacing: 10),
                                      GridItem(.flexible())],
                            spacing: 10) {
                    StatCell(label: "오늘 세션", value: "\(sessionsToday)회")
                    StatCell(label: "오늘 앉은 시간", value: "\(minutesToday)분")
                    StatCell(label: "이번 주 세션", value: "\(sessionsThisWeek)회")
                    StatCell(label: "단골 방", value: regularRoom, trailingIcon: AnyView(IcDaily(size: 16)))
                }
                .padding(.top, 14)

                VStack(alignment: .leading, spacing: 4) {
                    JjimMonoTag("※ 기록은 남지 않아요", color: JJIM.Accent.warm)
                    Text("뱉은 말도, 읽은 말도 저장하지 않습니다. 위 숫자는 \"얼마나 앉아있었는지\"만.")
                        .font(.system(size: 12))
                        .foregroundStyle(JJIM.Text.secondary)
                        .lineSpacing(4)
                }
                .padding(16)
                .background(JJIM.Surface.panel)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(JJIM.Surface.hairline, lineWidth: 1))
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .padding(.top, 14)

                Spacer(minLength: 100)
            }
            .padding(.horizontal, 20)
        }
    }
}

private struct StatCell: View {
    let label: String
    let value: String
    var trailingIcon: AnyView? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.system(size: 11))
                .foregroundStyle(JJIM.Text.tertiary)
            HStack(spacing: 6) {
                Text(value)
                    .font(.system(size: 18, weight: .heavy))
                    .kerning(-0.3)
                    .foregroundStyle(JJIM.Text.primary)
                trailingIcon
                    .foregroundStyle(JJIM.Accent.soft)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 16).padding(.vertical, 14)
        .background(JJIM.Surface.panel)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(JJIM.Surface.hairline, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

#Preview { JjimProfile().frame(width: 393, height: 852) }
