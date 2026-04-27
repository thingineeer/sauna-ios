import SwiftUI

// MARK: - Brand --------------------------------------------------------

public struct IcSaunaMark: View {
    public let size: CGFloat
    public init(size: CGFloat = 56) { self.size = size }
    public var body: some View {
        Canvas { ctx, _ in
            let s = size / 48
            let stroke = StrokeStyle(lineWidth: 2.2 * s, lineCap: .round, lineJoin: .round)
            // enclosure
            let rect = Path(roundedRect: CGRect(x: 7*s, y: 9*s, width: 34*s, height: 30*s), cornerRadius: 4*s)
            ctx.stroke(rect, with: .color(.primary), style: stroke)
            // benches
            let stroke2 = StrokeStyle(lineWidth: 2 * s, lineCap: .round, lineJoin: .round)
            var bench1 = Path(); bench1.move(to: CGPoint(x: 11*s, y: 31*s)); bench1.addLine(to: CGPoint(x: 37*s, y: 31*s))
            ctx.stroke(bench1, with: .color(.primary), style: stroke2)
            var bench2 = Path(); bench2.move(to: CGPoint(x: 14*s, y: 35*s)); bench2.addLine(to: CGPoint(x: 34*s, y: 35*s))
            ctx.stroke(bench2, with: .color(.primary), style: stroke2)
            // heat waves: M16 22 c0-2 2-2 2-4s-2-2-2-4
            let stroke3 = StrokeStyle(lineWidth: 1.8 * s, lineCap: .round, lineJoin: .round)
            for x: CGFloat in [16, 24, 32] {
                var w = Path()
                w.move(to: CGPoint(x: x*s, y: 22*s))
                w.addCurve(to: CGPoint(x: (x+2)*s, y: 18*s),
                            control1: CGPoint(x: x*s, y: 20*s),
                            control2: CGPoint(x: (x+2)*s, y: 20*s))
                w.addCurve(to: CGPoint(x: x*s, y: 14*s),
                            control1: CGPoint(x: (x+2)*s, y: 16*s),
                            control2: CGPoint(x: x*s, y: 16*s))
                ctx.stroke(w, with: .color(.primary), style: stroke3)
            }
        }
        .frame(width: size, height: size)
        .compositingGroup()
    }
}

// MARK: - Rooms --------------------------------------------------------

public struct IcDaily: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                ctx.stroke(Path(ellipseIn: CGRect(x: 4,    y: 16, width: 16, height: 5)),  with: .color(.primary), style: style)
                ctx.stroke(Path(ellipseIn: CGRect(x: 5,    y: 10.8, width: 12, height: 4.4)), with: .color(.primary), style: style)
                ctx.stroke(Path(ellipseIn: CGRect(x: 9,    y: 6,  width: 8,  height: 4)),  with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcStock: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                // Left candle
                var l1 = Path(); l1.move(to: CGPoint(x: 7, y: 4));  l1.addLine(to: CGPoint(x: 7, y: 20));  ctx.stroke(l1, with: .color(.primary), style: style)
                ctx.stroke(Path(roundedRect: CGRect(x: 4.5, y: 8,  width: 5, height: 8), cornerRadius: 0.5), with: .color(.primary), style: style)
                // Right candle
                var l2 = Path(); l2.move(to: CGPoint(x: 17, y: 5)); l2.addLine(to: CGPoint(x: 17, y: 19)); ctx.stroke(l2, with: .color(.primary), style: style)
                ctx.stroke(Path(roundedRect: CGRect(x: 14.5, y: 10, width: 5, height: 6), cornerRadius: 0.5), with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcJob: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                // Document outline
                var p = Path()
                p.move(to: CGPoint(x: 7, y: 3))
                p.addLine(to: CGPoint(x: 15, y: 3))
                p.addLine(to: CGPoint(x: 19, y: 7))
                p.addLine(to: CGPoint(x: 19, y: 20))
                p.addQuadCurve(to: CGPoint(x: 18, y: 21), control: CGPoint(x: 19, y: 21))
                p.addLine(to: CGPoint(x: 7, y: 21))
                p.addQuadCurve(to: CGPoint(x: 6, y: 20), control: CGPoint(x: 6, y: 21))
                p.addLine(to: CGPoint(x: 6, y: 4))
                p.addQuadCurve(to: CGPoint(x: 7, y: 3), control: CGPoint(x: 6, y: 3))
                ctx.stroke(p, with: .color(.primary), style: style)
                // Folded corner
                var fold = Path()
                fold.move(to: CGPoint(x: 15, y: 3))
                fold.addLine(to: CGPoint(x: 15, y: 7))
                fold.addLine(to: CGPoint(x: 19, y: 7))
                ctx.stroke(fold, with: .color(.primary), style: style)
                // Lines
                var l1 = Path(); l1.move(to: CGPoint(x: 9, y: 13)); l1.addLine(to: CGPoint(x: 16, y: 13)); ctx.stroke(l1, with: .color(.primary), style: style)
                var l2 = Path(); l2.move(to: CGPoint(x: 9, y: 17)); l2.addLine(to: CGPoint(x: 14, y: 17)); ctx.stroke(l2, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcWorldCup: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                ctx.stroke(Path(ellipseIn: CGRect(x: 4, y: 4, width: 16, height: 16)), with: .color(.primary), style: style)
                var pent = Path()
                pent.move(to: CGPoint(x: 12, y: 8))
                pent.addLine(to: CGPoint(x: 15, y: 10))
                pent.addLine(to: CGPoint(x: 14, y: 14))
                pent.addLine(to: CGPoint(x: 10, y: 14))
                pent.addLine(to: CGPoint(x: 9,  y: 10))
                pent.closeSubpath()
                ctx.stroke(pent, with: .color(.primary), style: style)
                let segs: [(CGPoint, CGPoint)] = [
                    (.init(x:12,y:4), .init(x:12,y:8)),
                    (.init(x:15,y:10),.init(x:19,y:9)),
                    (.init(x:14,y:14),.init(x:17,y:17)),
                    (.init(x:10,y:14),.init(x:7, y:17)),
                    (.init(x:9, y:10),.init(x:5, y:9)),
                ]
                for (a, b) in segs {
                    var s = Path(); s.move(to: a); s.addLine(to: b); ctx.stroke(s, with: .color(.primary), style: style)
                }
            }
        }
    }
}

