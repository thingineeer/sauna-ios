import Foundation
import Domain
import DomainInterface

@Observable
@MainActor
public final class RoomViewModel {
    public let roomId: Room.Kind
    public let crowd: Room.Crowd

    public private(set) var bubbles: [RisingMessage] = []
    public private(set) var headcount: Int

    public var inputText: String = ""
    public var keyboardUp: Bool = false

    /// Spawn cadence in seconds. Mirrors `interval` in the JSX simulator.
    public var spawnInterval: TimeInterval {
        switch crowd {
        case .lonely: return 3.2
        case .medium: return 1.4
        case .packed: return 0.7
        }
    }

    private let clock: ClockProviding
    private let random: RandomGenerating
    private var jitterCounter: Int = 0

    public init(
        roomId: Room.Kind,
        crowd: Room.Crowd,
        clock: ClockProviding = SystemClock(),
        random: RandomGenerating = SystemRandomGenerator()
    ) {
        self.roomId = roomId
        self.crowd = crowd
        self.clock = clock
        self.random = random
        self.headcount = {
            switch crowd {
            case .lonely: return 8
            case .medium: return 142
            case .packed: return 312
            }
        }()
    }

    /// Drop in N seed bubbles so the room never opens empty.
    public func seedInitialBubbles(count: Int = 3) {
        for _ in 0..<count { spawnFromBank(isMine: false) }
    }

    /// Spawn one bubble using a random bank entry. Public so a Timer or test
    /// driver can simulate the cadence externally.
    @discardableResult
    public func spawnFromBank(isMine: Bool) -> RisingMessage {
        let entry = RoomMessageBank.entries[random.index(of: RoomMessageBank.entries.count)]
        let bubble = RisingMessage(
            nickname: isMine ? "나" : entry.nickname,
            text: entry.text,
            xRel: 0.18 + CGFloat(random.double(in: 0.0...0.64)),
            spawnAt: clock.now(),
            life: 8.5 + random.double(in: 0.0...2.5),
            isMine: isMine
        )
        bubbles.append(bubble)
        // Cap to the most recent 8 to match the design's slice(-8).
        if bubbles.count > 8 { bubbles.removeFirst(bubbles.count - 8) }
        jitterCounter += 1
        return bubble
    }

    /// Tick — drops expired bubbles. Called from the SwiftUI TimelineView.
    public func tick(now: Date) {
        bubbles.removeAll { $0.isExpired(at: now) }
    }

    /// Send the user's text. The real implementation would dispatch to
    /// `SendMessageUseCase`; here we just animate locally to keep the view
    /// previewable / testable without a network.
    public func sendInput() {
        let t = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !t.isEmpty else { return }
        let bubble = RisingMessage(
            nickname: "나", text: t,
            xRel: 0.18 + CGFloat(random.double(in: 0.0...0.64)),
            spawnAt: clock.now(),
            life: 9.0,
            isMine: true
        )
        bubbles.append(bubble)
        if bubbles.count > 8 { bubbles.removeFirst(bubbles.count - 8) }
        inputText = ""
    }

    public func nextJitterSeed() -> Int {
        jitterCounter &+= 1
        return jitterCounter
    }
}
