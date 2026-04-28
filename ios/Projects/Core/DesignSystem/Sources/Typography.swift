import SwiftUI

public enum JjimFont {
    public static func body(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom("NotoSansKR-Regular", size: size).weight(weight)
            .fallback(.system(size: size, weight: weight))
    }

    public static func mono(_ size: CGFloat, weight: Font.Weight = .bold) -> Font {
        .custom("JetBrainsMono-Bold", size: size).weight(weight)
            .fallback(.system(size: size, weight: weight, design: .monospaced))
    }

    public static func display(_ size: CGFloat, weight: Font.Weight = .heavy) -> Font {
        .system(size: size, weight: weight, design: .default)
    }
}

private extension Font {
    /// Custom-font fallback. SwiftUI's `.custom` falls back to system silently when
    /// the font isn't installed, so this helper exists primarily for documentation
    /// and a single-call site for future custom font registration via `UIFont`.
    func fallback(_ system: Font) -> Font { self }
}

public extension Text {
    /// Mono uppercase tag (used everywhere as section headers).
    func jjimMonoTag(color: Color = JJIM.Accent.warm, size: CGFloat = 10) -> some View {
        self.font(JjimFont.mono(size, weight: .bold))
            .tracking(2.5)
            .foregroundStyle(color)
    }
}
