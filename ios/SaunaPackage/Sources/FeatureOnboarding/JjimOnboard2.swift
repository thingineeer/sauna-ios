import SwiftUI
import DesignSystem
import CustomIcons
import SharedUI

public struct JjimOnboard2: View {
    public let onNext: () -> Void
    public let onPrev: () -> Void
    public init(onNext: @escaping () -> Void = {}, onPrev: @escaping () -> Void = {}) {
        self.onNext = onNext
        self.onPrev = onPrev
    }

    private struct Rule { let icon: AnyView; let title: String; let desc: String }

    public var body: some View {
        let rules: [Rule] = [
            .init(icon: AnyView(IcArrowLeft(size: 22)),
                   title: "언제든 나가도 돼",
                   desc: "답답하면 그냥 뒤로. 시간 제한 없음."),
            .init(icon: AnyView(IcPerson(size: 22)),
                   title: "이름은 매일 바뀌어",
                   desc: "자정마다 새 닉네임. 어제 너랑 안 이어짐."),
            .init(icon: AnyView(IcSteam(size: 22)),
                   title: "메시지는 저장 안 돼",
                   desc: "올라오고, 떠다니고, 사라짐. 검색도 없음."),
            .init(icon: AnyView(IcDoor(size: 22)),
                   title: "방은 3개부터",
                   desc: "일상 · 주식 · 취준. 시즌 방은 가끔 열림."),
        ]

        return ClayWall {
            HStack { Spacer(); ClayLamp(scale: 0.8).padding(.trailing, 32).padding(.top, 88) }
                .frame(maxHeight: .infinity, alignment: .top)

            VStack(spacing: 0) {
                Spacer().frame(height: 100)
                VStack(spacing: 0) {
                    IcSteam(size: 48)
                        .foregroundStyle(JJIM.Accent.soft)
                        .opacity(0.85)
                        .padding(.bottom, 8)
                    JjimMonoTag("STEP 2 OF 3")
                    Text("말은 증기처럼 사라져")
                        .font(.system(size: 26, weight: .heavy))
                        .kerning(-0.4)
                        .foregroundStyle(JJIM.Text.primary)
                        .shadow(color: Color(red: 0.196, green: 0.059, blue: 0.0).opacity(0.85), radius: 4, y: 2)
                        .padding(.top, 10)
                }

                VStack(spacing: 10) {
                    ForEach(0..<rules.count, id: \.self) { i in
                        let r = rules[i]
                        HStack(alignment: .top, spacing: 14) {
                            r.icon
                                .foregroundStyle(JJIM.Accent.soft)
                                .padding(.top, 2)
                            VStack(alignment: .leading, spacing: 3) {
                                Text(r.title)
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundStyle(JJIM.Text.primary)
                                Text(r.desc)
                                    .font(.system(size: 12))
                                    .foregroundStyle(JJIM.Text.tertiary)
                                    .lineSpacing(2.5)
                            }
                            Spacer()
                        }
                        .padding(14)
                        .background(JJIM.Surface.panel)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(JJIM.Surface.hairline, lineWidth: 1)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 22)

                Spacer()
            }

            ClayFloor(height: 150)

            VStack {
                Spacer()
                JjimPagination(index: 1)
                    .padding(.bottom, 78)
                HStack(spacing: 10) {
                    ClayButton<EmptyView>("이전", style: .secondary, fullWidth: false, action: onPrev)
                        .frame(width: 86)
                    ClayButton<EmptyView>("다음", action: onNext)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 58)
            }
        }
    }
}

#Preview { JjimOnboard2().frame(width: 393, height: 852) }
