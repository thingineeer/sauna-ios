import SwiftUI
import Domain
import DomainInterfaces
import DesignSystem
import SharedUI
import FeatureOnboarding
import FeatureHome
import FeatureRoom
import FeatureMe

/// Top-level navigator. Switches between the onboarding flow (until passkey
/// is registered) and the main 3-tab shell.
public struct RootView: View {
    @State private var phase: AppPhase
    @State private var onboarding = OnboardingFlowViewModel()
    @State private var activeTab: JjimTab = .home
    @State private var openRoom: Domain.Room.Kind? = nil

    public enum AppPhase { case onboarding, main }

    public init(initialPhase: AppPhase = .onboarding) {
        self._phase = State(initialValue: initialPhase)
    }

    public var body: some View {
        ZStack {
            switch phase {
            case .onboarding:  onboardingFlow
            case .main:        mainShell
            }
        }
        .preferredColorScheme(.dark)
        .background(JJIM.Bg.appDeep)
    }

    @ViewBuilder
    private var onboardingFlow: some View {
        switch onboarding.step {
        case .splash:
            JjimSplash()
                .task {
                    try? await Task.sleep(nanoseconds: 1_500_000_000)
                    onboarding.splashDidFinish()
                }
        case .onboard1:
            JjimOnboard1(onNext: onboarding.goNext, onSkip: onboarding.skipOnboarding)
        case .onboard2:
            JjimOnboard2(onNext: onboarding.goNext, onPrev: onboarding.goBack)
        case .onboard3:
            JjimOnboard3(
                nicknameValue: onboarding.nicknameValue,
                nicknameTag: onboarding.nicknameTag,
                onNext: onboarding.goNext,
                onReroll: {
                    let fresh = NicknameMinter.mint(at: Date(), random: SystemRandomGenerator())
                    onboarding.rerollNickname(value: fresh.value, tag: fresh.tag)
                }
            )
        case .passkey1:
            JjimPasskey1(onCreatePasskey: onboarding.goNext)
        case .passkey2:
            JjimPasskey2(onCancel: onboarding.goBack)
                .task {
                    try? await Task.sleep(nanoseconds: 1_400_000_000)
                    onboarding.goNext()
                }
        case .passkey3:
            JjimPasskey3(nickname: onboarding.nicknameValue, onEnter: { phase = .main })
        case .done:
            Color.clear.task { phase = .main }
        }
    }

    @ViewBuilder
    private var mainShell: some View {
        ZStack(alignment: .bottom) {
            VStack(spacing: 0) {
                Group {
                    switch activeTab {
                    case .home:
                        JjimHome(timeOfDay: TimeOfDay.from(hour: Calendar.current.component(.hour, from: Date()))) { kind in
                            switch kind {
                            case .daily: openRoom = .daily
                            case .stock: openRoom = .stock
                            case .job:   openRoom = .job
                            }
                        }
                    case .me:
                        JjimProfile(nicknameValue: onboarding.nicknameValue,
                                      nicknameTag: onboarding.nicknameTag)
                    case .settings:
                        JjimSettings()
                    }
                }
                Spacer(minLength: 0)
            }
            JjimTabBar(active: activeTab) { activeTab = $0 }
        }
        .modifier(RoomCoverPresenter(openRoom: $openRoom))
    }
}

private struct RoomCoverPresenter: ViewModifier {
    @Binding var openRoom: Domain.Room.Kind?
    func body(content: Content) -> some View {
        let item = Binding<RoomRoute?>(
            get: { openRoom.map(RoomRoute.init) },
            set: { openRoom = $0?.kind }
        )
        #if os(iOS)
        content.fullScreenCover(item: item) { route in
            JjimRoom(roomId: route.kind, crowd: .medium, onClose: { openRoom = nil })
        }
        #else
        content.sheet(item: item) { route in
            JjimRoom(roomId: route.kind, crowd: .medium, onClose: { openRoom = nil })
        }
        #endif
    }
}

private struct RoomRoute: Identifiable {
    let kind: Domain.Room.Kind
    var id: String { kind.rawValue }
}
