# Sauna

> 황토방(찜질방) 톤의 익명 실시간 채팅 앱 — 모노레포

## 한 줄 소개

황토 벽돌방에 앉아서 익명으로 땀 흘리듯 말을 뱉는다.
이름은 매일 자정 새로 부여되고, 말은 증기처럼 올라오다 사라진다.

## 현재 단계 (2026-04-28)

- [x] PM/디자인 v3 황토방 톤 확정 (`design-handoff/v3-jjimjilbang/`)
- [x] 기술 스택 확정 (`docs/tech-stack-final.md`)
- [x] iOS 모듈화 + DesignSystem + Domain (TDD) + 17개 화면 모두 구현
- [x] CI/CD GitHub Actions
- [x] 인프라 docker-compose + Terraform 스켈레톤
- [ ] 서버 (Vapor) 스캐폴딩 (작업 중)
- [ ] iOS 앱 타겟 (`Sauna.xcodeproj`) — Xcode UI에서 한 번 생성 필요
- [ ] Phase 2: WebSocket 연결 + Passkey end-to-end

```
swift test (ios/SaunaPackage)  →  55건 pass / 0 fail
swiftlint --strict             →  0 violations / 61 files
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
├── ios/
│   └── SaunaPackage/              ← SPM 멀티 타겟 패키지
│       ├── Package.swift
│       ├── Sources/
│       │   ├── SaunaApp/          ← Composition Root
│       │   ├── Domain/             ← UseCases (TDD) + Entities
│       │   ├── DomainInterfaces/
│       │   ├── Data/
│       │   ├── NetworkCore/
│       │   ├── DesignSystem/       ← JJIM 토큰 + Gradient + Pattern
│       │   ├── CustomIcons/        ← 24개 아이콘 (SwiftUI Path)
│       │   ├── PixelMascot/        ← 콩이 (16x16/32x32 픽셀 렌더러)
│       │   ├── SharedUI/           ← ClayWall, ClayLamp, RoomCard, TabBar...
│       │   ├── WebViewBridge/      ← WKWebView 약관/About용
│       │   ├── FeatureOnboarding/  ← Splash + Onboard 1/2/3 + Passkey 1/2/3
│       │   ├── FeatureHome/        ← morning/evening/night + Enter
│       │   ├── FeatureRoom/        ← rise 애니 + density + 키보드
│       │   └── FeatureMe/          ← Profile + Settings + NotifPrefs
│       └── Tests/
│           ├── DomainTests/        ← UseCase TDD (90%+)
│           ├── DesignSystemTests/  ← 토큰 회귀
│           ├── PixelMascotTests/   ← 스프라이트 무결성
│           ├── FeatureOnboardingTests/
│           ├── FeatureHomeTests/
│           ├── FeatureRoomTests/   ← rise physics + ViewModel
│           └── FeatureMeTests/
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

### iOS

```bash
cd ios/SaunaPackage
swift build
swift test
```

Xcode 16+ 에서 `Package.swift` 를 열면 미리보기 / 단위 테스트 가능.
앱 타겟이 필요하면 별도 `Sauna.xcodeproj` 를 만들고 SPM로 `SaunaApp` 모듈을 의존하면 됨.

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
