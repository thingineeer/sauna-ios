import SwiftUI

/// Common icon container — fixed 24-unit grid scaled to `size`,
/// 1.6 px stroke, round caps/joins. Color comes from foreground.
struct SIcon<Content: View>: View {
    let size: CGFloat
    let stroke: CGFloat
    @ViewBuilder let content: () -> Content

    init(size: CGFloat, stroke: CGFloat = CustomIcons.strokeWidth, @ViewBuilder content: @escaping () -> Content) {
        self.size = size
        self.stroke = stroke
        self.content = content
    }

    var body: some View {
        Canvas { _, _ in /* placeholder so a content-less call still has a body */ }
            .frame(width: size, height: size)
            .overlay {
                content()
                    .frame(width: CustomIcons.canvas, height: CustomIcons.canvas)
                    .scaleEffect(size / CustomIcons.canvas)
            }
    }
}

