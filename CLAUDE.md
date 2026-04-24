# CLAUDE.md — Sauna iOS

> 이 파일은 Claude Code가 이 레포에서 작업을 이어갈 때 읽는 컨텍스트입니다.
> 글로벌 `~/.claude/CLAUDE.md` 규칙을 따르되, 이 레포만의 규칙은 여기 추가합니다.

## 프로젝트 한 줄

원목 사우나 톤의 익명 실시간 채팅 앱. 방 3개 고정(일상/주식/취준), 닉네임 매일 자정 새로, 메시지는 증기처럼 사라짐.

## 현재 단계

**설계 완료 · 구현 미착수.** Xcode 프로젝트/Swift 코드 아직 없음.

- 디자인 핸드오프 수령 완료 (`design-handoff/sauna-app.html` 정본)
- 설계 문서 작성 완료 (`docs/`)
- Git + private GitHub 레포(`thingineeer/sauna-ios`) 세팅 완료
- **다음 단계: 집 PC에서 Xcode 프로젝트 생성 + 모듈 뼈대 구축**

## 먼저 읽어야 할 파일 (순서 중요)

1. **`README.md`** — 레포 구조 개괄
2. **`design-handoff/sauna-app.html`** — 디자인 정본 (top to bottom으로 전부)
3. **`docs/PRD.md`** — 제품 요구사항 · 11개 화면 목록
4. **`docs/architecture-ios.md`** — Clean Architecture + SPM 모듈 구조
5. **`docs/design-system.md`** — 컬러/타이포/아이콘 24종 토큰
6. **`docs/tech-stack.md`** — Swift/Alamofire/Firebase 선정 근거
7. **`docs/roadmap.md`** — Phase 0→6 순서

이후 필요 시 `design-handoff/lib/*.jsx` (특히 `sauna-ds.jsx`, `sauna-screens.jsx`, `sauna-phone.jsx`, `concept-sauna-deep.jsx`) 참고.

## 바로 시작할 작업 (구현 Sprint 1)

`docs/roadmap.md` Phase 1 기준:

1. `ios/` 하위에 Xcode 16 프로젝트 생성 (앱 이름: `Sauna`, Bundle ID 결정 필요)
2. SPM Multi-target `Package.swift` 작성 — `docs/architecture-ios.md` §3 참조
3. `DesignSystem` 모듈: 색 토큰(`Color.saunaHeat500` 등) + 폰트 enum
4. `CustomIcons` 모듈: 24개 SVG → SwiftUI `Shape` 혹은 `Path`
5. `SharedUI` 모듈: `SaunaPhone`, `SteamBubble`, `RoomCard`
6. `Splash` + `Onboard 1/2/3` 화면 (정적, 데이터 X)

## 이 레포 규칙

### 디자인 정본
- **항상 `design-handoff/sauna-app.html`를 기준으로.** 충돌하는 문서가 있으면 이 파일이 이김.
- `docs/archive/`의 문서들(에어팟 v0 등)은 **참고만**. 현재 방향성과 다름.

### 이모지 금지
- 앱 UI에 이모지 절대 넣지 말 것. 전부 커스텀 SVG.
- 문서/커밋 메시지에는 OK.

### 톤
- 다크 모드 first (v1은 다크 only)
- 모션은 느긋하게 (증기처럼)
- 파스텔/뽀얀 톤/귀여운 일러스트 금지

### 아키텍처
- Clean Architecture: `App → Feature → Domain ← Data`
- Domain 레이어는 Foundation만 import. SwiftUI/Alamofire/Firebase 모름.
- 네트워크는 `NetworkClient` 프로토콜 뒤에 둠. Alamofire는 `Data` 구현부에서만 import.

### 비영속
- 메시지는 로컬에 저장하지 않음 (휘발성이 제품 본질).
- UserDefaults/SwiftData에는 닉네임/설정/차단목록만.

## 글로벌 규칙 (user `~/.claude/CLAUDE.md` 요약)

- Git author: `thingineeer <dlaudwls1203@gmail.com>`
- Co-Authored-By 절대 금지 (AI 문구 포함 X)
- 커밋 메시지: 한글 또는 conventional commits (feat:/fix:/chore:/refactor:)
- push는 명시적 요청 시에만
- 시키지 않은 작업 하지 말 것

## 결정 대기 / 오픈 이슈

- [ ] Bundle ID 확정 (예: `com.thingineeer.sauna` or `th1ngjin.Sauna`?)
- [ ] Firebase 프로젝트 생성 시점 (모듈 뼈대 만든 후 연결 권장)
- [ ] SPM only vs Tuist 병행 — 초기엔 SPM만
- [ ] Alamofire 확정 vs URLSession 전환 (`docs/tech-stack.md` §Alamofire vs URLSession 참조)
- [ ] 실시간 백엔드 Firebase RTDB 확정 vs Supabase

## 참고 명령어

```bash
# 레포 pull
cd ~/Desktop/side/sauna-ios
git pull

# 로컬 브라우저로 디자인 원본 열어보고 싶을 때
open design-handoff/sauna-app.html

# 다른 컨셉들도 구경
open design-handoff/pods-prototype.html
```

## 레포 구조

```
sauna-ios/
├── CLAUDE.md                 ← 이 파일
├── README.md                 ← 사용자용 소개
├── .gitignore
├── docs/                     ← 설계 문서 (필수)
│   ├── PRD.md
│   ├── architecture-ios.md
│   ├── design-system.md
│   ├── tech-stack.md
│   ├── roadmap.md
│   └── archive/              ← 이전 방향성 (참고만)
├── design-handoff/           ← Claude Design 원본 60파일
│   ├── sauna-app.html       ← 정본
│   ├── lib/                 ← 30개 React 레퍼런스
│   ├── scraps/
│   └── uploads/
└── ios/                      ← 집 PC에서 Xcode 프로젝트 생성할 자리
    └── .gitkeep
```
