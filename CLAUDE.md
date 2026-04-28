# CLAUDE.md — Sauna

> 이 파일은 Claude Code가 이 레포에서 작업을 이어갈 때 읽는 컨텍스트입니다.
> 글로벌 `~/.claude/CLAUDE.md` 규칙을 따르되, 이 레포만의 규칙은 여기 추가합니다.

## 프로젝트 한 줄

황토방(찜질방) 톤의 익명 실시간 채팅 앱. 방 3개 고정(일상/주식/취준), 닉네임 매일 자정 새로, 메시지는 증기처럼 사라짐. iOS 17+ 네이티브, 일부 비실시간 페이지는 WKWebView.

## 현재 단계 (2026-04-28)

**iOS + 서버 Phase 2 wireup 코드 완료. 외부 시크릿 / 도메인 등록만 남음.**

- ✅ 디자인 정본 v3 (Jjimjilbang Flow) — 17 화면 모두 SwiftUI 구현
- ✅ 기술 스택 확정 (`docs/tech-stack-final.md`)
- ✅ iOS SPM 패키지 — 15 모듈 (Observability 추가) + 10 테스트 타겟
- ✅ **TDD 합계: iOS 72 + server 18 = 90 tests · 0 fail · 0 SwiftLint violations / 170 files**
- ✅ AppContainer.live() — KeychainNicknameStore + RemoteRoomRepository + PasskeyAuthenticator 실 wireup
- ✅ Apple Passkey 어댑터 (ASAuthorizationPlatformPublicKeyCredentialProvider)
- ✅ Sentry-Cocoa 8.x — 휘발성 정책 가드 (chat.message breadcrumb drop, headers 마스킹)
- ✅ Vapor 서버: Postgres 풀 + ensureSchema + PostgresPasskeyStore 실 SQL + InMemoryPasskeyStore 폴백
- ✅ PasskeyController: SecRandomCopyBytes 32-byte challenge + ChallengeStore actor + 5분 TTL
- ✅ 인프라: docker-compose (Redis + Postgres) + Terraform skeleton
- ✅ CI/CD: GitHub Actions (iOS build/test, server, lint-pr) + tag→TestFlight 잡
- ✅ Xcode project 자동 생성: `ios/project.yml` (xcodegen) + `ios/Makefile` + Fastlane
- ⏳ **남은 외부 작업** (코드 외):
  - App Store Connect 앱 등록 + Apple Developer Team 가입
  - `sauna.app` 도메인 + `/.well-known/apple-app-site-association` 호스팅 (Passkey associated domain)
  - GitHub secrets 입력: FASTLANE_TEAM_ID / APP_STORE_CONNECT_API_KEY_* / SENTRY DSN
  - WebAuthn 라이브러리 통합 (phase 3 — 현재는 challenge generation 까지)
  - 첫 TestFlight 빌드 업로드 → closed beta

## 먼저 읽어야 할 파일 (순서 중요)

1. **`README.md`** — 레포 구조 개괄
2. **`docs/tech-stack-final.md`** — 기술 스택 확정안 (이게 정본, `tech-stack.md`는 참고용)
3. **`design-handoff/v3-jjimjilbang/Jjimjilbang Flow.html`** — 디자인 정본 (top to bottom)
4. **`design-handoff/v3-jjimjilbang/lib/jjim-tokens.jsx`** — 황토방 토큰
5. **`design-handoff/v3-jjimjilbang/lib/jjim-screens-entry.jsx`** — Splash, Onboarding, Passkey
6. **`design-handoff/v3-jjimjilbang/lib/jjim-screens-main.jsx`** — Home, Room, Me
7. **`design-handoff/v3-jjimjilbang/lib/pixel-mascot.jsx`** — 콩이 픽셀 메이트
8. **`docs/PRD.md`** — 제품 요구사항
9. **`docs/personas.md`** — 5 페르소나 (P1~P5) — 설계 결정의 근거
10. **`docs/competitive-analysis.md`** — 경쟁사 분석 + 사망 함정
11. **`docs/architecture-ios.md`** — Clean Architecture + SPM 모듈 (v2 기준이지만 핵심 그대로)
12. **`docs/design-system.md`** — v2 메이플 톤 (참고만 — 컬러는 jjim-tokens가 정본)
13. **`docs/roadmap.md`** — Phase 0→6