public struct IcMedal: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                var ribbon = Path()
                ribbon.move(to: CGPoint(x: 8, y: 3))
                ribbon.addLine(to: CGPoint(x: 6, y: 9))
                ribbon.addLine(to: CGPoint(x: 12, y: 13))
                ribbon.addLine(to: CGPoint(x: 18, y: 9))
                ribbon.addLine(to: CGPoint(x: 16, y: 3))
                ctx.stroke(ribbon, with: .color(.primary), style: style)
                var top = Path(); top.move(to: CGPoint(x: 8, y: 3)); top.addLine(to: CGPoint(x: 16, y: 3))
                ctx.stroke(top, with: .color(.primary), style: style)
                ctx.stroke(Path(ellipseIn: CGRect(x: 7, y: 11, width: 10, height: 10)), with: .color(.primary), style: style)
            }
        }
    }
}

// MARK: - Steam / presence --------------------------------------------

public struct IcSteam: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                // L: M7 19 c0-2 2-2 2-4 s-2-2-2-4
                var p1 = Path()
                p1.move(to: CGPoint(x: 7, y: 19))
                p1.addCurve(to: CGPoint(x: 9, y: 15), control1: CGPoint(x: 7, y: 17), control2: CGPoint(x: 9, y: 17))
                p1.addCurve(to: CGPoint(x: 7, y: 11), control1: CGPoint(x: 9, y: 13), control2: CGPoint(x: 7, y: 13))
                ctx.stroke(p1, with: .color(.primary), style: style)
                // M: M12 21 ... 4 -2 -2 ...
                var p2 = Path()
                p2.move(to: CGPoint(x: 12, y: 21))
                p2.addCurve(to: CGPoint(x: 14, y: 17), control1: CGPoint(x: 12, y: 19), control2: CGPoint(x: 14, y: 19))
                p2.addCurve(to: CGPoint(x: 12, y: 13), control1: CGPoint(x: 14, y: 15), control2: CGPoint(x: 12, y: 15))
                p2.addCurve(to: CGPoint(x: 14, y: 9),  control1: CGPoint(x: 12, y: 11), control2: CGPoint(x: 14, y: 11))
                ctx.stroke(p2, with: .color(.primary), style: style)
                // R: M17 19 ...
                var p3 = Path()
                p3.move(to: CGPoint(x: 17, y: 19))
                p3.addCurve(to: CGPoint(x: 19, y: 15), control1: CGPoint(x: 17, y: 17), control2: CGPoint(x: 19, y: 17))
                p3.addCurve(to: CGPoint(x: 17, y: 11), control1: CGPoint(x: 19, y: 13), control2: CGPoint(x: 17, y: 13))
                ctx.stroke(p3, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcWaves: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                for y in [CGFloat(8), 14, 20] {
                    var p = Path()
                    p.move(to: CGPoint(x: 3, y: y))
                    p.addQuadCurve(to: CGPoint(x: 9, y: y),  control: CGPoint(x: 6,  y: y - 2))
                    p.addQuadCurve(to: CGPoint(x: 15, y: y), control: CGPoint(x: 12, y: y + 2))
                    p.addQuadCurve(to: CGPoint(x: 21, y: y), control: CGPoint(x: 18, y: y - 2))
                    ctx.stroke(p, with: .color(.primary), style: style)
                }
            }
        }
    }
}

