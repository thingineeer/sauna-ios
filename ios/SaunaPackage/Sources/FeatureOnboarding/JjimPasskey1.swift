import SwiftUI
import DesignSystem
import CustomIcons
import SharedUI

public struct JjimPasskey1: View {
    public let onCreatePasskey: () -> Void
    public init(onCreatePasskey: @escaping () -> Void = {}) {
        self.onCreatePasskey = onCreatePasskey
    }

    private let benefits: [(String, String)] = [
        ("비밀번호 없음", "외울 게 없어"),
        ("해킹 피싱 안전", "너 폰 안의 보안칩에서 처리"),
        ("1초 로그인", "얼굴/지문만"),
    ]

    public var body: some View {
        ClayWall {
            HStack { Spacer(); ClayLamp(scale: 0.8).padding(.trailing, 32).padding(.top, 88) }
                .frame(maxHeight: .infinity, alignment: .top)

            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    Spacer().frame(height: 100)
                    JjimMonoTag("PASSKEY · 1 OF 3")
                    Text("비밀번호 없이\n이 폰 하나로")
                        .font(.system(size: 26, weight: .heavy))
                        .kerning(-0.4)
                        .foregroundStyle(JJIM.Text.primary)
                        .shadow(color: Color(red: 0.196, green: 0.059, blue: 0.0).opacity(0.85), radius: 4, y: 2)
                        .padding(.top, 10)
                    Text("이메일·전화번호 안 받아. 이 폰의 Face ID(혹은 Touch ID)가 너의 열쇠야. 폰 바뀌면 다시 등록.")
                        .font(.system(size: 13))
                        .foregroundStyle(JJIM.Text.secondary)
                        .lineSpacing(4)
                        .padding(.top, 12)

                    PasskeyHeroIllustration()
                        .padding(.top, 26)

                    VStack(spacing: 8) {
                        ForEach(0..<benefits.count, id: \.self) { i in
                            let (t, d) = benefits[i]
                            HStack(alignment: .top, spacing: 10) {
                                Circle()
                                    .fill(JJIM.Accent.warm)
                                    .frame(width: 4, height: 4)
                                    .padding(.top, 8)
                                VStack(alignment: .leading, spacing: 1) {
                                    Text(t)
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundStyle(JJIM.Text.primary)
                                    Text(d)
                                        .font(.system(size: 11.5))
                                        .foregroundStyle(JJIM.Text.tertiary)
                                }
                                Spacer()
                            }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 10)
                            .background(JJIM.Surface.panelLight)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(JJIM.Surface.hairline, lineWidth: 1)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                        }
                    }
                    .padding(.top, 18)

                    Spacer().frame(height: 130)
                }
                .padding(.horizontal, 24)
            }

            VStack {
                Spacer()
                ClayButton<EmptyView>("패스키 만들기", action: onCreatePasskey)
                    .padding(.horizontal, 24)
                    .padding(.bottom, 58)
            }
        }
    }
}

private struct PasskeyHeroIllustration: View {
    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                RadialGradient(
                    colors: [JJIM.Clay.glow.opacity(0.6), JJIM.Accent.primary.opacity(0)],
                    center: .center, startRadius: 0, endRadius: 100
                )
                Canvas { ctx, sz in
                    let cx = sz.width / 2 - 16
                    let cy = sz.height / 2
                    let style = StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round)
                    // face
                    let face = Path(ellipseIn: CGRect(x: cx - 22, y: cy - 22, width: 44, height: 44))
                    ctx.stroke(face, with: .color(JJIM.Accent.soft), style: style)
                    // eyes
                    ctx.fill(Path(ellipseIn: CGRect(x: cx - 8, y: cy - 5, width: 3, height: 3)), with: .color(JJIM.Accent.soft))
                    ctx.fill(Path(ellipseIn: CGRect(x: cx + 5, y: cy - 5, width: 3, height: 3)), with: .color(JJIM.Accent.soft))
                    // smile
                    var smile = Path()
                    smile.move(to: CGPoint(x: cx - 7, y: cy + 6))
                    smile.addQuadCurve(to: CGPoint(x: cx + 7, y: cy + 6), control: CGPoint(x: cx, y: cy + 11))
                    ctx.stroke(smile, with: .color(JJIM.Accent.soft), style: style)
                    // arrow
                    var arrow = Path()
                    arrow.move(to: CGPoint(x: cx + 30, y: cy))
                    arrow.addLine(to: CGPoint(x: cx + 44, y: cy))
                    arrow.move(to: CGPoint(x: cx + 40, y: cy - 4))
                    arrow.addLine(to: CGPoint(x: cx + 44, y: cy))
                    arrow.addLine(to: CGPoint(x: cx + 40, y: cy + 4))
                    ctx.stroke(arrow, with: .color(JJIM.Accent.primary), style: style)
                    // key
                    let kx = cx + 60
                    let circle = Path(ellipseIn: CGRect(x: kx - 9, y: cy - 9, width: 18, height: 18))
                    ctx.stroke(circle, with: .color(JJIM.Accent.warm), style: style)
                    ctx.fill(Path(ellipseIn: CGRect(x: kx - 3, y: cy - 3, width: 6, height: 6)),
                              with: .color(JJIM.Accent.warm))
                    ctx.fill(Path(CGRect(x: kx + 9, y: cy - 2, width: 22, height: 4)),
                              with: .color(JJIM.Accent.warm))
                    ctx.fill(Path(CGRect(x: kx + 22, y: cy + 2, width: 3, height: 6)),
                              with: .color(JJIM.Accent.warm))
                    ctx.fill(Path(CGRect(x: kx + 28, y: cy + 2, width: 3, height: 4)),
                              with: .color(JJIM.Accent.warm))
                }
                .frame(width: 220, height: 120)
            }
            .frame(height: 120)

            Text("Face ID → Passkey")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(JJIM.Accent.soft)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 28)
        .frame(maxWidth: .infinity)
        .background(JjimGradient.card)
        .overlay(
            RoundedRectangle(cornerRadius: JJIM.Radius.xxl)
                .stroke(JJIM.Surface.hairlineStrong, lineWidth: 1.5)
        )
        .clipShape(RoundedRectangle(cornerRadius: JJIM.Radius.xxl))
        .shadow(color: .black.opacity(0.5), radius: 16, y: 6)
    }
}

#Preview { JjimPasskey1().frame(width: 393, height: 852) }
