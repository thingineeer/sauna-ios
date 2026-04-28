import SwiftUI
import Observability

public enum SaunaAppModule {
    public static let moduleName = "SaunaApp"
    public static let releaseName = "Sauna@0.1.0"
}

/// SwiftUI App entry. The host app target embeds the SPM package and writes:
/// ```swift
/// import SaunaApp
/// @main struct SaunaAppHost: App {
///     var body: some Scene {
///         WindowGroup {
///             RootView()
///                 .environment(AppContainer.live())
///         }
///     }
/// }
/// ```
/// Keeping this file at module level lets us instantiate `RootView()` from a
/// hosted preview / unit test without dragging the entire App target in.
public struct SaunaAppRoot: View {
    @State private var container: AppContainer

    public init() {
        let env = AppEnvironment.fromBundle()
        // 부트스트랩은 한 번만. AppContainer.live() 도 같은 env 를 사용.
        Observability.bootstrap(
            dsn: env.sentryDSN,
            environment: env.useStubRoom ? "preview" : "production",
            release: SaunaAppModule.releaseName
        )
        _container = State(initialValue: AppContainer.live(env: env))
    }

    public var body: some View {
        RootView()
            .environment(container)
    }
}

#Preview { SaunaAppRoot().frame(width: 393, height: 852) }
