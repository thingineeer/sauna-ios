import SwiftUI
import DesignSystem

/// Onboarding pagination (1/3, 2/3, 3/3, …). Active dot widens.
public struct JjimPagination: View {
    public let index: Int
    public let total: Int

    public init(index: Int, total: Int = 3) {
        self.index = index
        self.total = total
    }

    public var body: some View {
        HStack(spacing: 6) {
            ForEach(0..<total, id: \.self) { i in
                let on = i == index
                RoundedRectangle(cornerRadius: 3)
                    .fill(on ? JJIM.Accent.primary : JJIM.Text.dim)
                    .frame(width: on ? 22 : 6, height: 6)
                    .shadow(color: on ? JJIM.Accent.primary : .clear, radius: 5)
                    .animation(.easeInOut(duration: 0.3), value: index)
            }
        }
    }
}
