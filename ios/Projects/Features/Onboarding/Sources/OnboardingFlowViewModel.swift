import Foundation

/// State machine for the entry flow (Splash → Onboarding 1·2·3 → Passkey 1·2·3 → done).
@Observable
@MainActor
public final class OnboardingFlowViewModel {
    public enum Step: Equatable, Sendable {
        case splash
        case onboard1, onboard2, onboard3
        case passkey1, passkey2, passkey3
        case done
    }

    public private(set) var step: Step = .splash
    public private(set) var nicknameValue: String = "노곤한사슴"
    public private(set) var nicknameTag: String = "4F29"
    public private(set) var rerollCount: Int = 0
    public let rerollLimitPerDay: Int = 1

    public init(initial: Step = .splash) {
        self.step = initial
    }

    public func splashDidFinish() {
        guard step == .splash else { return }
        step = .onboard1
    }

    public func goNext() {
        switch step {
        case .splash:    step = .onboard1
        case .onboard1:  step = .onboard2
        case .onboard2:  step = .onboard3
        case .onboard3:  step = .passkey1
        case .passkey1:  step = .passkey2
        case .passkey2:  step = .passkey3
        case .passkey3:  step = .done
        case .done:      break
        }
    }

    public func goBack() {
        switch step {
        case .splash, .onboard1: break
        case .onboard2: step = .onboard1
        case .onboard3: step = .onboard2
        case .passkey1: step = .onboard3
        case .passkey2: step = .passkey1
        case .passkey3: step = .passkey2
        case .done:     break
        }
    }

    public func skipOnboarding() {
        step = .passkey1
    }

    /// Returns true if reroll succeeded.
    @discardableResult
    public func rerollNickname(value: String, tag: String) -> Bool {
        guard rerollCount < rerollLimitPerDay else { return false }
        nicknameValue = value
        nicknameTag = tag
        rerollCount += 1
        return true
    }

    public func setNickname(value: String, tag: String) {
        nicknameValue = value
        nicknameTag = tag
    }
}
