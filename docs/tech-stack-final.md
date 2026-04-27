# Sauna · 기술 스택 (확정 / Final Decision)

> 이 문서가 `docs/tech-stack.md` 의 탐색 단계를 종결하고 **확정안**을 정의합니다.
> 작성일: 2026-04-28
> 디자인 정본: `design-handoff/v3-jjimjilbang/Jjimjilbang Flow.html`

## 0. 의사결정 요약 (TL;DR)

| 영역 | 선택 | 한 줄 이유 |
|---|---|---|
| iOS 언어/프레임워크 | Swift 6 + SwiftUI (iOS 17+) | 픽셀 메이트·증기 모션 등 Canvas 풍부, @Observable 안정 |
| 아키텍처 | Clean Architecture + **모듈화 (SPM)** | 빌드시간↓, 경계 명확, 테스트 가능 |
| 테스트 | **TDD (Domain/UseCase/ViewModel)** + Snapshot(View) | 본 화면이 적기 때문에 도메인 회귀 막는 것이 ROI 최고 |
| 하이브리드 | WKWebView via `WebViewBridge` 모듈 | 약관/도움말/About 등 비실시간 페이지에만. 채팅은 네이티브 |
| 인증 | **Apple Passkey (WebAuthn)** | 디자인이 이미 패스키 플로우 채택 (P1·P2·P3) |
| 서버 언어 | **Swift Vapor 4** | iOS 모델 재사용·솔로 개발 컨텍스트 스위치↓ |
| 실시간 | **WebSocket + Redis Pub/Sub** | 휘발성 채팅과 정합 (영속 X), 한국 region 저지연 |
| 영속 저장소 | **Postgres (Passkey 자격증명만)** | 메시지는 절대 저장하지 않음 |
| Push | **APNs (APNSwift)** | iOS 한정 MVP |
| 인프라 | **AWS Seoul · ECS Fargate** + ElastiCache Redis + RDS Postgres | 한국 latency 최저, IaC = Terraform |
| CI/CD | **GitHub Actions** | iOS: build/lint/test/Fastlane, Server: docker→ECR→Fargate |
| 관측성 | Sentry + Grafana Cloud | v1 = Sentry만, v2에서 Grafana 추가 |

## 1. iOS 클라이언트

### 1.1 모듈화 (SPM)

`ios/SaunaPackage/Package.swift` 1개 — multi-target SPM. 각 모듈은 독립 빌드·테스트 가능.

```
SaunaApp                    ← Composition Root, DI, RootView
├── FeatureOnboarding       ← Splash, Onboard 1/2/3, Passkey 1/2/3
├── FeatureHome             ← Home (tod 변형), Enter
├── FeatureRoom             ← Room (rise 애니, 키보드, density 변형)
└── FeatureMe               ← Profile, Settings, NotifPrefs

Domain                      ← 순수 Swift (Foundation만)
DomainInterfaces            ← Repository, Authenticator 프로토콜

Data                        ← 구현부 (RemoteRoomRepository, KeychainNicknameStore...)
NetworkCore                 ← URLSession 기반 Client + WebSocket adapter

DesignSystem                ← Clay tokens, type scale, gradients
CustomIcons                 ← 24개 SwiftUI Path 아이콘
PixelMascot                 ← 콩이 (16x16 / 32x32 픽셀 렌더러)
SharedUI                    ← ClayWall, ClayLamp, ClayFloor, ClayButton, JjimMonoTag, JjimHeader, JjimAvatar, JjimRoomCard, JjimTabBar
WebViewBridge               ← WKWebView 래퍼 (about/terms/help 페이지)
```

### 1.2 의존성 방향

`App → Feature → Domain ← Data` (역의존 금지). Domain은 Foundation만 import. 각 Feature는 다른 Feature를 import 하지 않음 (App만이 조립).

### 1.3 TDD 정책

