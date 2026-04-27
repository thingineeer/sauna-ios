import Foundation
import CoreGraphics

/// One floating bubble. `xRel` is 0...1 horizontal anchor (jiggled at render
/// time). `life` is the total seconds the bubble lives; `spawnAt` is when it
/// first appeared. `isMine` switches the warmer "내 발화" gradient.
public struct RisingMessage: Identifiable, Equatable, Sendable {
    public let id: UUID
    public let nickname: String
    public let text: String
    public let xRel: CGFloat
    public let spawnAt: Date
    public let life: TimeInterval
    public let isMine: Bool

    public init(id: UUID = UUID(),
                 nickname: String, text: String,
                 xRel: CGFloat, spawnAt: Date, life: TimeInterval,
                 isMine: Bool) {
        self.id = id
        self.nickname = nickname
        self.text = text
        self.xRel = xRel
        self.spawnAt = spawnAt
        self.life = life
        self.isMine = isMine
    }

    /// Linear progress 0...1 at `now`. Capped on both ends.
    public func progress(at now: Date) -> Double {
        let elapsed = now.timeIntervalSince(spawnAt)
        return max(0, min(1, elapsed / life))
    }

    /// Has the bubble fully dissolved?
    public func isExpired(at now: Date) -> Bool {
        progress(at: now) >= 1.0
    }
}

/// Render-time math separated from the bubble for testability.
public enum RisingPhysics {
    public static let bottomY: CGFloat = 500
    public static let topY: CGFloat    = 20

    /// Vertical position. Linearly rises from `bottomY` to `topY`.
    public static func y(progress t: Double) -> CGFloat {
        let p = CGFloat(t)
        return bottomY + (topY - bottomY) * p
    }

    /// Horizontal position with a soft sine jiggle.
    public static func x(width: CGFloat, xRel: CGFloat, progress t: Double, jitterSeed: Int) -> CGFloat {
        let phase = Double(jitterSeed) * 0.7
        let sway = CGFloat(sin(t * 3.2 + phase)) * 12
        return xRel * width + sway
    }

    /// Opacity envelope: fade-in 0–10%, hold, fade-out 72–100%.
    public static func opacity(progress t: Double) -> Double {
        if t < 0.10 { return t / 0.10 }
        if t > 0.72 { return (1 - t) / 0.28 }
        return 1
    }

    /// Blur ramps in toward the end (62%+).
    public static func blurRadius(progress t: Double) -> Double {
        guard t > 0.62 else { return 0 }
        return (t - 0.62) * 12
    }

    /// Slight grow as it rises.
    public static func scale(progress t: Double) -> Double {
        return 0.9 + t * 0.15
    }
}
