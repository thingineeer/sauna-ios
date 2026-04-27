# Sauna · v1 (1.0.0) 진행 상황

> 작성: 2026-04-28
> 브랜치: `1.0.0`

## 한 줄

**디자인 정본 v3 + iOS Phase 1 + Phase 2 wireup + 서버 Phase 2 wireup + Sentry + Xcode project + Fastlane TestFlight + tag→CI 까지 코드로 완료.** 외부 시크릿 / 도메인 등록만 남음.

## 검증

```
$ swift test --package-path ios/SaunaPackage
Executed 72 tests, with 0 failures (0 unexpected) in 0.018 (0.024) seconds

$ swift test --package-path server
Executed 18 tests, with 0 failures (0 unexpected) in 0.236 (0.238) seconds

$ swiftlint lint --strict --config .swiftlint.yml ios/SaunaPackage/Sources server/Sources
Done linting! Found 0 violations, 0 serious in 170 files.
```

**전체: 90 tests pass / 0 failures / 0 lint violations across 170 files.**

## 모듈 (iOS 15 + server 1)

### iOS SPM (`ios/SaunaPackage/`)

| 모듈 | 상태 | 테스트 | 용도 |
|---|---|---|---|
| `Domain` | ✅ | 21건 | 순수 Swift entities + UseCases (TDD) |
| `DomainInterfaces` | ✅ | — | RoomRepo / NicknameRepo / Authenticator 프로토콜 |
| `NetworkCore` | ✅ | (DataTests) | Endpoint + URLSessionNetworkClient + WebSocketClient (actor) |
| `Data` | ✅ | 11건 | KeychainNicknameStore + RemoteRoomRepository + PasskeyAuthenticator |
| `DesignSystem` | ✅ | 4건 | JJIM 토큰 + Gradients + Pattern + Typography |
| `CustomIcons` | ✅ | — | 24개 아이콘 (SwiftUI Path) |
| `PixelMascot` | ✅ | 5건 | 콩이 16x16/32x32 + 24색 팔레트 |
| `SharedUI` | ✅ | 1건 | ClayWall/Floor/Lamp/Button/Header/Avatar/RoomCard/TabBar/Pagination |
| `WebViewBridge` | ✅ | — | SaunaWebView (origin 화이트리스트 + popup 차단) |
| `Observability` | ✅ | 3건 | Sentry-Cocoa wrapper + 휘발성 정책 가드 |
| `FeatureOnboarding` | ✅ | 6건 | Splash + Onboard 1/2/3 + Passkey 1/2/3 + 7-step VM |
| `FeatureHome` | ✅ | 4건 | morning/evening/night + Enter |
| `FeatureRoom` | ✅ | 13건 | rise 애니 + density + 키보드 |
| `FeatureMe` | ✅ | 3건 | Profile + Settings (WKWebView 약관) + NotifPrefs |
| `SaunaApp` | ✅ | 1건 | Composition Root (live/mock) + RootView 탭 네비 |

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
| Xcode project 생성기 (xcodegen) | ✅ project.yml |
| Fastlane TestFlight 템플릿 | ✅ |
| GitHub Actions tag→TestFlight 잡 | ✅ |

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
# 1) iOS SPM 빌드/테스트 (Xcode 안 열고도 가능)
cd ios && make triple-check        # build + test + lint

# 2) Xcode 프로젝트 생성 (xcodegen 필요)
brew install xcodegen
make xcode

# 3) 로컬 인프라 (Redis + Postgres)
cd ../infra && make local-up

# 4) 서버 로컬 실행
cd ../server && swift run SaunaServer
# (DATABASE_URL 미설정이면 InMemoryPasskeyStore 폴백)

# 5) 첫 TestFlight 빌드 (시크릿 입력 후)
cd ../ios && bundle install && bundle exec fastlane beta
```