| 레이어 | 테스트 정책 | 커버리지 목표 |
|---|---|---|
| `Domain` | UseCase별 XCTest (mock Repo) | **90%+** |
| `DomainInterfaces` | (프로토콜만) | — |
| `Data` | URLProtocol mock + Redis mock | 70% |
| `Feature*` ViewModel | XCTest, 의존성 주입 | 70% |
| `Feature*` View | Snapshot (대표 화면 4종) | 시각 회귀 |
| `DesignSystem` / `CustomIcons` / `PixelMascot` | 토큰 값 검증 + 사이즈 회귀 | 50% |
| `WebViewBridge` | WKWebView delegate mocking | 핵심 path |

**TDD 적용 순서**:
1. UseCase 시그니처 결정 → 인터페이스(프로토콜) 작성
2. Failing test 작성 (Red)
3. 최소 구현 (Green)
4. 리팩터 (Refactor)

`FeatureRoom` 의 `RoomViewModel` 처럼 시간 기반 시뮬레이션이 들어간 화면도 `Clock` 추상화를 주입해 결정론적으로 테스트.

### 1.4 하이브리드 (WKWebView)

`WebViewBridge` 모듈에 `SaunaWebView`(SwiftUI 래퍼) + `WebPolicy`(허용 origin / 새창 거부 / JS bridge 화이트리스트) 정의.

사용처:
- `Settings → Sauna란?` (= `https://sauna.app/about`)
- `Settings → 약관/개인정보`
- 시즌 방 admin 콘텐츠 (관리자 푸시한 정적 페이지)

채팅·증기 애니는 네이티브 (성능·접근성·오프라인 동작).

### 1.5 보안

- **Passkey**: `ASAuthorizationPlatformPublicKeyCredentialProvider` (iOS 17+)
- 익명 ID = Keychain `Data` UUID(앱 첫 실행 시 1회 생성, 폰 바뀌면 재발급)
- 닉네임 = 자정마다 서버에서 재발급 (deterministic seed = userId + dateKST)
- Certificate pinning (NetworkCore)
- 메시지 ❌ 영속 저장 (UserDefaults · SwiftData · 파일 시스템 어디에도 안 적음)

## 2. 서버

### 2.1 스택

- **Vapor 4** (Swift 6) — HTTP + WebSocket
- **RediStack** — Redis client (pub/sub + presence)
- **PostgresKit** — Postgres (Passkey credentials, 시즌 방 메타만)
- **WebAuthnSwift** — WebAuthn RP (자체 / Vapor 패키지 검토)
- **APNSwift** — Push

### 2.2 디렉터리 구조

```
server/
├── Package.swift
├── Sources/
│   ├── SaunaServer/                 ← @main + boot
│   ├── App/
│   │   ├── configure.swift
│   │   ├── routes.swift
│   │   └── Controllers/
│   │       ├── RoomController.swift     ← /ws/rooms/:roomId
│   │       ├── PasskeyController.swift  ← /auth/passkey/{register,login}
│   │       └── HealthController.swift   ← /health
│   ├── Domain/                      ← 클라이언트와 공유 가능한 모델 (별 패키지로 분리 가능)
│   ├── PubSub/
│   │   ├── PubSubBus.swift              ← 추상
│   │   └── RedisPubSubBus.swift         ← 구현
│   └── Storage/
│       ├── PasskeyStore.swift
│       └── PostgresPasskeyStore.swift
├── Tests/
│   └── SaunaServerTests/
└── Dockerfile
```

### 2.3 메시지 흐름 (휘발)

1. 클라이언트 → `wss://api.sauna.app/ws/rooms/daily` (인증 헤더에 Passkey JWT)
2. 서버: 인증 검증 → 방 채널 구독 (`SUBSCRIBE room:daily`)
3. 클라이언트가 텍스트 보내면 → Rate-limit (per userId, 1초당 2개) → `PUBLISH room:daily {nickname, text, ts}`
4. 같은 채널 구독자 모두 broadcast (서버 메모리에도 메시지 보관 X)
5. 클라이언트 disconnect → 채널 unsubscribe (presence count -1)

### 2.4 Presence

Redis HASH `room:daily:presence`. 키 = userId, 값 = lastSeenAt. 매 30초 heartbeat. 서버는 `HKEYS room:daily:presence` 카운트 → home 카드의 `head` 표시.