public struct IcLeaf: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                var leaf = Path()
                leaf.move(to: CGPoint(x: 20, y: 4))
                leaf.addCurve(to: CGPoint(x: 6, y: 15),
                               control1: CGPoint(x: 11, y: 4), control2: CGPoint(x: 6, y: 9))
                leaf.addCurve(to: CGPoint(x: 11, y: 20),
                               control1: CGPoint(x: 6, y: 18), control2: CGPoint(x: 8, y: 20))
                leaf.addCurve(to: CGPoint(x: 22, y: 6),
                               control1: CGPoint(x: 17, y: 20), control2: CGPoint(x: 22, y: 15))
                leaf.addLine(to: CGPoint(x: 22, y: 4))
                leaf.closeSubpath()
                ctx.stroke(leaf, with: .color(.primary), style: style)
                var vein = Path()
                vein.move(to: CGPoint(x: 6, y: 20))
                vein.addCurve(to: CGPoint(x: 18, y: 8),
                               control1: CGPoint(x: 8, y: 16), control2: CGPoint(x: 12, y: 12))
                ctx.stroke(vein, with: .color(.primary), style: style)
            }
        }
    }
}

// MARK: - Nav ----------------------------------------------------------

public struct IcDoor: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                ctx.stroke(Path(roundedRect: CGRect(x: 6, y: 3, width: 12, height: 18), cornerRadius: 1),
                            with: .color(.primary), style: style)
                var knob = Path(); knob.move(to: CGPoint(x: 14.5, y: 12)); knob.addLine(to: CGPoint(x: 14.5, y: 13.2))
                ctx.stroke(knob, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcPerson: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                ctx.stroke(Path(ellipseIn: CGRect(x: 8, y: 4, width: 8, height: 8)), with: .color(.primary), style: style)
                var torso = Path()
                torso.move(to: CGPoint(x: 4, y: 21))
                torso.addCurve(to: CGPoint(x: 20, y: 21),
                                control1: CGPoint(x: 4, y: 16.6),
                                control2: CGPoint(x: 7.6, y: 13))
                ctx.stroke(torso, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcGear: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                ctx.stroke(Path(ellipseIn: CGRect(x: 9, y: 9, width: 6, height: 6)), with: .color(.primary), style: style)
                let segs: [(CGFloat, CGFloat, CGFloat, CGFloat)] = [
                    (12, 2, 12, 5),  (12, 19, 12, 22),
                    (4.2, 4.2, 6.3, 6.3), (17.7, 17.7, 19.8, 19.8),
                    (2, 12, 5, 12),  (19, 12, 22, 12),
                    (4.2, 19.8, 6.3, 17.7), (17.7, 6.3, 19.8, 4.2),
                ]
                for (x1, y1, x2, y2) in segs {
                    var p = Path(); p.move(to: CGPoint(x: x1, y: y1)); p.addLine(to: CGPoint(x: x2, y: y2))
                    ctx.stroke(p, with: .color(.primary), style: style)
                }
            }
        }
    }
}

// MARK: - Utility ------------------------------------------------------

