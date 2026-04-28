# Sauna

> 황토방(찜질방) 톤의 익명 실시간 채팅 앱 — 모노레포

## 한 줄 소개

황토 벽돌방에 앉아서 익명으로 땀 흘리듯 말을 뱉는다.
이름은 매일 자정 새로 부여되고, 말은 증기처럼 올라오다 사라진다.

## 현재 단계 (2026-04-28)

- [x] PM/디자인 v3 황토방 톤 확정 (`design-handoff/v3-jjimjilbang/`)
- [x] 기술 스택 확정 (`docs/tech-stack-final.md`)
- [x] iOS 모듈화 — **Tuist Modular Architecture(TMA) 14 Project** + DesignSystem + Domain (TDD) + 17개 화면 구현
- [x] CI/CD GitHub Actions (Tuist 기반 build/test + tag→TestFlight)
- [x] 인프라 docker-compose + Terraform 스켈레톤
- [x] Vapor 서버 Phase 2 wireup (Postgres/Redis/Passkey)
- [ ] Phase 3: WebAuthn 라이브러리 통합 + 운영 도메인/인프라

```
make test (ios)            →  67건 pass / 0 fail (8 schemes)
swift test server          →  18건 pass / 0 fail
swiftlint --strict         →  0 violations / 204 files
```

## 레포 구조

```
sauna-ios/                         ← 모노레포 루트 (이름은 추후 sauna로 변경 예정)
├── README.md                      ← 이 문서
├── CLAUDE.md                      ← Claude Code 컨텍스트 + 브랜치 워크플로우
├── docs/                          ← 설계 문서
│   ├── PRD.md
│   ├── tech-stack-final.md        ← 정본
│   ├── architecture-ios.md
│   ├── design-system.md
│   ├── personas.md                ← 5 페르소나 (P1~P5)
│   ├── competitive-analysis.md    ← 경쟁사 분석
│   └── roadmap.md
├── design-handoff/
│   ├── v3-jjimjilbang/             ← 디자인 정본 (Jjimjilbang Flow)
│   │   ├── Jjimjilbang Flow.html
│   │   ├── lib/                   ← React 레퍼런스
│   │   └── ...
│   └── (v2 메이플 잔존 — 참고만)
├── ios/                            ← Tuist Modular Architecture (TMA)
│   ├── Tuist.swift                 ← 글로벌 Tuist 설정
│   ├── Workspace.swift             ← 14 Project 워크스페이스
│   ├── Tuist/
│   │   ├── Package.swift            ← 외부 SPM (Sentry 등)
│   │   └── ProjectDescriptionHelpers/  ← SaunaConstants + library/feature 헬퍼
│   ├── Projects/
│   │   ├── App/Sauna/               ← Composition Root + xcconfig + entitlements
│   │   ├── Domain/                  ← Interface / Sources(UseCase) / Testing(Stub) / Tests
│   │   ├── Data/                    ← KeychainNicknameStore + Remote Repo + Passkey Auth
│   │   ├── Core/
│   │   │   ├── DesignSystem/        ← JJIM 토큰 + Gradient + Pattern
│   │   │   ├── CustomIcons/         ← 24개 아이콘 (SwiftUI Path)
│   │   │   ├── PixelMascot/         ← 콩이 (16x16/32x32 픽셀 렌더러)
│   │   │   ├── SharedUI/            ← ClayWall, RoomCard, TabBar, ...
│   │   │   ├── NetworkCore/         ← Endpoint + URLSession + WebSocket
│   │   │   ├── Observability/       ← Sentry-Cocoa wrapper + 휘발성 가드
│   │   │   └── WebViewBridge/       ← WKWebView 약관/About용
│   │   └── Features/
│   │       ├── Onboarding/          ← Splash + Onboard 1/2/3 + Passkey 1/2/3
│   │       ├── Home/                ← morning/evening/night + Enter
│   │       ├── Room/                ← rise 애니 + density + 키보드
│   │       └── Me/                  ← Profile + Settings + NotifPrefs
│   ├── Makefile                    ← tuist install/generate/build/test/lint/triple-check
│   └── fastlane/, Gemfile          ← TestFlight beta 업로드
├── server/                        ← Vapor 4 서버 (구축 중)
├── infra/
│   ├── docker-compose.yml         ← 로컬 Redis + Postgres
│   ├── .env.example
│   ├── Makefile
│   └── terraform/                 ← AWS Seoul Fargate 스켈레톤
├── .github/
│   ├── workflows/                 ← iOS / server / lint-pr
│   ├── CODEOWNERS
│   └── PULL_REQUEST_TEMPLATE.md
└── .swiftlint.yml
```

## 핵심 컨셉 (`design-handoff/v3-jjimjilbang/Jjimjilbang Flow.html`)

- 방 3개 고정: **일상 · 주식 · 취준** (+ 시즌 방은 개발자가 추가)
- 닉네임 매일 자정 새로
- 메시지는 증기처럼 올라오다 사라짐 (8.5–11s 라이프타임)
- 세션 기록 없음 (서버에도 절대 영속 안 함)
- 인증: Apple Passkey (이메일·전화 안 받음)
- 픽셀 메이트 콩이가 마룻바닥에 앉아 있음
- 전부 커스텀 SVG / SwiftUI Path 아이콘. 이모지 없음

## 시작하기

### iOS (Tuist)

```bash
# 첫 setup
brew install tuist               # 또는 mise use -g tuist@4.43.2
cd ios
make install                     # 외부 SPM (Sentry 등) 설치
make generate                    # .xcworkspace + 14× .xcodeproj 생성

# 일상 명령
make build                       # Sauna 앱 Debug 빌드
make test                        # 모든 모듈 단위 테스트
make lint                        # SwiftLint --strict
make triple-check                # build + test + lint
make open                        # Xcode 에서 Sauna.xcworkspace 열기
```

Xcode 16+ 필요. **`.xcworkspace` 와 `.xcodeproj` 는 generate 마다 새로 만들어지므로 .gitignore.** 수정 대상은 `ios/Projects/<Layer>/<Name>/Project.swift` 와 소스 파일들.

### 로컬 인프라

```bash
cd infra
docker-compose up -d     # Redis :6379, Postgres :5432
docker-compose down -v   # 정리
```

### 서버 (Vapor — 구축 중)

```bash
cd server
swift run SaunaServer
```

## 브랜치 / 워크플로우

`CLAUDE.md` 의 "브랜치 / 머지 워크플로우" 섹션 참고.
요약: `main` ← `dev` ← `1.0.0` ← `feature/*` (worktree). worktree 머지는 항상 regular merge (no squash).

## 환경 / 시크릿

이 레포는 시크릿 값을 절대 커밋하지 않음. 실제 값은 별도 private repo:

- **https://github.com/thingineeer/thingineeer-env** (sauna 폴더)
- 인벤토리: `docs/env-secrets.md`

## 라이선스

Private / 개인 프로젝트
