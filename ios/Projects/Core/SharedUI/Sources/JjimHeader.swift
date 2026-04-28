import SwiftUI
import DesignSystem

/// Title bar with optional back button + subtitle tag.
/// Anchored at the top, overlays the wall.
public struct JjimHeader<Trailing: View>: View {
    public let title: String
    public let subtitle: String?
    public let leadingBack: Bool
    public let onBack: () -> Void
    @ViewBuilder public let trailing: () -> Trailing

    public init(
        title: String,
        subtitle: String? = nil,
        leadingBack: Bool = true,
        onBack: @escaping () -> Void = {},
        @ViewBuilder trailing: @escaping () -> Trailing = { EmptyView() }
    ) {
        self.title = title
        self.subtitle = subtitle
        self.leadingBack = leadingBack
        self.onBack = onBack
        self.trailing = trailing
    }

    public var body: some View {
        HStack(alignment: .top, spacing: 10) {
            if leadingBack {
                Button(action: onBack) {
                    Text("‹")
                        .font(.system(size: 22, weight: .regular))
                        .foregroundStyle(JJIM.Text.primary)
                        .frame(width: 36, height: 36)
                        .background(JJIM.Surface.panel)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(JJIM.Surface.hairline, lineWidth: 1)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .buttonStyle(.plain)
            }
            VStack(alignment: .leading, spacing: 4) {
                if let subtitle {
                    JjimMonoTag(subtitle)
                }
                Text(title)
                    .font(.system(size: 22, weight: .heavy))
                    .kerning(-0.5)
                    .foregroundStyle(JJIM.Text.primary)
                    .shadow(color: .black.opacity(0.55), radius: 3, y: 2)
            }
            .padding(.top, 2)
            Spacer(minLength: 0)
            trailing()
        }
        .padding(.top, 56)
        .padding(.horizontal, 16)
        .padding(.bottom, 12)
    }
}
