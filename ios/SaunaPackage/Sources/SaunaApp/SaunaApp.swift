import SwiftUI

public enum SaunaAppModule {
    public static let moduleName = "SaunaApp"
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
    @State private var container = AppContainer.live()
    public init() {}
    public var body: some View {
        RootView()
            .environment(container)
    }
}

#Preview { SaunaAppRoot().frame(width: 393, height: 852) }
