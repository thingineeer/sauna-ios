# Sauna · iOS

> 원목 사우나 톤의 익명 실시간 채팅 앱

## 한 줄 소개

사우나실 안에서 익명으로 땀 흘리듯 말을 뱉는다.
이름은 매일 자정 새로 부여되고, 말은 증기처럼 올라오다 사라진다.

## 현재 단계

- [x] PM/디자인 설계 확정 (sauna-app.html)
- [ ] iOS 구현 (다른 환경에서 진행 예정)
- [ ] 백엔드 설계
- [ ] Android 대응 (후속)

이 레포는 **설계 문서 + 디자인 핸드오프 자료**를 담은 단계입니다. 실제 Xcode 프로젝트/코드는 아직 없습니다.

## 레포 구조

```
sauna-ios/
├── README.md                 # 이 문서
├── docs/                     # 제품/기술 설계 문서
│   ├── PRD.md               # 제품 요구사항
│   ├── architecture-ios.md  # iOS Clean Architecture + 모듈화
│   ├── design-system.md     # 컬러·타이포·아이콘 토큰
│   ├── tech-stack.md        # 스택 선정 근거
│   ├── roadmap.md           # 마일스톤
│   └── archive/             # 과거 방향성 자료 (에어팟 v0 등)
├── design-handoff/           # Claude Design 원본 핸드오프
│   ├── sauna-app.html       # 정본 플로우 (반드시 먼저 읽기)
│   ├── lib/                 # React 컴포넌트 소스
│   ├── scraps/              # 디자인 스냅샷
│   └── uploads/             # 업로드 자료
└── ios/                      # (WIP) Xcode 프로젝트
```

## 핵심 컨셉 (sauna-app.html 요약)

- 방 3개 고정: **일상 · 주식 · 취준** (+ 시즌 방은 개발자가 추가)
- 닉네임 매일 자정 새로
- 메시지는 증기처럼 올라오다 사라짐
- 세션 기록 없음 (메시지 히스토리 원천 부재)
- 전부 커스텀 SVG 아이콘, 이모지 없음
- 시간 제한 없음, 언제든지 나갈 수 있음

## 다음 할 일 (집 PC)

1. `docs/architecture-ios.md` 따라 Xcode 프로젝트 생성
2. Tuist 또는 SPM로 모듈 분리
3. DS(Design System) 모듈부터 구현 (sauna-ds.jsx 참조)
4. 화면 구현 순서: Splash → Onboarding → Home → Room

## 라이선스

Private / 개인 프로젝트
