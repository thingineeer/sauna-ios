# Sauna · v1 (1.0.0) 진행 상황

> 작성: 2026-04-28
> 브랜치: `1.0.0`

## 한 줄

**디자인 정본 v3 + iOS Phase 1 + Phase 2 wireup + 서버 Phase 2 wireup + Sentry + Tuist TMA(토스/카카오뱅크 스타일) 전환 + Fastlane TestFlight + tag→CI 까지 코드로 완료.** 외부 시크릿 / 도메인 등록만 남음.

## 검증

```
$ cd ios && make test
[OK] Domain                   19 passed / 0 failed
[OK] Data                     13 passed / 0 failed
[OK] PixelMascot               5 passed / 0 failed
[OK] Observability             3 passed / 0 failed
[OK] FeatureOnboarding         6 passed / 0 failed
[OK] FeatureHome               4 passed / 0 failed
[OK] FeatureRoom              13 passed / 0 failed
[OK] FeatureMe                 4 passed / 0 failed
Total: 67 passed / 0 failed

$ swift test --package-path server
Executed 18 tests, with 0 failures (0 unexpected) in 0.236 (0.238) seconds

$ swiftlint lint --strict --config .swiftlint.yml ios/Projects server/Sources
Done linting! Found 0 violations, 0 serious in 204 files.
```

**전체: 85 tests pass / 0 failures / 0 lint violations across 204 files.**

## 모듈 (iOS Tuist TMA — 14 Project + server 1)

### iOS Tuist TMA (`ios/Projects/`)

> 토스/카카오뱅크 패턴. Domain 은 4-target(Interface/Sources/Testing/Tests),
> 다른 모듈은 항상 `DomainInterface` 만 import. Workspace 정의는 `ios/Workspace.swift`.

| Layer | Project | 테스트 | 용도 |
|---|---|---|---|
| `App` | `Sauna` | (Smoke) | Composition Root + RootView 탭 네비 + AppHost @main + xcconfig + Info.plist |
| `Domain` | `Domain` (4-target) | 19건 | Interface(엔티티+프로토콜) / Sources(UseCase) / Testing(Stub) / Tests |
| `Data` | `Data` | 13건 | KeychainNicknameStore + RemoteRoomRepository + PasskeyAuthenticator |
| `Core` | `NetworkCore` | (DataTests) | Endpoint + URLSessionNetworkClient + WebSocketClient (actor) |
| `Core` | `DesignSystem` | — | JJIM 토큰 + Gradients + Pattern + Typography |
| `Core` | `CustomIcons` | — | 24개 아이콘 (SwiftUI Path) |
| `Core` | `PixelMascot` | 5건 | 콩이 16x16/32x32 + 24색 팔레트 |
| `Core` | `SharedUI` | — | ClayWall/Floor/Lamp/Button/Header/Avatar/RoomCard/TabBar/Pagination |
| `Core` | `WebViewBridge` | — | SaunaWebView (origin 화이트리스트 + popup 차단) |
| `Core` | `Observability` | 3건 | Sentry-Cocoa wrapper + 휘발성 정책 가드 |
| `Features` | `FeatureOnboarding` | 6건 | Splash + Onboard 1/2/3 + Passkey 1/2/3 + 7-step VM |
| `Features` | `FeatureHome` | 4건 | morning/evening/night + Enter |
| `Features` | `FeatureRoom` | 13건 | rise 애니 + density + 키보드 |
| `Features` | `FeatureMe` | 4건 | Profile + Settings (WKWebView 약관) + NotifPrefs |

### Server (`server/`)

| 영역 | 상태 | 테스트 | 용도 |
|---|---|---|---|
| `/health` | ✅ | 1 | 200 OK + version |
| `WS /ws/rooms/:roomId` | ✅ | 5 | per-room route, in-memory PubSub fanout |
| `PubSubBus` | ✅ | 4 | InMemory + RedisPubSubBus (REDIS_URL fallback) |
| `Postgres pool` | ✅ | — | DATABASE_URL 자동 wireup, ensureSchema |
| `PasskeyStore` | ✅ | 4 | InMemoryPasskeyStore + PostgresPasskeyStore (실 SQL) |
| `PasskeyController` | ✅ | 4 | begin/finish + ChallengeStore actor + SecRandom 32-byte |
| `RateLimiter` | ✅ | (RoomController) | per-userId 미들웨어 |
| `Dockerfile` | ✅ | — | multi-stage Swift slim |

