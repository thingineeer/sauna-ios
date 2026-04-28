import SwiftUI

/// Procedural drawing of the 황토 brick wall — used as background for ClayWall.
///
/// Re-creates the JSX repeating-linear-gradient stack (28px brick rows with 2px
/// horizontal mortar; 56px brick width with 2px vertical mortar at every column).
public struct ClayBrickPattern: View {
    public init() {}

    public var body: some View {
        Canvas { context, size in
            let rowH: CGFloat   = 30           // 28 brick + 2 mortar
            let mortarH: CGFloat = 2
            let colW: CGFloat   = 58           // 56 brick + 2 mortar
            let mortarW: CGFloat = 2
            let baseColor   = Color(red: 0.722, green: 0.416, blue: 0.251)
            let lightColor  = Color(red: 0.784, green: 0.471, blue: 0.290)
            let mortarColor = Color(red: 0.235, green: 0.110, blue: 0.047)

            var rowIdx = 0
            var y: CGFloat = 0
            while y < size.height {
                let useLight = rowIdx % 2 == 1
                let brickColor = useLight ? lightColor : baseColor
                let brickRect = CGRect(x: 0, y: y, width: size.width, height: rowH - mortarH)
                context.fill(Path(brickRect), with: .color(brickColor))

                let offsetX: CGFloat = useLight ? colW / 2 : 0
                var x: CGFloat = -colW
                while x < size.width {
                    let mortarRect = CGRect(
                        x: x + offsetX + colW - mortarW, y: y,
                        width: mortarW, height: rowH - mortarH
                    )
                    context.fill(Path(mortarRect), with: .color(mortarColor))
                    x += colW
                }

                let mortarRow = CGRect(
                    x: 0, y: y + rowH - mortarH,
                    width: size.width, height: mortarH
                )
                context.fill(Path(mortarRow), with: .color(mortarColor))

                rowIdx += 1
                y += rowH
            }
        }
    }
}

/// Procedural wood floor pattern — repeating vertical planks with mortar gaps.
public struct ClayFloorPattern: View {
    public init() {}

    public var body: some View {
        Canvas { context, size in
            let plankPattern: [(CGFloat, Color)] = [
                (14, Color(red: 0.549, green: 0.384, blue: 0.220)), // #8c6238
                (2, Color(red: 0.353, green: 0.227, blue: 0.094)), // #5a3a18 mortar
                (14, Color(red: 0.612, green: 0.439, blue: 0.282)), // #9c7048
                (2, Color(red: 0.353, green: 0.227, blue: 0.094)),
            ]
            let total = plankPattern.reduce(0) { $0 + $1.0 }
            var x: CGFloat = 0
            while x < size.width {
                for (w, color) in plankPattern {
                    let r = CGRect(x: x, y: 0, width: w, height: size.height)
                    context.fill(Path(r), with: .color(color))
                    x += w
                    if x >= size.width { break }
                }
                _ = total
            }

            let shade = Gradient(stops: [
                .init(color: .clear, location: 0.0),
                .init(color: Color(red: 0.157, green: 0.071, blue: 0.020).opacity(0.4), location: 0.7),
                .init(color: Color(red: 0.157, green: 0.071, blue: 0.020).opacity(0.55), location: 1.0),
            ])
            context.fill(
                Path(CGRect(origin: .zero, size: size)),
                with: .linearGradient(shade,
                    startPoint: .zero, endPoint: CGPoint(x: 0, y: size.height))
            )
        }
    }
}
