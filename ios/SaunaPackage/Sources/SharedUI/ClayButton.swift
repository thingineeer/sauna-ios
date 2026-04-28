import SwiftUI
import DesignSystem

public struct ClayButton<Leading: View>: View {
    public enum Style: Sendable {
        case primary, secondary
    }

    public let title: String
    public let style: Style
    public let fullWidth: Bool
    public let isEnabled: Bool
    public let action: () -> Void
    @ViewBuilder public let leading: () -> Leading

    public init(
        _ title: String,
        style: Style = .primary,
        fullWidth: Bool = true,
        isEnabled: Bool = true,
        action: @escaping () -> Void = {},
        @ViewBuilder leading: @escaping () -> Leading = { EmptyView() }
    ) {
        self.title = title
        self.style = style
        self.fullWidth = fullWidth
        self.isEnabled = isEnabled
        self.action = action
        self.leading = leading
    }

    public var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                leading()
                Text(title)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(textColor)
            }
            .frame(maxWidth: fullWidth ? .infinity : nil)
            .padding(.horizontal, fullWidth ? 16 : 22)
            .frame(height: 52)
            .background(background)
            .overlay(border)
            .clipShape(RoundedRectangle(cornerRadius: JJIM.Radius.lg))
            .shadow(color: shadowColor, radius: 9, y: 6)
            .opacity(isEnabled ? 1.0 : 0.6)
        }
        .buttonStyle(.plain)
        .disabled(!isEnabled)
    }

    private var textColor: Color {
        switch (style, isEnabled) {
        case (.primary, true): return Color(red: 0.165, green: 0.063, blue: 0.0)
        default:               return JJIM.Text.primary
        }
    }

    @ViewBuilder
    private var background: some View {
        switch (style, isEnabled) {
        case (.primary, true):
            JjimGradient.ctaPrimary
        case (.secondary, _):
            JJIM.Surface.panel
        case (.primary, false):
            JJIM.Surface.panel
        }
    }

    @ViewBuilder
    private var border: some View {
        if style == .secondary {
            RoundedRectangle(cornerRadius: JJIM.Radius.lg)
                .stroke(JJIM.Surface.hairline, lineWidth: 1)
        }
    }

    private var shadowColor: Color {
        style == .primary && isEnabled
            ? Color(red: 1.0, green: 0.55, blue: 0.235).opacity(0.35)
            : .clear
    }
}