## 화면 ↔ 디자인 정본 매핑

| 디자인 화면 | 구현 위치 |
|---|---|
| S0 Splash | `JjimSplash` |
| S1·S2·S3 Onboarding | `JjimOnboard1/2/3` |
| P1·P2·P3 Passkey | `JjimPasskey1/2/3` |
| H1·H2·H3 Home (morning/evening/night) | `JjimHome(timeOfDay:)` |
| H4 Enter | `JjimEnter` |
| R1~R4 Room (density 변형) | `JjimRoom(roomId:, crowd:)` |
| K1·K2 Keyboard | `JjimRoom(keyboardUp: true)` |
| M1·M2·M3 Me/Settings/Notif | `JjimProfile`, `JjimSettings`, `JjimNotifPrefs` |

## v2 진행 상황 (Phase 2 wireup)

| 항목 | 상태 |
|---|---|
| AppContainer.live() 실 Data 레이어 주입 | ✅ |
| Apple Passkey iOS 어댑터 (ASAuthorization) | ✅ 코드 |
| Sentry SDK + 휘발성 정책 | ✅ |
| Vapor Postgres 풀 + ensureSchema + PasskeyStore 실 SQL | ✅ |
| PasskeyController challenge generation (SecRandom) | ✅ |
| Xcode project 생성기 — **Tuist 4.43.2 + TMA(14 Project)** | ✅ |
| Fastlane TestFlight 템플릿 | ✅ |
| GitHub Actions tag→TestFlight 잡 (Tuist 기반) | ✅ |

## 남은 외부 작업 (코드 외 — 시크릿/계정/도메인)

| 항목 | 무엇이 필요 |
|---|---|
| Apple Developer Team 가입 + App Store Connect 앱 등록 | $99/년 멤버십, Bundle ID `th1ngjin.Sauna` 등록 |
| sauna.app 도메인 등록 + DNS | 도메인 구매, A 레코드 |
| `webcredentials:sauna.app` (Passkey associated domain) | `sauna.app/.well-known/apple-app-site-association` 호스팅 (App ID 와 team ID 포함) |
| TestFlight closed beta 사용자 초대 | App Store Connect 의 Internal Testing |
| Sentry 계정 + DSN | sentry.io 가입, 프로젝트 만들고 DSN 복사 |
| GitHub secrets 등록 | `gh secret set` 또는 web UI: FASTLANE_TEAM_ID, FASTLANE_ITC_TEAM_ID, APP_STORE_CONNECT_API_KEY_KEY_ID/ISSUER_ID/KEY, SAUNA_SENTRY_DSN |
| AWS Seoul 계정 + Terraform apply | IAM 사용자, ECR 푸시, ECS 배포 |
| Postgres + Redis 운영 인스턴스 | RDS / ElastiCache provisioning |
| WebAuthn 라이브러리 통합 (phase 3) | swift-server/webauthn-swift 또는 자체 — register/finish 의 CBOR/COSE 검증 완성 |

## 시작 가이드

```bash
# 0) Tuist 설치 (한 번만)
brew install tuist          # 또는 mise use -g tuist@4.43.2

# 1) 외부 SPM 받아오기 + 워크스페이스 생성
cd ios && make install      # Sentry 등 외부 dep
cd ios && make generate     # .xcworkspace + 14× .xcodeproj 생성

# 2) iOS 빌드/테스트/lint (Xcode 안 열고도 가능)
cd ios && make triple-check # build + test(67건) + lint

# 3) Xcode 에서 열기
cd ios && make open         # Sauna.xcworkspace 열림

# 4) 로컬 인프라 (Redis + Postgres)
cd infra && make local-up

# 5) 서버 로컬 실행
cd server && swift run SaunaServer
# (DATABASE_URL 미설정이면 InMemoryPasskeyStore 폴백)

# 6) 첫 TestFlight 빌드 (시크릿 입력 후)
cd ios && bundle install && make beta
```