public struct IcClock: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                ctx.stroke(Path(ellipseIn: CGRect(x: 3.5, y: 3.5, width: 17, height: 17)), with: .color(.primary), style: style)
                var hand = Path()
                hand.move(to: CGPoint(x: 12, y: 7))
                hand.addLine(to: CGPoint(x: 12, y: 12))
                hand.addLine(to: CGPoint(x: 15, y: 14))
                ctx.stroke(hand, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcRefresh: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                var topArc = Path()
                topArc.move(to: CGPoint(x: 4, y: 12))
                topArc.addCurve(to: CGPoint(x: 18, y: 7),
                                 control1: CGPoint(x: 4, y: 7), control2: CGPoint(x: 13, y: 4))
                ctx.stroke(topArc, with: .color(.primary), style: style)
                var ar1 = Path(); ar1.move(to: CGPoint(x: 18, y: 3)); ar1.addLine(to: CGPoint(x: 18, y: 8)); ar1.addLine(to: CGPoint(x: 13, y: 8))
                ctx.stroke(ar1, with: .color(.primary), style: style)

                var botArc = Path()
                botArc.move(to: CGPoint(x: 20, y: 12))
                botArc.addCurve(to: CGPoint(x: 6, y: 17),
                                 control1: CGPoint(x: 20, y: 17), control2: CGPoint(x: 11, y: 20))
                ctx.stroke(botArc, with: .color(.primary), style: style)
                var ar2 = Path(); ar2.move(to: CGPoint(x: 6, y: 21)); ar2.addLine(to: CGPoint(x: 6, y: 16)); ar2.addLine(to: CGPoint(x: 11, y: 16))
                ctx.stroke(ar2, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcDice: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                ctx.stroke(Path(roundedRect: CGRect(x: 4, y: 4, width: 16, height: 16), cornerRadius: 3),
                            with: .color(.primary), style: style)
                let dots: [CGPoint] = [
                    .init(x: 8.5, y: 8.5), .init(x: 15.5, y: 8.5),
                    .init(x: 12,  y: 12),
                    .init(x: 8.5, y: 15.5), .init(x: 15.5, y: 15.5),
                ]
                for d in dots {
                    ctx.fill(Path(ellipseIn: CGRect(x: d.x-1, y: d.y-1, width: 2, height: 2)), with: .color(.primary))
                }
            }
        }
    }
}

public struct IcBell: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                var bell = Path()
                bell.move(to: CGPoint(x: 6, y: 16))
                bell.addLine(to: CGPoint(x: 6, y: 11))
                bell.addCurve(to: CGPoint(x: 18, y: 11),
                               control1: CGPoint(x: 6, y: 7.7), control2: CGPoint(x: 8.7, y: 5))
                bell.addLine(to: CGPoint(x: 18, y: 16))
                bell.addLine(to: CGPoint(x: 20, y: 18))
                bell.addLine(to: CGPoint(x: 4, y: 18))
                bell.closeSubpath()
                ctx.stroke(bell, with: .color(.primary), style: style)
                var clapper = Path()
                clapper.move(to: CGPoint(x: 10, y: 20))
                clapper.addCurve(to: CGPoint(x: 14, y: 20),
                                  control1: CGPoint(x: 10, y: 22), control2: CGPoint(x: 14, y: 22))
                ctx.stroke(clapper, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcMoon: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                var p = Path()
                p.move(to: CGPoint(x: 20, y: 14.5))
                p.addCurve(to: CGPoint(x: 9.5, y: 4),
                            control1: CGPoint(x: 17, y: 18.5), control2: CGPoint(x: 13, y: 4))
                p.addCurve(to: CGPoint(x: 20, y: 14.5),
                            control1: CGPoint(x: 16, y: 4), control2: CGPoint(x: 22, y: 11))
                ctx.stroke(p, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcVibrate: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                ctx.stroke(Path(roundedRect: CGRect(x: 8, y: 6, width: 8, height: 12), cornerRadius: 1.5),
                            with: .color(.primary), style: style)
                var l = Path(); l.move(to: CGPoint(x: 4, y: 10)); l.addLine(to: CGPoint(x: 4, y: 14)); ctx.stroke(l, with: .color(.primary), style: style)
                var r = Path(); r.move(to: CGPoint(x: 20, y: 10)); r.addLine(to: CGPoint(x: 20, y: 14)); ctx.stroke(r, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcContrast: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                ctx.stroke(Path(ellipseIn: CGRect(x: 3.5, y: 3.5, width: 17, height: 17)),
                            with: .color(.primary), style: style)
                var half = Path()
                half.move(to: CGPoint(x: 12, y: 3.5))
                half.addLine(to: CGPoint(x: 12, y: 20.5))
                half.addCurve(to: CGPoint(x: 12, y: 3.5),
                               control1: CGPoint(x: 20.5, y: 20.5), control2: CGPoint(x: 20.5, y: 3.5))
                half.closeSubpath()
                ctx.fill(half, with: .color(.primary))
            }
        }
    }
}

