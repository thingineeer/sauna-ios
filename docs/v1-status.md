# Sauna · v1 (1.0.0) 진행 상황

> 작성: 2026-04-28
> 브랜치: `1.0.0`

## 한 줄

**디자인 정본 v3 (`design-handoff/v3-jjimjilbang/Jjimjilbang Flow.html`) 의 17개 화면을 SwiftUI 로 구현. TDD + 모듈화 + CI/CD + 인프라 스캐폴딩 완료. iOS 단독으로 build·test 성공. 서버는 별도 worktree.**

## 검증

```
$ swift test --package-path ios/SaunaPackage
Executed 65 tests, with 0 failures (0 unexpected) in 0.019 (0.025) seconds

$ swiftlint lint --strict ios/SaunaPackage/Sources
Done linting! Found 0 violations, 0 serious in 66 files.
```

## iOS 모듈 (SPM 14개)

| 모듈 | 상태 | 테스트 | 용도 |
|---|---|---|---|
| `Domain` | ✅ | 17건 | 순수 Swift entities/UseCases (TDD) |
| `DomainInterfaces` | ✅ | — | RoomRepository / NicknameRepository / Authenticator 프로토콜 |
| `NetworkCore` | ✅ | 5건 (DataTests) | URLSession + WebSocket |
| `Data` | ✅ | 5건 (DataTests) | KeychainNicknameStore + RemoteRoomRepository |
| `DesignSystem` | ✅ | 4건 | JJIM 토큰 + Gradients + Pattern + Typography |
| `CustomIcons` | ✅ | — | 24개 아이콘 (SwiftUI Path) |
| `PixelMascot` | ✅ | 5건 | 콩이 16x16/32x32 픽셀 렌더러 + 24색 팔레트 |
| `SharedUI` | ✅ | 1건 | ClayWall/Floor/Lamp/Button/Header/Avatar/RoomCard/TabBar/Pagination |
| `WebViewBridge` | ✅ | — | SaunaWebView (origin 화이트리스트 + popup 차단) |
| `FeatureOnboarding` | ✅ | 6건 | Splash + Onboard 1/2/3 + Passkey 1/2/3 + 7-step VM |
| `FeatureHome` | ✅ | 4건 | morning/evening/night + Enter |
| `FeatureRoom` | ✅ | 13건 | rise 애니 + density 변형 + 한글 키보드 mock |
| `FeatureMe` | ✅ | 3건 | Profile + Settings (WKWebView 약관) + NotifPrefs |
| `SaunaApp` | ✅ | 1건 | Composition Root + RootView 탭 네비 |

## 화면 ↔ 디자인 정본 매핑

| 디자인 화면 | 구현 위치 |
|---|---|
| S0 Splash | `JjimSplash` |
| S1·S2·S3 Onboarding | `JjimOnboard1/2/3` |
| P1·P2·P3 Passkey | `JjimPasskey1/2/3` |
| H1·H2·H3 Home (morning/evening/night) | `JjimHome(timeOfDay:)` |
| H4 Enter | `JjimEnter` |
| R1 Daily/medium | `JjimRoom(roomId:.daily, crowd:.medium)` |
| R2 Stock/packed | `JjimRoom(roomId:.stock, crowd:.packed)` |
| R3 Job/lonely | `JjimRoom(roomId:.job, crowd:.lonely)` |
| R4 Daily/lonely | `JjimRoom(roomId:.daily, crowd:.lonely)` |
| K1·K2 Keyboard | `JjimRoom(keyboardUp: true)` |
| M1 Profile | `JjimProfile` |
| M2 Settings | `JjimSettings` |
| M3 Notif | `JjimNotifPrefs` |

## TDD 통계

| 영역 | 테스트 수 | 어떤 행동을 검증하나 |
|---|---|---|
| Room.crowd | 3 | 인원 → lonely/medium/packed 분류 + Server-wire raw values + AllCases 순서 |
| Nickname | 2 | 유효 윈도우 + display handle |
| SlidingWindowRateLimiter | 3 | 1초 2개 + 거부 + 윈도우 슬라이딩 |
| SendMessageUseCase | 5 | empty/trim/length/rate-limit/repo-failure |
| AssignDailyNicknameUseCase | 3 | 캐시 재사용 + KST 자정 mint + dayBounds |
| RisingPhysics | 5 | y/opacity envelope/blur/scale/sway bound |
| RoomViewModel | 7 | crowd→head/spawn / spawn 결정론 / 8개 cap / tick 만료 / sendInput trim·empty |
| OnboardingFlow | 5 | forward/back/skip/reroll(1회) / setNickname |
| HomeData TimeOfDay | 3 | 시각대 분포 / 시각→bucket / 시각대 비교 |
| Settings/NotifPrefs | 3 | 디자인 기본값 정합성 |
| PixelMascot Sprites | 4 | 16x16/32x32 무결성 / fallback / 팔레트 커버리지 |
| Endpoint | 2 | GET URL+headers / POST body |
| URLSessionNetworkClient | 3 | 200 decode / non-2xx / decode failure |
| KeychainNicknameStore | 3 | 첫 mint 영속 / reroll 교체 / 자정 stale |
| RemoteRoomRepository | 2 | send 요청 형태 / occupancy decode |
| DesignSystem | 4 | clay base hex / cream / radius monotonic / spacing monotonic |
| Module smoke (5×) | 5 | 모듈 import + 식별자 회귀 |
| **합계** | **65** | |

## v2 (Phase 2) 작업 — 추후 wire up

- Vapor 서버 머지 (`feature/server-scaffold` worktree → `1.0.0`)
- `RootView` `AppContainer.live()` 가 `RemoteRoomRepository` + `KeychainNicknameStore` 를 주입하도록 교체
- Apple `ASAuthorizationController` 를 통한 진짜 Passkey 등록·인증
- Xcode 앱 타겟 (`ios/Sauna.xcodeproj`) 생성 → SPM 의존성 + Info.plist + Capabilities (Associated Domains for Passkey, Push)
- TestFlight closed beta + Sentry