## 3. 인프라

### 3.1 환경

| Env | 용도 | 호스팅 |
|---|---|---|
| local | 개발 | docker-compose (redis + postgres) |
| dev | 통합 | AWS Seoul · 작은 Fargate task 1개 |
| prod | 운영 | AWS Seoul · Fargate auto-scale (목표 P95 < 100ms) |

### 3.2 Terraform 구조 (스켈레톤만 v1)

```
infra/
├── docker-compose.yml         ← 로컬: redis + postgres
└── terraform/
    ├── main.tf                ← AWS provider
    ├── network.tf             ← VPC + subnets
    ├── ecs.tf                 ← ECS cluster + Fargate service
    ├── elasticache.tf         ← Redis
    ├── rds.tf                 ← Postgres
    └── alb.tf                 ← Application LB + ACM cert
```

v1: 손으로 콘솔 클릭 + Terraform import. v2에서 모듈화.

## 4. CI/CD

### 4.1 iOS

`.github/workflows/ios.yml`:
1. SwiftLint (warnings as errors)
2. `swift build` (SPM 패키지 통째로)
3. `swift test --enable-code-coverage`
4. (PR 머지 시) Fastlane → TestFlight (xcodeproj 만든 후 활성화)

### 4.2 Server

`.github/workflows/server.yml`:
1. `swift test`
2. Docker build (multi-stage: Swift slim runtime)
3. ECR push
4. ECS service update (rolling)

## 5. 관측성 (옵저버빌리티)

| 신호 | 도구 | 단계 |
|---|---|---|
| 에러 | Sentry (iOS + Server) | v1 |
| 메트릭 | Grafana Cloud + Prometheus exporter (Vapor) | v2 |
| 로그 | CloudWatch Logs (서버), 클라이언트는 ❌ (휘발 본질) | v1 |
| 트레이스 | OpenTelemetry | v3 |

> 클라이언트 로그 **수집 안 함** — 발화 내용은 절대 서버에도, 로그에도 남기지 않음. 메트릭은 카운트와 latency만.

## 6. 단계적 적용

| Phase | 산출물 |
|---|---|
| **Phase 0** | (현재) docs + 디자인 정본 v3 |
| **Phase 1** | iOS SPM 패키지 + DesignSystem + Domain + 17개 화면 (mock data) |
| **Phase 2** | Server scaffold (Vapor + Redis + WS) + iOS Network 연결 |
| **Phase 3** | Passkey end-to-end (iOS + Server) |
| **Phase 4** | TestFlight closed beta + Sentry |
| **Phase 5** | Push (APNs) + Settings 알림 미리보기 결선 |
| **Phase 6** | App Store 출시 |

## 7. 폐기/대체된 옵션

| 후보 | 폐기 사유 |
|---|---|
| Firebase RTDB | 휘발성 정책과 메시지 영속 디폴트 충돌, 한국 region 미지원 |
| Supabase | 휘발성 채팅에는 과한 영속 모델 |
| RN + WebKit | 픽셀 캔버스·SwiftUI 모션 품질 손실, 솔로 개발에 RN+iOS 듀얼 비용 |
| Node + Socket.IO | 솔로 dev 컨텍스트 스위치 비용, Swift end-to-end가 더 깔끔 |
| Pusher / Ably | 메시지 단가 → 피크시 비용 폭증. 우리는 직접 짜는 게 싸다 |

## 8. 오픈 이슈 (미정)

- [ ] iCloud Keychain 동기화 시 Passkey 다중 기기 동작 확인 (디자인은 "폰 바뀌면 재등록" 으로 단순화함)
- [ ] Rate-limit 구체값 (현재 가설: 발화 1초 2개 / 같은 텍스트 5초 1개)
- [ ] 자정 닉네임 리셋의 분산 처리 (모든 사용자 동시 호출 → Redis lua + jitter)
- [ ] 시즌 방 콘텐츠 CMS (admin이 어디서 입력? Notion API? GitHub Pages?)
