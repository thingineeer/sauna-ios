import SwiftUI
import Domain
import DomainInterface
import DesignSystem
import CustomIcons
import PixelMascot
import SharedUI

public struct JjimRoom: View {
    @State private var vm: RoomViewModel
    public let onClose: () -> Void

    public init(
        roomId: Room.Kind = .daily,
        crowd: Room.Crowd = .medium,
        keyboardUp: Bool = false,
        onClose: @escaping () -> Void = {}
    ) {
        let model = RoomViewModel(roomId: roomId, crowd: crowd)
        model.keyboardUp = keyboardUp
        model.seedInitialBubbles()
        self._vm = State(initialValue: model)
        self.onClose = onClose
    }

    public var body: some View {
        ZStack {
            ClayBrickPattern().ignoresSafeArea()
            JjimGradient.clayWall.ignoresSafeArea()
            // Top + bottom kiln glows
            JjimGradient.ceilingGlowTop.ignoresSafeArea().allowsHitTesting(false)
            JjimGradient.ceilingGlowBottom.ignoresSafeArea().allowsHitTesting(false)

            VStack { Spacer(); ClayFloorPattern().frame(height: 140) }
                .ignoresSafeArea()
                .allowsHitTesting(false)

            // ceiling lamp
            VStack {
                HStack {
                    Spacer()
                    ClayLamp().padding(.trailing, 22).padding(.top, 130)
                }
                Spacer()
            }
            .allowsHitTesting(false)

            // header
            VStack(alignment: .leading) {
                HStack(alignment: .top, spacing: 10) {
                    Button(action: onClose) {
                        Text("‹")
                            .font(.system(size: 22, weight: .regular))
                            .foregroundStyle(JJIM.Text.primary)
                            .frame(width: 36, height: 36)
                            .background(JJIM.Surface.panel)
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(JJIM.Surface.hairline, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                    .buttonStyle(.plain)

                    VStack(alignment: .leading, spacing: 6) {
                        HStack(spacing: 5) {
                            Circle().fill(dotColor).frame(width: 5, height: 5).shadow(color: dotColor, radius: 3)
                            Text(meta.tag)
                                .font(.system(size: 9, weight: .bold, design: .monospaced))
                                .tracking(2.5)
                                .foregroundStyle(JJIM.Accent.soft)
                        }
                        .padding(.horizontal, 8).padding(.vertical, 3)
                        .background(JJIM.Surface.panel)
                        .overlay(RoundedRectangle(cornerRadius: 4).stroke(JJIM.Surface.hairline, lineWidth: 1))
                        .clipShape(RoundedRectangle(cornerRadius: 4))

                        Text(meta.label)
                            .font(.system(size: 22, weight: .bold))
                            .kerning(-0.6)
                            .foregroundStyle(JJIM.Text.primary)
                            .shadow(color: .black.opacity(0.6), radius: 3, y: 2)
                        Text("\(meta.sub) · 지금 \(vm.headcount)명")
                            .font(.system(size: 11))
                            .foregroundStyle(JJIM.Text.tertiary)
                    }
                    Spacer()
                    LiveBadge(headcount: vm.headcount, dotColor: dotColor)
                }
                .padding(.horizontal, 16)
                .padding(.top, 54)
                .padding(.bottom, 10)
                Spacer()
            }

            // bubble stage
            TimelineView(.animation(minimumInterval: 1.0 / 30.0, paused: false)) { context in
                BubbleStage(vm: vm, now: context.date,
                             keyboardUp: vm.keyboardUp)
            }
            .padding(.top, 180)
            .padding(.bottom, vm.keyboardUp ? 360 : 96)

            // 콩이 (left + right)
            VStack {
                Spacer()
                HStack {
                    PixelMascotView(
                        pose: vm.crowd == .lonely ? .doze : .idle,
                        tone: .warm, size: 16, scale: 4
                    )
                    .padding(.leading, 24)
                    .padding(.bottom, 100)
                    .shadow(color: .black.opacity(0.6), radius: 3, y: 3)

                    Spacer()

                    PixelMascotView(
                        pose: vm.crowd == .packed ? .sweat : .drink,
                        tone: .warm, size: 16, scale: 4
                    )
                    .padding(.trailing, 30)
                    .padding(.bottom, 110)
                    .shadow(color: .black.opacity(0.6), radius: 3, y: 3)
                }
            }
            .allowsHitTesting(false)

            // input + keyboard
            VStack { Spacer(); inputArea }

            // simulator: spawn cadence (real flow gets messages from WS)
            SpawnDriver(vm: vm)
        }
        .background(JJIM.Bg.appDeep)
        .preferredColorScheme(.dark)
    }

    private var meta: (tag: String, label: String, sub: String) {
        switch vm.roomId {
        case .daily: return ("SAUNA · DAILY", "일상 황토방", "하루 흘려보내기")
        case .stock: return ("SAUNA · STOCK", "주식 황토방", "장 식히기")
        case .job:   return ("SAUNA · JOB", "취준 황토방", "잠시 숨고르기")
        }
    }

    private var dotColor: Color {
        switch vm.crowd {
        case .lonely: return Color(red: 0.6, green: 0.73, blue: 0.8)
        case .medium: return JJIM.Accent.primary
        case .packed: return Color(red: 1.0, green: 0.42, blue: 0.165)
        }
    }

    @ViewBuilder
    private var inputArea: some View {
        if vm.keyboardUp {
            VStack(spacing: 0) {
                inputBar(active: true)
                    .padding(.horizontal, 14)
                    .padding(.bottom, 12)
                KoreanKeyboardMock()
                    .frame(height: 280)
                    .background(LinearGradient(colors: [
                        Color(red: 0.165, green: 0.094, blue: 0.031),
                        Color(red: 0.102, green: 0.055, blue: 0.016),
                    ], startPoint: .top, endPoint: .bottom))
                    .overlay(Rectangle().fill(JJIM.Surface.hairline).frame(height: 1), alignment: .top)
                    .shadow(color: .black.opacity(0.5), radius: 8, y: -8)
            }
        } else {
            inputBar(active: false)
                .padding(.horizontal, 14)
                .padding(.bottom, 28)
        }
    }

    private func inputBar(active: Bool) -> some View {
        HStack(spacing: 6) {
            if active {
                HStack(spacing: 0) {
                    Text("여기 진짜 따뜻하다")
                        .foregroundStyle(JJIM.Text.primary)
                    Text("|")
                        .foregroundStyle(JJIM.Accent.warm)
                        .opacity(0.8)
                }
                .font(.system(size: 14))
                Spacer()
            } else {
                Text("땀과 함께 흘려보내…")
                    .font(.system(size: 14))
                    .foregroundStyle(JJIM.Text.tertiary)
                Spacer()
            }
            Button {
                vm.sendInput()
            } label: {
                Text("↗")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(Color(red: 0.165, green: 0.063, blue: 0))
                    .frame(width: 36, height: 36)
                    .background(JjimGradient.ctaPrimary)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .shadow(color: .black.opacity(0.4), radius: 4, y: 2)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 16)
        .padding(.leading, 16)
        .frame(height: 48)
        .background(LinearGradient(colors: active
                                    ? [Color(red: 0.235, green: 0.110, blue: 0.047).opacity(0.92),
                                       Color(red: 0.118, green: 0.047, blue: 0.016).opacity(0.96)]
                                    : [Color(red: 0.235, green: 0.110, blue: 0.047).opacity(0.78),
                                       Color(red: 0.118, green: 0.047, blue: 0.016).opacity(0.92)],
                                     startPoint: .top, endPoint: .bottom))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(active ? JJIM.Accent.warm.opacity(0.53) : JJIM.Surface.hairlineStrong,
                          lineWidth: active ? 1.5 : 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .shadow(color: active ? JJIM.Accent.primary.opacity(0.12) : .clear,
                  radius: 0, x: 0, y: 0)
    }
}

private struct LiveBadge: View {
    let headcount: Int
    let dotColor: Color
    var body: some View {
        VStack(spacing: 2) {
            Text("LIVE")
                .font(.system(size: 7.5, weight: .bold, design: .monospaced))
                .tracking(1.6)
                .foregroundStyle(dotColor)
            Text("\(headcount)")
                .font(.system(size: 16, weight: .bold, design: .monospaced))
                .foregroundStyle(JJIM.Text.primary)
        }
        .frame(minWidth: 52)
        .padding(.horizontal, 10).padding(.vertical, 6)
        .background(JJIM.Surface.panel)
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(JJIM.Surface.hairline, lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

private struct BubbleStage: View {
    let vm: RoomViewModel
    let now: Date
    let keyboardUp: Bool

    var body: some View {
        GeometryReader { geo in
            ZStack {
                ForEach(vm.bubbles) { msg in
                    let t = msg.progress(at: now)
                    let x = RisingPhysics.x(width: geo.size.width, xRel: msg.xRel, progress: t, jitterSeed: msg.id.hashValue & 31)
                    let yOffset = RisingPhysics.y(progress: t)
                    BubbleView(msg: msg)
                        .scaleEffect(RisingPhysics.scale(progress: t))
                        .opacity(RisingPhysics.opacity(progress: t))
                        .blur(radius: RisingPhysics.blurRadius(progress: t))
                        .position(x: x, y: yOffset)
                        .allowsHitTesting(false)
                }
            }
            .frame(width: geo.size.width, height: geo.size.height)
        }
        // tick removal of expired
        .task(id: now) {
            vm.tick(now: now)
        }
    }
}

private struct BubbleView: View {
    let msg: RisingMessage
    var body: some View {
        VStack(spacing: 2) {
            Text(msg.nickname)
                .font(.system(size: 9, weight: .bold, design: .monospaced))
                .tracking(0.3)
                .foregroundStyle(msg.isMine ? Color(red: 1.0, green: 0.898, blue: 0.627)
                                              : JJIM.Accent.soft)
            Text(msg.text)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Color(red: 1.0, green: 0.941, blue: 0.847))
                .lineLimit(3)
                .multilineTextAlignment(.center)
                .shadow(color: Color(red: 0.196, green: 0.059, blue: 0.0).opacity(0.95), radius: 1, y: 1)
        }
        .padding(.horizontal, 14).padding(.vertical, 8)
        .background(LinearGradient(colors: msg.isMine
                                    ? [Color(red: 1.0, green: 0.78, blue: 0.51).opacity(0.55),
                                       Color(red: 0.9, green: 0.59, blue: 0.31).opacity(0.42)]
                                    : [Color(red: 1.0, green: 0.86, blue: 0.71).opacity(0.36),
                                       Color(red: 0.9, green: 0.71, blue: 0.51).opacity(0.22)],
                                     startPoint: .top, endPoint: .bottom))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(msg.isMine ? Color(red: 1.0, green: 0.71, blue: 0.39).opacity(0.85)
                                   : Color(red: 1.0, green: 0.82, blue: 0.67).opacity(0.42),
                          lineWidth: msg.isMine ? 1.5 : 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .shadow(color: msg.isMine
                ? JJIM.Accent.primary.opacity(0.5)
                : Color(red: 0.86, green: 0.55, blue: 0.31).opacity(0.3),
                radius: msg.isMine ? 12 : 7)
        .frame(maxWidth: 280)
    }
}

/// Drives the spawn cadence using SwiftUI's `Timer.publish`. In the real flow
/// this is replaced by an async task that consumes `RoomRepository.observeMessages`.
private struct SpawnDriver: View {
    let vm: RoomViewModel
    @State private var lastSpawn: Date = .distantPast
    @State private var lastMine: Date = .distantPast
    var body: some View {
        TimelineView(.periodic(from: .now, by: 0.2)) { context in
            Color.clear.onChange(of: context.date) { _, now in
                if now.timeIntervalSince(lastSpawn) > vm.spawnInterval {
                    lastSpawn = now
                    vm.spawnFromBank(isMine: false)
                }
                // Occasionally throw in a "내" bubble for variety.
                if now.timeIntervalSince(lastMine) > 4.8 {
                    lastMine = now
                    if Int.random(in: 0..<10) < 3 {
                        vm.spawnFromBank(isMine: true)
                    }
                }
            }
        }
        .frame(width: 0, height: 0)
        .allowsHitTesting(false)
    }
}

private struct KoreanKeyboardMock: View {
    private let rows: [[String]] = [
        ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ"],
        ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ"],
        ["⇧", "ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ", "⌫"],
        ["123", "🌐", "space", "enter"],
    ]

    var body: some View {
        VStack(spacing: 6) {
            ForEach(0..<rows.count, id: \.self) { ri in
                HStack(spacing: 4) {
                    ForEach(0..<rows[ri].count, id: \.self) { ki in
                        let k = rows[ri][ki]
                        let isSpace = k == "space"
                        let isEnter = k == "enter"
                        let label = isSpace ? "띄어쓰기" : k
                        let bg: AnyShapeStyle = isEnter
                            ? AnyShapeStyle(JjimGradient.ctaPrimary)
                            : AnyShapeStyle(Color(red: 0.314, green: 0.165, blue: 0.071).opacity(0.85))

                        Text(label)
                            .font(.system(size: (isSpace || isEnter) ? 12 : 14, weight: .semibold))
                            .foregroundStyle(isEnter ? Color(red: 0.165, green: 0.063, blue: 0.0)
                                                       : JJIM.Text.primary)
                            .frame(maxWidth: isSpace ? .infinity : 38)
                            .frame(height: 40)
                            .background(bg)
                            .overlay(
                                RoundedRectangle(cornerRadius: 6)
                                    .stroke(JJIM.Clay.glow.opacity(0.18), lineWidth: 1)
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                            .shadow(color: .black.opacity(0.6), radius: 1, y: 1)
                    }
                }
            }
        }
        .padding(.horizontal, 6)
        .padding(.top, 12)
    }
}

#Preview("daily / medium") {
    JjimRoom(roomId: .daily, crowd: .medium).frame(width: 393, height: 852)
}
#Preview("stock / packed") {
    JjimRoom(roomId: .stock, crowd: .packed).frame(width: 393, height: 852)
}
#Preview("job / lonely") {
    JjimRoom(roomId: .job, crowd: .lonely).frame(width: 393, height: 852)
}
#Preview("daily / medium / keyboard up") {
    JjimRoom(roomId: .daily, crowd: .medium, keyboardUp: true).frame(width: 393, height: 852)
}
