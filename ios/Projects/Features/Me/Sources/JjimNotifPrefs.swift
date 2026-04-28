import SwiftUI
import DesignSystem
import CustomIcons
import SharedUI

@Observable
@MainActor
public final class NotifPrefsViewModel {
    public var dailyPeak: Bool = true
    public var stockPeak: Bool = true
    public var jobPeak: Bool = false
    public var cooldown: String = "최소 2시간"
    public var quietHours: String = "22:00 ~ 07:00"
    public init() {}
}

public struct JjimNotifPrefs: View {
    @State private var vm = NotifPrefsViewModel()
    public let onBack: () -> Void
    public init(onBack: @escaping () -> Void = {}) { self.onBack = onBack }

    public var body: some View {
        ClayWall(glowOnly: true) {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    Spacer().frame(height: 60)
                    Button(action: onBack) {
                        HStack(spacing: 4) {
                            Text("‹").font(.system(size: 16))
                            Text("설정").font(.system(size: 13))
                        }
                        .foregroundStyle(JJIM.Accent.warm)
                    }
                    .buttonStyle(.plain)

                    Text("알림")
                        .font(.system(size: 26, weight: .heavy))
                        .kerning(-0.5)
                        .foregroundStyle(JJIM.Text.primary)
                        .padding(.top, 8)
                    Text("방이 붐비는 순간 짧게 알려줍니다. 너무 자주 오지 않도록 조정.")
                        .font(.system(size: 12))
                        .foregroundStyle(JJIM.Text.tertiary)
                        .lineSpacing(3)
                        .padding(.top, 4)

                    // PREVIEW
                    VStack(alignment: .leading, spacing: 8) {
                        Text("PREVIEW")
                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                            .tracking(2)
                            .foregroundStyle(JJIM.Accent.warm)

                        HStack(alignment: .top, spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 9)
                                    .fill(JjimGradient.ctaPrimary)
                                    .frame(width: 36, height: 36)
                                IcSaunaMark(size: 22)
                                    .foregroundStyle(Color(red: 0.165, green: 0.063, blue: 0.0))
                            }
                            VStack(alignment: .leading, spacing: 2) {
                                HStack {
                                    Text("Sauna")
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundStyle(JJIM.Text.primary)
                                    Spacer()
                                    Text("지금")
                                        .font(.system(size: 10))
                                        .foregroundStyle(JJIM.Text.tertiary)
                                }
                                HStack(alignment: .firstTextBaseline, spacing: 5) {
                                    IcStock(size: 13)
                                        .foregroundStyle(Color(red: 1.0, green: 0.541, blue: 0.314))
                                    Text("주식방이 꽉 차 있어 (312명). 잠깐 앉았다 갈래?")
                                        .font(.system(size: 12.5))
                                        .foregroundStyle(Color(red: 1.0, green: 0.902, blue: 0.784))
                                        .lineSpacing(2)
                                }
                            }
                        }
                        .padding(14)
                        .background(.ultraThinMaterial)
                        .background(Color.white.opacity(0.08))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color.white.opacity(0.12), lineWidth: 1)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                    }
                    .padding(.top, 22)

                    SettingGroup(title: "방별 알림") {
                        SettingRow(icon: AnyView(IcDaily(size: 18)),
                                    label: "일상 방 피크",
                                    toggle: Binding(get: { vm.dailyPeak },
                                                      set: { vm.dailyPeak = $0 }))
                        SettingRow(icon: AnyView(IcStock(size: 18)),
                                    label: "주식 방 피크",
                                    toggle: Binding(get: { vm.stockPeak },
                                                      set: { vm.stockPeak = $0 }))
                        SettingRow(icon: AnyView(IcJob(size: 18)),
                                    label: "취준 방 피크",
                                    toggle: Binding(get: { vm.jobPeak },
                                                      set: { vm.jobPeak = $0 }), last: true)
                    }

                    SettingGroup(title: "빈도") {
                        SettingRow(icon: AnyView(IcClock(size: 18)),
                                    label: "쿨다운", value: vm.cooldown)
                        SettingRow(icon: AnyView(IcMoon(size: 18)),
                                    label: "야간 방해금지", value: vm.quietHours, last: true)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 100)
            }
        }
    }
}

#Preview { JjimNotifPrefs().frame(width: 393, height: 852) }