## 레포 구조 (확정)

```
sauna-ios/
├── CLAUDE.md
├── README.md
├── .gitignore
├── docs/                            ← 설계 문서
├── design-handoff/
│   ├── sauna-app.html              ← v2 메이플 (참고)
│   ├── v3-jjimjilbang/              ← v3 황토방 (현재 정본)
│   │   ├── Jjimjilbang Flow.html
│   │   └── lib/
│   ├── lib/, scraps/, uploads/      ← v2 잔재
├── ios/
│   └── SaunaPackage/                ← SPM 패키지 (모든 모듈)
│       ├── Package.swift
│       ├── Sources/
│       └── Tests/
├── server/                          ← Vapor (Swift) 서버
│   ├── Package.swift
│   ├── Sources/SaunaServer/
│   ├── Tests/
│   └── Dockerfile
├── infra/
│   ├── docker-compose.yml           ← 로컬: redis + postgres
│   └── terraform/                   ← AWS Seoul (Phase 2+)
└── .github/workflows/
    ├── ios.yml
    └── server.yml
```

## 이 레포 규칙

### 디자인 정본
- **`design-handoff/v3-jjimjilbang/Jjimjilbang Flow.html`** 가 항상 정답.
- 색·간격·라운드는 `lib/jjim-tokens.jsx` + `lib/sauna-ds.jsx` 그대로 옮김.
- v2 메이플 톤 파일들(`design-handoff/sauna-app.html` 등)은 **참고만**.
- `docs/design-system.md` 의 컬러는 v2 기준 → 코드에서는 `JJIM` 토큰 사용.

### 이모지 금지
- 앱 UI에 이모지 절대 넣지 말 것. 전부 커스텀 SVG / SwiftUI Path.
- (예외: WKWebView 안의 외부 콘텐츠는 별개)
- 문서/커밋 메시지에는 OK.

### 톤
- 다크 only (v1)
- 황토 벽돌 + 마룻바닥 + 가마 글로우 + 픽셀 콩이
- 모션 느긋 (증기처럼 8.5초 라이프타임)
- 파스텔 / 뽀얀 / 귀여운 일러스트 금지

### 아키텍처
- Clean Architecture: `App → Feature → Domain ← Data` (역의존 금지)
- Domain 레이어는 Foundation만 import. SwiftUI / 네트워크 / Firebase 모름.
- 네트워크는 `NetworkClient` 프로토콜 뒤에 둠. URLSession은 `NetworkCore` 구현부에서만.
- 모듈 간 import 규칙은 `docs/tech-stack-final.md` §1.2 참조.

### TDD
- Domain UseCase: **TDD 필수.** 새 UseCase 추가 시 항상 failing test 먼저.
- ViewModel: 시간/랜덤 의존 모두 주입(`Clock`, `RandomGenerator`)으로 결정론적.
- View: 대표 화면(Splash, Home/evening, Room/medium, Profile)만 snapshot.
- 커버리지: Domain 90%+, Data 70%, ViewModel 70%.

### 모듈화 (SPM)
- 새 기능은 별도 모듈. Feature 간 직접 import 금지 — App만이 조립자.
- 외부 dep은 `Data` / `NetworkCore` / `WebViewBridge` 만 가질 수 있음. Domain·Feature는 외부 dep ❌.

### 비영속
- 메시지: 로컬·서버·로그 어디에도 저장 ❌ (휘발성이 제품 본질).
- 영속 OK: Keychain(익명 userId, Passkey 핸들), UserDefaults(설정 토글), SwiftData(차단목록 v2+).
- 서버 Postgres에는 **Passkey credential 만**.

### 보안
- 인증 = Apple Passkey (WebAuthn). 디자인 P1·P2·P3 그대로.
- 익명 ID = Keychain UUID, 폰 바뀌면 재발급 (디자인 텍스트 그대로).
- Certificate pinning (NetworkCore).
- 서버는 발화 텍스트 절대 영속 / 로그 남기지 않음.

