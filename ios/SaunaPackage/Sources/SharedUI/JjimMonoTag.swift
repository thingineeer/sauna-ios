import SwiftUI
import DesignSystem

/// All-caps mono badge ("STEP 1 OF 3", "TODAY · 18:47", etc.). Optional dot.
public struct JjimMonoTag: View {
    public let text: String
    public let color: Color
    public let dotted: Bool

    public init(_ text: String, color: Color = JJIM.Accent.warm, dotted: Bool = false) {
        self.text = text
        self.color = color
        self.dotted = dotted
    }

    public var body: some View {
        HStack(spacing: 6) {
            if dotted {
                Circle()
                    .fill(color)
                    .frame(width: 5, height: 5)
                    .shadow(color: color, radius: 3)
            }
            Text(text)
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .tracking(2.5)
                .foregroundStyle(color)
        }
    }
}
