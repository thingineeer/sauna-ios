import SwiftUI
import DesignSystem
import CustomIcons
import SharedUI
import WebViewBridge

@Observable
@MainActor
public final class SettingsViewModel {
    public var roomPeakNotif: Bool = true
    public var quietHours: String = "22:00 ~ 07:00"
    public var vibrate: Bool = true
    public var alwaysDark: Bool = true
    public var reduceMotion: Bool = false
    public var fontSize: String = "중간"
    public var aboutSheetOpen: Bool = false

    public init() {}

    public func resetData() {
        // No-op in v1: 데이터 자체를 안 남김. The row is informational.
    }
}

public struct JjimSettings: View {
    @State private var vm = SettingsViewModel()
    public init() {}

    public var body: some View {
        ClayWall(glowOnly: true) {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    Spacer().frame(height: 60)
                    JjimMonoTag("PREFERENCES")
                    Text("설정")
                        .font(.system(size: 26, weight: .heavy))
                        .kerning(-0.5)
                        .foregroundStyle(JJIM.Text.primary)
                        .padding(.top, 4)

                    SettingGroup(title: "알림") {
                        SettingRow(icon: AnyView(IcBell(size: 18)), label: "방 피크 알림",
                                    toggle: Binding(get: { vm.roomPeakNotif },
                                                      set: { vm.roomPeakNotif = $0 }))
                        SettingRow(icon: AnyView(IcMoon(size: 18)), label: "야간 모드",
                                    value: vm.quietHours)
                        SettingRow(icon: AnyView(IcVibrate(size: 18)), label: "진동",
                                    toggle: Binding(get: { vm.vibrate },
                                                      set: { vm.vibrate = $0 }), last: true)
                    }

                    SettingGroup(title: "경험") {
                        SettingRow(icon: AnyView(IcContrast(size: 18)), label: "다크 모드",
                                    value: vm.alwaysDark ? "항상 켜짐" : "꺼짐")
                        SettingRow(icon: AnyView(IcMotion(size: 18)), label: "모션 줄이기",
                                    toggle: Binding(get: { vm.reduceMotion },
                                                      set: { vm.reduceMotion = $0 }))
                        SettingRow(icon: AnyView(IcType(size: 18)), label: "폰트 크기",
                                    value: vm.fontSize, last: true)
                    }

                    SettingGroup(title: "계정") {
                        SettingRow(icon: AnyView(IcTrash(size: 18)), label: "데이터 삭제",
                                    value: "기록 없음", muted: true)
                        SettingRow(icon: AnyView(IcInfo(size: 18)), label: "Sauna란?",
                                    value: "v 0.1", last: true,
                                    onTap: { vm.aboutSheetOpen = true })
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 100)
            }
        }
        .sheet(isPresented: Binding(get: { vm.aboutSheetOpen },
                                      set: { vm.aboutSheetOpen = $0 })) {
            // WebKit-only sheet for the About page
            #if canImport(WebKit) && canImport(UIKit)
            // swiftlint:disable:next force_unwrapping
            SaunaWebView(url: URL(string: "https://sauna.app/about")!)
                .ignoresSafeArea()
            #else
            VStack(spacing: 14) {
                Text("Sauna란?")
                    .font(.system(size: 22, weight: .heavy))
                Text("WebKit이 없는 환경에서는 표시되지 않습니다.")
                    .font(.system(size: 13))
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            #endif
        }
    }
}

struct SettingGroup<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(title.uppercased())
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .tracking(2)
                .foregroundStyle(JJIM.Accent.warm)
                .padding(.leading, 4)
                .padding(.bottom, 8)
            VStack(spacing: 0) {
                content()
            }
            .background(JJIM.Surface.panel)
            .overlay(
                RoundedRectangle(cornerRadius: 14).stroke(JJIM.Surface.hairline, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .padding(.top, 22)
    }
}

struct SettingRow: View {
    let icon: AnyView?
    let label: String
    var toggle: Binding<Bool>?
    var value: String?
    var muted: Bool = false
    var last: Bool = false
    var onTap: (() -> Void)?

    var body: some View {
        Button(action: { onTap?() }) {
            HStack(spacing: 12) {
                ZStack {
                    if let icon = icon { icon.foregroundStyle(JJIM.Accent.soft) }
                }
                .frame(width: 22)
                Text(label)
                    .font(.system(size: 14))
                    .foregroundStyle(JJIM.Text.primary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                if let toggle {
                    JjimToggle(isOn: toggle)
                } else if let value {
                    HStack(spacing: 4) {
                        Text(value)
                            .font(.system(size: 12))
                            .foregroundStyle(muted ? JJIM.Text.muted : JJIM.Text.secondary)
                        IcChevron(size: 14)
                            .foregroundStyle(JJIM.Text.tertiary)
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 13)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .overlay(
            Rectangle().fill(Color(red: 1.0, green: 0.706, blue: 0.431).opacity(0.08))
                .frame(height: last ? 0 : 1),
            alignment: .bottom
        )
    }
}

private struct JjimToggle: View {
    @Binding var isOn: Bool
    var body: some View {
        Button {
            withAnimation(.easeInOut(duration: 0.2)) { isOn.toggle() }
        } label: {
            ZStack(alignment: isOn ? .trailing : .leading) {
                Capsule()
                    .fill(isOn
                          ? AnyShapeStyle(JjimGradient.ctaPrimary)
                          : AnyShapeStyle(Color(red: 0.235, green: 0.157, blue: 0.078).opacity(0.6)))
                    .frame(width: 44, height: 26)
                    .shadow(color: isOn ? JJIM.Accent.primary.opacity(0.4) : .clear, radius: 5)
                Circle().fill(.white)
                    .frame(width: 22, height: 22)
                    .shadow(color: .black.opacity(0.3), radius: 1, y: 2)
                    .padding(2)
            }
        }
        .buttonStyle(.plain)
    }
}

#Preview { JjimSettings().frame(width: 393, height: 852) }