public struct IcMotion: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                ctx.stroke(Path(ellipseIn: CGRect(x: 3.5, y: 3.5, width: 17, height: 17)),
                            with: .color(.primary), style: style)
                var p = Path()
                p.move(to: CGPoint(x: 7, y: 14))
                p.addQuadCurve(to: CGPoint(x: 12, y: 14), control: CGPoint(x: 9.5, y: 11))
                p.addQuadCurve(to: CGPoint(x: 17, y: 14), control: CGPoint(x: 14.5, y: 17))
                ctx.stroke(p, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcType: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                let segs: [(CGPoint, CGPoint)] = [
                    (.init(x: 5, y: 6), .init(x: 19, y: 6)),
                    (.init(x: 8, y: 6), .init(x: 8, y: 19)),
                    (.init(x: 16, y: 6), .init(x: 16, y: 19)),
                    (.init(x: 11, y: 19), .init(x: 17, y: 19)),
                ]
                for (a, b) in segs {
                    var p = Path(); p.move(to: a); p.addLine(to: b); ctx.stroke(p, with: .color(.primary), style: style)
                }
            }
        }
    }
}

public struct IcTrash: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                let segs: [Path] = {
                    var arr: [Path] = []
                    var p1 = Path(); p1.move(to: CGPoint(x: 4, y: 7)); p1.addLine(to: CGPoint(x: 20, y: 7)); arr.append(p1)
                    var p2 = Path(); p2.move(to: CGPoint(x: 9, y: 7)); p2.addLine(to: CGPoint(x: 9, y: 4)); p2.addLine(to: CGPoint(x: 15, y: 4)); p2.addLine(to: CGPoint(x: 15, y: 7)); arr.append(p2)
                    var p3 = Path(); p3.move(to: CGPoint(x: 6, y: 7)); p3.addLine(to: CGPoint(x: 7, y: 20)); p3.addLine(to: CGPoint(x: 17, y: 20)); p3.addLine(to: CGPoint(x: 18, y: 7)); arr.append(p3)
                    var p4 = Path(); p4.move(to: CGPoint(x: 10, y: 11)); p4.addLine(to: CGPoint(x: 10, y: 17)); arr.append(p4)
                    var p5 = Path(); p5.move(to: CGPoint(x: 14, y: 11)); p5.addLine(to: CGPoint(x: 14, y: 17)); arr.append(p5)
                    return arr
                }()
                for p in segs { ctx.stroke(p, with: .color(.primary), style: style) }
            }
        }
    }
}

