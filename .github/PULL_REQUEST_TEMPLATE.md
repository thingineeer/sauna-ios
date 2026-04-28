<!--
  PR 제목은 Conventional Commits 또는 한글 prefix 를 따른다.
  예: feat(server): WebSocket presence 하트비트
       기능(ios/room): 키보드 회피
  [WIP] 표시가 있는 PR 은 자동으로 차단된다.
-->

## 무엇을 / 왜

<!-- 1~3줄. "무엇을 바꿨는지" + "왜 필요한지". 디자인/요구사항 링크가 있으면 첨부. -->

-

## 어떻게 (요약)

<!-- 변경 포인트, 추가/삭제된 모듈, 의존성 변화 등. -->

-

## 테스트 결과

<!-- 어떤 테스트를 돌렸고 무엇이 통과했는지. 새 UseCase 면 failing → passing 흐름 명시. -->

- [ ] `swift test --package-path ios/SaunaPackage` 통과
- [ ] (서버 변경 시) `cd server && swift test` 통과
- [ ] SwiftLint strict 통과
- [ ] 신규/변경된 화면이 있다면 스냅샷/시각 회귀 확인

## 체크리스트

- [ ] 디자인 정본 (`design-handoff/v3-jjimjilbang/Jjimjilbang Flow.html`) 과 충돌 없음
- [ ] TDD: 새 UseCase 는 failing test 부터 시작했는가
- [ ] 비영속 정책 위반 없음 (메시지를 UserDefaults / SwiftData / 서버 DB / 로그 어디에도 저장하지 않음)
- [ ] 새 외부 의존성을 추가했다면 `Data` / `NetworkCore` / `WebViewBridge` 안에서만 import 했는가
- [ ] 이모지를 앱 UI 에 넣지 않았는가 (커스텀 SVG / SwiftUI Path 사용)
- [ ] 모듈 의존성 방향 위반 없음 (`App → Feature → Domain ← Data`)

## 참고 / 링크

<!-- 관련 이슈, 디자인 노드, 슬랙 스레드 등. -->

-
