import SwiftUI
import DesignSystem
import CustomIcons

public enum JjimTab: String, CaseIterable, Sendable {
    case home, me, settings

    public var label: String {
        switch self {
        case .home:     return "방"
        case .me:       return "나"
        case .settings: return "설정"
        }
    }
}

public struct JjimTabBar: View {
    public let active: JjimTab
    public let onSelect: (JjimTab) -> Void

    public init(active: JjimTab, onSelect: @escaping (JjimTab) -> Void = { _ in }) {
        self.active = active
        self.onSelect = onSelect
    }

    public var body: some View {
        HStack(alignment: .top) {
            ForEach(JjimTab.allCases, id: \.self) { tab in
                let on = tab == active
                Button {
                    onSelect(tab)
                } label: {
                    VStack(spacing: 4) {
                        icon(for: tab)
                            .frame(width: 22, height: 22)
                        Text(tab.label)
                            .font(.system(size: 10, weight: .semibold))
                            .tracking(0.3)
                    }
                    .foregroundStyle(on ? JJIM.Accent.soft : JJIM.Text.muted)
                    .padding(.horizontal, 14)
                    .padding(.top, 4)
                    .frame(minWidth: 60)
                }
                .buttonStyle(.plain)
                Spacer(minLength: 0)
            }
        }
        .padding(.top, 10)
        .padding(.bottom, 32)
        .frame(height: 92)
        .background(
            LinearGradient(
                colors: [
                    Color(red: 0.157, green: 0.071, blue: 0.031).opacity(0.7),
                    Color(red: 0.059, green: 0.024, blue: 0.008).opacity(0.98),
                ],
                startPoint: .top, endPoint: UnitPoint(x: 0.5, y: 0.6)
            )
        )
        .overlay(
            Rectangle().fill(JJIM.Surface.hairline).frame(height: 1),
            alignment: .top
        )
    }

    @ViewBuilder
    private func icon(for tab: JjimTab) -> some View {
        switch tab {
        case .home:     IcDoor(size: 22)
        case .me:       IcPerson(size: 22)
        case .settings: IcGear(size: 22)
        }
    }
}
