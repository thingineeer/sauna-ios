import SwiftUI
import SaunaApp     // SPM module

/// iOS app entry. The actual View tree + DI lives in the `SaunaApp` SPM target;
/// this host just bootstraps it.
@main
struct SaunaAppHost: App {
    var body: some Scene {
        WindowGroup {
            SaunaAppRoot()
        }
    }
}