public struct IcInfo: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                ctx.stroke(Path(ellipseIn: CGRect(x: 3.5, y: 3.5, width: 17, height: 17)),
                            with: .color(.primary), style: style)
                var stem = Path(); stem.move(to: CGPoint(x: 12, y: 11)); stem.addLine(to: CGPoint(x: 12, y: 16))
                ctx.stroke(stem, with: .color(.primary), style: style)
                var dot = Path(); dot.move(to: CGPoint(x: 12, y: 7.8)); dot.addLine(to: CGPoint(x: 12, y: 8))
                ctx.stroke(dot, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcArrowLeft: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                var p = Path()
                p.move(to: CGPoint(x: 15, y: 4))
                p.addLine(to: CGPoint(x: 7, y: 12))
                p.addLine(to: CGPoint(x: 15, y: 20))
                ctx.stroke(p, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcArrowUpRight: View {
    public let size: CGFloat
    public init(size: CGFloat = 22) { self.size = size }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                var p1 = Path(); p1.move(to: CGPoint(x: 7, y: 17)); p1.addLine(to: CGPoint(x: 17, y: 7))
                ctx.stroke(p1, with: .color(.primary), style: style)
                var p2 = Path(); p2.move(to: CGPoint(x: 8, y: 7)); p2.addLine(to: CGPoint(x: 17, y: 7)); p2.addLine(to: CGPoint(x: 17, y: 16))
                ctx.stroke(p2, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcChevron: View {
    public enum Direction: Sendable { case left, right }
    public let size: CGFloat
    public let direction: Direction
    public init(size: CGFloat = 22, direction: Direction = .right) {
        self.size = size; self.direction = direction
    }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                var p = Path()
                switch direction {
                case .right:
                    p.move(to: CGPoint(x: 9, y: 6)); p.addLine(to: CGPoint(x: 15, y: 12)); p.addLine(to: CGPoint(x: 9, y: 18))
                case .left:
                    p.move(to: CGPoint(x: 15, y: 6)); p.addLine(to: CGPoint(x: 9, y: 12)); p.addLine(to: CGPoint(x: 15, y: 18))
                }
                ctx.stroke(p, with: .color(.primary), style: style)
            }
        }
    }
}

public struct IcHeart: View {
    public let size: CGFloat
    public let filled: Bool
    public init(size: CGFloat = 22, filled: Bool = false) {
        self.size = size; self.filled = filled
    }
    public var body: some View {
        SIcon(size: size) {
            Canvas { ctx, _ in
                let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
                var p = Path()
                p.move(to: CGPoint(x: 12, y: 20))
                p.addCurve(to: CGPoint(x: 5, y: 10),
                            control1: CGPoint(x: 7.5, y: 17), control2: CGPoint(x: 5, y: 13))
                p.addCurve(to: CGPoint(x: 12, y: 7.4),
                            control1: CGPoint(x: 5, y: 7.8), control2: CGPoint(x: 9, y: 5.8))
                p.addCurve(to: CGPoint(x: 19, y: 10),
                            control1: CGPoint(x: 15, y: 5.8), control2: CGPoint(x: 19, y: 7.8))
                p.addCurve(to: CGPoint(x: 12, y: 20),
                            control1: CGPoint(x: 19, y: 13), control2: CGPoint(x: 16.5, y: 17))
                p.closeSubpath()
                if filled {
                    ctx.fill(p, with: .color(.primary))
                } else {
                    ctx.stroke(p, with: .color(.primary), style: style)
                }
            }
        }
    }
}

// MARK: - Anonymous avatar (custom mask) ------------------------------

public struct AnonAvatar: View {
    public let size: CGFloat
    public let accent: Color
    public init(size: CGFloat = 44, accent: Color = Color(red: 1.0, green: 0.69, blue: 0.376)) {
        self.size = size
        self.accent = accent
    }
    public var body: some View {
        ZStack {
            Circle()
                .fill(LinearGradient(
                    colors: [accent.opacity(0.35), Color(red: 0.471, green: 0.235, blue: 0.078).opacity(0.55)],
                    startPoint: .top, endPoint: .bottom
                ))
                .overlay(Circle().stroke(accent.opacity(0.4), lineWidth: 1))
            Canvas { ctx, sz in
                let s = size * 0.6 / 24
                let style = StrokeStyle(lineWidth: 1.5, lineCap: .round, lineJoin: .round)
                let originX = (sz.width - 24 * s) / 2
                let originY = (sz.height - 24 * s) / 2
                func P(_ x: CGFloat, _ y: CGFloat) -> CGPoint { .init(x: originX + x * s, y: originY + y * s) }
                var hood = Path()
                hood.move(to: P(6, 13))
                hood.addCurve(to: P(12, 6), control1: P(6, 9), control2: P(8.7, 6))
                hood.addCurve(to: P(18, 13), control1: P(15.3, 6), control2: P(18, 9))
                hood.addLine(to: P(18, 17))
                hood.addQuadCurve(to: P(16, 19), control: P(18, 19))
                hood.addLine(to: P(8, 19))
                hood.addQuadCurve(to: P(6, 17), control: P(6, 19))
                hood.closeSubpath()
                ctx.stroke(hood, with: .color(accent), style: style)
                ctx.fill(Path(ellipseIn: CGRect(x: P(10, 13).x - 0.7*s, y: P(10, 13).y - 0.7*s,
                                                  width: 1.4*s, height: 1.4*s)), with: .color(accent))
                ctx.fill(Path(ellipseIn: CGRect(x: P(14, 13).x - 0.7*s, y: P(14, 13).y - 0.7*s,
                                                  width: 1.4*s, height: 1.4*s)), with: .color(accent))
            }
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Mono-tag (used everywhere) ----------------------------------

public struct MonoTag: View {
    public let text: String
    public let color: Color
    public let dotted: Bool

    public init(_ text: String, color: Color = Color(red: 1.0, green: 0.69, blue: 0.376),
                 dotted: Bool = false) {
        self.text = text
        self.color = color
        self.dotted = dotted
    }

    public var body: some View {
        HStack(spacing: 6) {
            if dotted {
                Circle().fill(color).frame(width: 5, height: 5)
                    .shadow(color: color, radius: 3)
            }
            Text(text)
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .tracking(2.5)
                .foregroundStyle(color)
        }
    }
}
