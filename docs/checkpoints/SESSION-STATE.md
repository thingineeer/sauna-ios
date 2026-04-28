# Session State — Sauna iOS

## Date
2026-04-29

## Branch
`1.0.0` (앞서 push 완료, origin/1.0.0 와 동기화됨)

## Completed (이번 세션)
- [x] **SPM 단일 패키지 → Tuist Modular Architecture(TMA) 전환** (commit `99ec5c6`)
  - 14 Tuist Project 분할: App×1 / Domain(4-target) / Data / Core×7 / Features×4
  - `ios/Tuist.swift` + `Workspace.swift` + `Tuist/Package.swift` + `ProjectDescriptionHelpers`
  - 엔티티(Room/Message/Nickname/User/Clock/RandomGenerating)를 `Domain/Interface/` 로 이동
  - `DomainTesting` 에 Stub repo 분리 (AppContainer 의 inline stub 제거)
  - 기존 `SaunaPackage/`, `SaunaApp/`, `SaunaTests/`, `project.yml` 삭제
- [x] **Makefile · CI · SwiftLint Tuist 기반 갱신** (commit 같음)
  - `make install/generate/build/test/lint/triple-check/open/clean/beta`
  - `.swiftlint.yml` included: `ios/Projects` (구 `ios/SaunaPackage/Sources` 폐기)
  - `.gitignore`: `Sauna.xcworkspace`, `**/*.xcodeproj`, `**/Derived`, `Tuist/.build` ignore
- [x] **CLAUDE.md / README / docs/v1-status.md** TMA 반영 (commit `b64e2bd`)
- [x] **CI 그린 만들기** (commit `cc613a0`)
  - macos-14(Xcode 15.4 / Swift 5.10) → macos-15(Xcode 16.4 / Swift 6.0)
  - SIMULATOR `iPhone 17` → `iPhone 16` (Xcode 16 기본 시뮬레이터)
  - testflight 잡: xcodegen → Tuist
  - Fastfile: `project: Sauna.xcodeproj` → `workspace: Sauna.xcworkspace`. `increment_build_number` 만 plist 수정용으로 `Projects/App/Sauna/Sauna.xcodeproj` 사용

## Verification
- 로컬 `make test` → 67 passed / 0 failed (Domain 19 / Data 13 / FeatureRoom 13 / FeatureOnboarding 6 / PixelMascot 5 / FeatureMe 4 / FeatureHome 4 / Observability 3)
- 로컬 `swiftlint --strict ios/Projects server/Sources` → 0 violations / 204 files
- CI run 25082278229: Build & Test (Tuist) ✅, SwiftLint (strict) ✅, TestFlight skipped (정상 — `v*` tag 에만 실행)
- Tuist generate 0.8s, 14 Project 모두 정상 생성

## In Progress
- 없음 — 이번 세션 종료 시점에서 1.0.0 브랜치 안정.

## Remaining (다음 세션 후보)
- [ ] **1.0.0 → dev 머지** (CLAUDE.md §"브랜치 / 머지 워크플로우" 4번)
  - `git checkout dev && git merge --no-ff 1.0.0 && git push origin dev`
  - regular merge 만 (squash 금지)
- [ ] **외부 작업** (코드 외):
  - App Store Connect 앱 등록 + Apple Developer Team 가입
  - `sauna.app` 도메인 + `/.well-known/apple-app-site-association` 호스팅
  - GitHub secrets: `FASTLANE_TEAM_ID`, `APP_STORE_CONNECT_API_KEY_*`, `SAUNA_SENTRY_DSN`
  - WebAuthn 라이브러리 통합 (현재는 challenge generation 단계까지)
  - 첫 TestFlight 빌드 → closed beta
- [ ] **CI/runner 미정**: 로컬은 Xcode 26 / iPhone 17 simulator. CI 는 Xcode 16 / iPhone 16. 필요 시 macos-26 GA 후 또는 self-hosted runner 로 일치시키기.

## Key Files
다른 환경에서 컨텍스트 이어가려면 이 순서대로 읽기:
- `CLAUDE.md` — 프로젝트 컨텍스트 + 브랜치 정책 + Tuist TMA 규칙
- `docs/v1-status.md` — 모듈 매트릭스 + 검증 수치
- `ios/Workspace.swift` — 14 Project 통합점
- `ios/Tuist/ProjectDescriptionHelpers/Constants.swift` — `SaunaModule` enum, `SaunaConstants` (bundle ID prefix `th1ngjin.Sauna`)
- `ios/Tuist/ProjectDescriptionHelpers/Project+Helpers.swift` — `Project.library` / `Project.feature` 헬퍼 (새 모듈 추가 시 사용)
- `ios/Projects/Domain/Project.swift` — 4-target TMA 패턴 레퍼런스 (Interface/Sources/Testing/Tests)
- `ios/Makefile` — 일상 명령 정본 (install/generate/build/test/lint)
- `.github/workflows/ios.yml` — CI Tuist 잡 정의
- `ios/fastlane/Fastfile` — TestFlight 업로드 (workspace 기반)

## Build Environment
```bash
# 첫 setup (다른 PC 에서 pull 직후)
brew install tuist                  # 또는 mise use -g tuist@4.43.2
cd ios && make install              # 외부 SPM (Sentry 등)
cd ios && make generate             # .xcworkspace + 14× .xcodeproj
cd ios && make triple-check         # build + test + lint
```

## Notes
- **Tuist 4.43.2** 고정 (`Tuist.swift` + Makefile + CI). Swift toolchain 6.0.
- `Sauna.xcworkspace`, `**/*.xcodeproj`, `**/Derived` 모두 gitignore — manifests(`Project.swift`/`Workspace.swift`/`Tuist.swift`) 만 commit.
- App 타겟 `Sauna` scheme 만 Xcode 에서 열면 됨. CLI 만 쓸거면 `make triple-check`.
- **의존성 규칙 (TMA 핵심)**: Feature 끼리 직접 import 금지. 다른 모듈은 `DomainInterface` 만 import. 구현부(`Domain`) 직접 import 는 컴포지션 루트(App, Data, FeatureRoom 같이 UseCase 가 필요한 곳)만 예외 허용.
- **Co-Authored-By 절대 금지** (CLAUDE.md 정책). push 도 명시 요청 시에만.
