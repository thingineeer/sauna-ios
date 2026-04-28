import SwiftUI

/// iOS app entry. View 트리 + DI 는 `SaunaAppRoot` (같은 타겟의 SaunaApp.swift)
/// 에 정의돼 있다. 이 파일은 단지 @main 진입점.
@main
struct SaunaAppHost: App {
    var body: some Scene {
        WindowGroup {
            SaunaAppRoot()
        }
    }
}
