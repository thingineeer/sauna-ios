import SwiftUI
import DesignSystem
import CustomIcons
import SharedUI

public struct JjimHome: View {
    public let timeOfDay: TimeOfDay
    public let onSelectRoom: (RoomVisualKind) -> Void
    public init(
        timeOfDay: TimeOfDay = .evening,
        onSelectRoom: @escaping (RoomVisualKind) -> Void = { _ in }
    ) {
        self.timeOfDay = timeOfDay
        self.onSelectRoom = onSelectRoom
    }

    public var body: some View {
        let data = timeOfDay.snapshot

        return ClayWall(glowOnly: true) {
            // top kiln glow band
            RadialGradient(
                colors: [JJIM.Clay.glow.opacity(0.18), .clear],
                center: UnitPoint(x: 0.5, y: 0.0),
                startRadius: 0, endRadius: 280
            )
            .ignoresSafeArea()
            .allowsHitTesting(false)

            VStack(alignment: .leading, spacing: 0) {
                // Header
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        JjimMonoTag("TODAY · \(data.clock)")
                        Text("어느 방에 앉을까?")
                            .font(.system(size: 26, weight: .heavy))
                            .kerning(-0.5)
                            .foregroundStyle(JJIM.Text.primary)
                    }
                    Spacer()
                    JjimAvatar(size: 44)
                }
                .padding(.top, 60)

                (
                    Text("오늘 너는 ")
                    + Text(data.nickname).bold().foregroundColor(JJIM.Accent.soft)
                )
                .font(.system(size: 12))
                .foregroundStyle(JJIM.Text.tertiary)
                .padding(.top, 8)

                // Cards
                VStack(spacing: 12) {
                    Button { onSelectRoom(.daily) } label: {
                        JjimRoomCard(
                            roomId: .daily, label: "일상 황토방", tag: "DAILY",
                            sub: "하루 흘려보내기",
                            head: data.daily.head, trend: data.daily.trend,
                            density: data.daily.density
                        )
                    }
                    .buttonStyle(.plain)

                    Button { onSelectRoom(.stock) } label: {
                        JjimRoomCard(
                            roomId: .stock, label: "주식 황토방", tag: "STOCK",
                            sub: "열받은 장 식히기",
                            head: data.stock.head, trend: data.stock.trend,
                            density: data.stock.density
                        )
                    }
                    .buttonStyle(.plain)

                    Button { onSelectRoom(.job) } label: {
                        JjimRoomCard(
                            roomId: .job, label: "취준 황토방", tag: "JOB",
                            sub: "면접 뒤끝 · 막막함",
                            head: data.job.head, trend: data.job.trend,
                            density: data.job.density
                        )
                    }
                    .buttonStyle(.plain)

                    SeasonRoomTeaser()
                }
                .padding(.top, 22)

                Spacer(minLength: 0)
            }
            .padding(.horizontal, 20)
        }
    }
}

private struct SeasonRoomTeaser: View {
    var body: some View {
        HStack(spacing: 14) {
            HStack(spacing: 8) {
                IcWorldCup(size: 22)
                IcMedal(size: 22)
            }
            .foregroundStyle(JJIM.Text.tertiary)
            .opacity(0.5)
            VStack(alignment: .leading, spacing: 1) {
                Text("시즌 방")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(JJIM.Text.tertiary)
                Text("이벤트마다 새 방이 열립니다")
                    .font(.system(size: 10.5))
                    .foregroundStyle(JJIM.Text.muted)
            }
            Spacer()
            Text("SOON")
                .font(.system(size: 9, weight: .regular, design: .monospaced))
                .tracking(1.5)
                .foregroundStyle(JJIM.Text.muted)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(JJIM.Surface.panelLight)
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [3, 3]))
                .foregroundStyle(JJIM.Clay.glow.opacity(0.28))
        )
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

#Preview("Morning") { JjimHome(timeOfDay: .morning).frame(width: 393, height: 852) }
#Preview("Evening") { JjimHome(timeOfDay: .evening).frame(width: 393, height: 852) }
#Preview("Night")   { JjimHome(timeOfDay: .night).frame(width: 393, height: 852) }
