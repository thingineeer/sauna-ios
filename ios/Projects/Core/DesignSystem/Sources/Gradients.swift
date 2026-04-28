import SwiftUI

public enum JjimGradient {
    /// Clay brick wall pattern — repeating horizontal bricks with vertical mortar.
    public static let clayWall = LinearGradient(
        gradient: Gradient(stops: [
            .init(color: Color(red: 0.31, green: 0.12, blue: 0.05).opacity(0.65), location: 0.00),
            .init(color: .clear, location: 0.18),
            .init(color: .clear, location: 0.65),
            .init(color: Color(red: 0.157, green: 0.071, blue: 0.020).opacity(0.60), location: 1.00),
        ]),
        startPoint: .top, endPoint: .bottom
    )

    /// Top-of-room kiln glow (radial).
    public static let ceilingGlowTop = RadialGradient(
        gradient: Gradient(colors: [
            Color(red: 1.000, green: 0.588, blue: 0.314).opacity(0.50),
            .clear,
        ]),
        center: UnitPoint(x: 0.5, y: -0.05),
        startRadius: 0,
        endRadius: 360
    )

    public static let ceilingGlowBottom = RadialGradient(
        gradient: Gradient(colors: [
            Color(red: 1.000, green: 0.549, blue: 0.235).opacity(0.18),
            .clear,
        ]),
        center: UnitPoint(x: 0.5, y: 1.00),
        startRadius: 0,
        endRadius: 360
    )

    /// Dark room (Home/Settings — sauna lobby feel, not the brick chamber).
    public static let roomDark = LinearGradient(
        gradient: Gradient(colors: [
            Color(red: 0.165, green: 0.078, blue: 0.031), // #2a1408
            Color(red: 0.102, green: 0.039, blue: 0.016), // #1a0a04
        ]),
        startPoint: .top, endPoint: .bottom
    )

    /// CTA button gradient.
    public static let ctaPrimary = LinearGradient(
        colors: [JJIM.Accent.warm, JJIM.Accent.deepEnd],
        startPoint: .top, endPoint: .bottom
    )

    /// Sikhye/glow round avatar.
    public static let avatarKiln = LinearGradient(
        colors: [JJIM.Clay.bright, JJIM.Accent.deepEnd],
        startPoint: .top, endPoint: .bottom
    )

    /// Card surface (panel).
    public static let card = LinearGradient(
        gradient: Gradient(colors: [
            Color(red: 0.314, green: 0.157, blue: 0.071).opacity(0.65),
            Color(red: 0.157, green: 0.071, blue: 0.031).opacity(0.85),
        ]),
        startPoint: .top, endPoint: .bottom
    )
}
