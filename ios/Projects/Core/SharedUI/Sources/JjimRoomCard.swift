import SwiftUI
import DesignSystem
import CustomIcons

public struct JjimRoomCard: View {
    public let roomId: RoomVisualKind
    public let label: String
    public let tag: String
    public let sub: String
    public let head: Int
    public let trend: Int
    public let density: String

    public init(
        roomId: RoomVisualKind,
        label: String, tag: String, sub: String,
        head: Int, trend: Int, density: String
    ) {
        self.roomId = roomId
        self.label = label
        self.tag = tag
        self.sub = sub
        self.head = head
        self.trend = trend
        self.density = density
    }

    public var body: some View {
        let accent = roomId.accent
        let barFill = min(1, Double(head) / 300.0)

        ZStack(alignment: .topLeading) {
            // background panel + ghost icon
            RoundedRectangle(cornerRadius: JJIM.Radius.xl)
                .fill(JjimGradient.card)
                .overlay(
                    RoundedRectangle(cornerRadius: JJIM.Radius.xl)
                        .stroke(JJIM.Surface.hairlineStrong, lineWidth: 1)
                )
                .shadow(color: .black.opacity(0.4), radius: 7, y: 4)

            roomId.bigIcon
                .foregroundStyle(accent.opacity(0.18))
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .topTrailing)

            VStack(alignment: .leading, spacing: 6) {
                // tag pill
                HStack(spacing: 5) {
                    Circle().fill(accent).frame(width: 5, height: 5).shadow(color: accent, radius: 3)
                    Text(tag)
                        .font(.system(size: 9, weight: .bold, design: .monospaced))
                        .tracking(2)
                        .foregroundStyle(accent)
                }
                .padding(.horizontal, 8).padding(.vertical, 3)
                .background(accent.opacity(0.13))
                .overlay(
                    RoundedRectangle(cornerRadius: 5)
                        .stroke(accent.opacity(0.33), lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: 5))

                // title + small icon
                HStack(spacing: 8) {
                    Text(label)
                        .font(.system(size: 21, weight: .heavy))
                        .kerning(-0.4)
                        .foregroundStyle(JJIM.Text.primary)
                    roomId.smallIcon
                        .foregroundStyle(accent.opacity(0.75))
                }

                Text(sub)
                    .font(.system(size: 12))
                    .foregroundStyle(JJIM.Text.tertiary)

                // bar + headcount
                HStack(spacing: 10) {
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule().fill(Color(red: 0.078, green: 0.031, blue: 0.008).opacity(0.6))
                            Capsule()
                                .fill(LinearGradient(colors: [accent, accent.opacity(0.7)],
                                                       startPoint: .leading, endPoint: .trailing))
                                .frame(width: geo.size.width * barFill)
                                .shadow(color: accent.opacity(0.5), radius: 4)
                        }
                    }
                    .frame(height: 4)
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text("\(head)")
                            .font(.system(size: 16, weight: .heavy, design: .monospaced))
                            .foregroundStyle(accent)
                        Text("명")
                            .font(.system(size: 10))
                            .foregroundStyle(JJIM.Text.tertiary)
                        if trend != 0 {
                            HStack(spacing: 1) {
                                trendArrow
                                    .frame(width: 8, height: 8)
                                Text("\(abs(trend))")
                                    .font(.system(size: 10))
                            }
                            .foregroundStyle(trend > 0 ? JJIM.Accent.warm : Color(red: 0.6, green: 0.75, blue: 0.8))
                        }
                    }
                    .padding(.leading, 10)
                }
                .padding(.top, 8)

                Text(density)
                    .font(.system(size: 10.5))
                    .foregroundStyle(JJIM.Text.tertiary)
                    .padding(.top, 4)
            }
            .padding(.horizontal, 18)
            .padding(.top, 18)
            .padding(.bottom, 16)
        }
        .clipShape(RoundedRectangle(cornerRadius: JJIM.Radius.xl))
    }

    @ViewBuilder
    private var trendArrow: some View {
        if trend > 0 {
            Triangle().fill(JJIM.Accent.warm)
        } else {
            Triangle().fill(Color(red: 0.6, green: 0.75, blue: 0.8))
                .rotationEffect(.degrees(180))
        }
    }
}

private struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.midX, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        p.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        p.closeSubpath()
        return p
    }
}

/// Card-level visual identity per room. Decoupled from `Room.Kind` so
/// the SharedUI module doesn't import Domain.
public enum RoomVisualKind: Sendable {
    case daily, stock, job

    public var accent: Color {
        switch self {
        case .daily: return JJIM.Clay.glow
        case .stock: return Color(red: 1.0, green: 0.541, blue: 0.314)
        case .job:   return JJIM.Clay.bright
        }
    }

    @ViewBuilder @MainActor
    public var bigIcon: some View {
        switch self {
        case .daily: IcDaily(size: 64)
        case .stock: IcStock(size: 64)
        case .job:   IcJob(size: 64)
        }
    }

    @ViewBuilder @MainActor
    public var smallIcon: some View {
        switch self {
        case .daily: IcDaily(size: 16)
        case .stock: IcStock(size: 16)
        case .job:   IcJob(size: 16)
        }
    }
}
