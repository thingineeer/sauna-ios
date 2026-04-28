import SwiftUI
import DesignSystem
import CustomIcons
import SharedUI

/// System-sheet styled mock for the Face ID consent screen. The real flow
/// uses `ASAuthorizationController`; this view is for visual continuity inside
/// the onboarding storyboard (e.g. screenshots / store assets / preview).
public struct JjimPasskey2: View {
    public let userHandle: String
    public let onCancel: () -> Void
    public init(userHandle: String = "noh.gonhan@sauna.local",
                onCancel: @escaping () -> Void = {}) {
        self.userHandle = userHandle
        self.onCancel = onCancel
    }

    public var body: some View {
        ClayWall {
            // dim
            Color.black.opacity(0.65).ignoresSafeArea()

            // sheet
            VStack {
                Spacer()
                Capsule()
                    .fill(Color(red: 0.157, green: 0.078, blue: 0.039).opacity(0.18))
                    .frame(width: 36, height: 5)
                    .padding(.bottom, 8)

                VStack(alignment: .leading, spacing: 0) {
                    HStack(spacing: 10) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 7)
                                .fill(JjimGradient.ctaPrimary)
                                .frame(width: 28, height: 28)
                            IcSaunaMark(size: 18)
                                .foregroundStyle(Color(red: 0.165, green: 0.063, blue: 0.0))
                        }
                        .shadow(color: Color(red: 0.196, green: 0.098, blue: 0.039).opacity(0.25), radius: 1, y: 1)
                        Text("Sauna에 패스키 저장")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(Color(red: 0.165, green: 0.078, blue: 0.031))
                    }
                    .padding(.bottom, 14)

                    Divider().background(Color(red: 0.196, green: 0.098, blue: 0.039).opacity(0.18))

                    Group {
                        (
                            Text("\(userHandle)").bold()
                            + Text(" 계정의 패스키가 iCloud 키체인에 저장됩니다.")
                        )
                        .font(.system(size: 13))
                        .foregroundStyle(Color(red: 0.157, green: 0.078, blue: 0.039).opacity(0.75))
                        .padding(.top, 16)
                    }

                    VStack(spacing: 8) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color(red: 0.165, green: 0.078, blue: 0.031), lineWidth: 2.5)
                                .frame(width: 64, height: 64)
                            FaceIDGlyph()
                                .frame(width: 38, height: 38)
                        }
                        Text("Face ID로 계속")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundStyle(Color(red: 0.165, green: 0.078, blue: 0.031))
                        Text("얼굴을 화면에 보여주세요")
                            .font(.system(size: 11))
                            .foregroundStyle(Color(red: 0.157, green: 0.078, blue: 0.039).opacity(0.55))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 22)

                    Button(action: onCancel) {
                        Text("취소")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(Color(red: 0.478, green: 0.251, blue: 0.125))
                            .frame(maxWidth: .infinity)
                            .frame(height: 44)
                    }
                    .padding(.top, 22)
                }
                .padding(.horizontal, 22)
                .padding(.top, 22)
                .padding(.bottom, 18)
                .background(Color(red: 0.961, green: 0.910, blue: 0.824).opacity(0.96))
                .clipShape(RoundedRectangle(cornerRadius: 20))
                .shadow(color: .black.opacity(0.55), radius: 20, y: 12)
                .padding(.horizontal, 16)
                .padding(.bottom, 110)
            }
        }
    }
}

private struct FaceIDGlyph: View {
    var body: some View {
        Canvas { ctx, sz in
            let style = StrokeStyle(lineWidth: 1.6, lineCap: .round, lineJoin: .round)
            let outline = Color(red: 0.165, green: 0.078, blue: 0.031)
            let scale = min(sz.width, sz.height) / 38
            ctx.fill(Path(ellipseIn: CGRect(x: 13 * scale, y: 13 * scale, width: 3 * scale, height: 3 * scale)),
                      with: .color(outline))
            ctx.fill(Path(ellipseIn: CGRect(x: 23 * scale, y: 13 * scale, width: 3 * scale, height: 3 * scale)),
                      with: .color(outline))
            var smile = Path()
            smile.move(to: CGPoint(x: 14 * scale, y: 24 * scale))
            smile.addQuadCurve(to: CGPoint(x: 24 * scale, y: 24 * scale),
                                control: CGPoint(x: 19 * scale, y: 28 * scale))
            ctx.stroke(smile, with: .color(outline), style: style)
            var nose = Path()
            nose.move(to: CGPoint(x: 19 * scale, y: 14 * scale))
            nose.addLine(to: CGPoint(x: 19 * scale, y: 22 * scale))
            ctx.stroke(nose, with: .color(outline), style: style)
        }
    }
}

#Preview { JjimPasskey2().frame(width: 393, height: 852) }