### 하이브리드 (WKWebView)
- 채팅·홈·온보딩 = 네이티브.
- 약관·도움말·About·시즌 admin 콘텐츠 = `WebViewBridge` 모듈 통한 WKWebView.
- WKWebView는 화이트리스트 origin · JS bridge 최소면적.

## 글로벌 규칙 (user `~/.claude/CLAUDE.md` 요약)

- Git author: `thingineeer <dlaudwls1203@gmail.com>`
- Co-Authored-By 절대 금지 (AI 문구 포함 X)
- 커밋 메시지: 한글 또는 conventional commits (feat:/fix:/chore:/refactor:)
- push는 명시적 요청 시에만
- 시키지 않은 작업 하지 말 것

## 브랜치 / 머지 워크플로우 (확정)

**계층:**
```
release           ← Play Store / App Store 출시본 (production)
   ▲
   │ merge (배포 완료 후)
   │
  dev             ← 통합 테스트 (TestFlight / Internal QA)
   ▲
   │ merge (1.0.0 작업 종료 시)
   │
  1.0.0           ← 현재 버전 통합 브랜치
   ▲ ▲ ▲
   │ │ │ merge (각 worktree 작업 종료 시)
   │ │ │
  feature/foundation
  feature/feature-room
  feature/server-scaffold
  ... (worktree 단위 브랜치들)
```

**규칙:**
1. `1.0.0` 브랜치에서 **단위별로 worktree 브랜치**를 판다 (예: `feature/feature-room`, `feature/ci-actions`).
2. 각 worktree 브랜치는 **N개의 의미 있는 atomic 커밋**을 포함한다. 한 커밋 = 한 의도.
3. worktree 작업 종료 시 `1.0.0` 으로 **regular merge** (= merge commit 남김). **`squash` 머지 절대 금지.**
4. `1.0.0` 의 변화가 안정되면 `dev` 로 merge → 통합 테스트 / TestFlight.
5. App Store / Play Store 출시 완료 시 `dev` → `release` merge.
6. `main` 은 트렁크. 새 버전 시작 시 `main` 에서 다음 버전 브랜치(`1.1.0` 등)를 다시 판다.

**병렬 작업 (Worktree):**
```bash
# 1.0.0 에서 새 단위 작업 시작
git worktree add ../sauna-ios.feature-room -b feature/feature-room 1.0.0

# 작업 → atomic 커밋 N개

# 1.0.0 으로 머지 (squash 금지)
git checkout 1.0.0
git merge --no-ff feature/feature-room

# worktree 정리
git worktree remove ../sauna-ios.feature-room
git branch -d feature/feature-room
```

**에이전트 스폰 (자동 worktree):**
```
Agent({
  isolation: "worktree",
  description: "...",
  prompt: "...",
})
```
→ 에이전트가 worktree 안에서 작업하고 브랜치명·경로를 리턴. 메인 세션이 그걸 `1.0.0` 으로 `merge --no-ff` 한다.

## 결정 대기 / 오픈 이슈

- [x] Bundle ID — `th1ngjin.Sauna`
- [x] 디자인 톤 — v3 황토방
- [x] 서버 스택 — Vapor + Redis + Postgres
- [x] 인증 — Apple Passkey (WebAuthn)
- [x] 인프라 — AWS Seoul (ap-northeast-2) Fargate + ElastiCache + RDS
- [x] CI/CD — GitHub Actions
- [ ] iCloud Keychain Passkey 다중 기기 정책 (디자인은 단일 기기 가정)
- [ ] Rate-limit 구체 수치 (1초 2개 가설 검증 필요)
- [ ] 시즌 방 admin CMS (Notion / GitHub Pages / 자체)

## 참고 명령어

```bash
# v3 디자인 원본 열어보기
open "design-handoff/v3-jjimjilbang/Jjimjilbang Flow.html"

# iOS SPM 패키지 빌드/테스트
cd ios/SaunaPackage && swift build && swift test

# 서버 로컬 실행
cd server && swift run SaunaServer

# 로컬 인프라 (Redis + Postgres)
cd infra && docker-compose up -d
```
