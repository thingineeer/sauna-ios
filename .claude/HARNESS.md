# Sauna · Agent Harness

> 이 레포 전용 에이전트 팀 + 스킬 설계. `/harness` 스킬로 생성됨.
> 작성: 2026-04-28

## 무엇을 위한 하네스인가

이 레포는 **iOS Phase 1 완료 + Phase 2 wireup 준비**가 끝난 상태. 앞으로 자주 발생할 작업:

1. 새 기능 / 화면 추가 (디자인 정본 → SwiftUI + Domain UseCase + 서버 endpoint)
2. Stub → 실구현 교체 (RemoteRoomRepository 진짜 wire up, Passkey 진짜 연결 등)
3. 버그 픽스 + 회귀 테스트
4. 인프라 / CI 변경

이 사이클을 매번 처음부터 짜지 않게, 에이전트 + 스킬을 미리 정의해 둠.

## 실행 모드

**에이전트 팀 (TeamCreate).** 2개 이상이 협업할 때 기본. SendMessage 로 자체 조율.

| 작업 규모 | 팀원 |
|---|---|
| 단순 (단일 모듈, 단일 endpoint) | 1명 + integration-qa 사후 1회 |
| 신규 기능 (iOS + 서버 + DTO 합의) | 3명 (ios + vapor + qa) 풀팀 |

## 에이전트 (3)

| 이름 | 역할 |
|---|---|
| `ios-feature-developer` | iOS Clean Arch + TDD + JJIM 디자인 시스템 |
| `vapor-server-developer` | Vapor 라우트 / WS / Redis Pub/Sub / Passkey |
| `integration-qa` | iOS↔Vapor contract byte-level 검증 |

전부 `model: opus`, `subagent_type: general-purpose`.

## 스킬 (5 + 1 오케스트레이터)

| 이름 | 언제 트리거 |
|---|---|
| `jsx-to-swiftui-port` | 디자인 핸드오프 JSX → SwiftUI 옮길 때 |
| `ios-clean-arch-feature` | 새 UseCase / Feature 모듈 / Phase 2 wireup |
| `vapor-controller-add` | 서버 라우트 / WS 핸들러 / 미들웨어 추가 |
| `worktree-branch-flow` | 어떤 단위 작업이든 시작·종료 |
| `swiftlint-strict-pass` | lint 가 막혔을 때 |
| `sauna-feature-orchestrator` | 위 모든 것의 상위 — "X 기능 추가" 같은 통합 작업 |

## 사용법

### 패턴 1 — 사용자가 통합 작업을 요청

> "차단 기능 추가해줘"

→ 메인 세션이 `sauna-feature-orchestrator` 트리거 → 3명 팀 구성 → 각자 자기 스킬로 작업 → integration-qa 가 incremental 검증 → 양쪽 worktree 머지.

### 패턴 2 — 단일 작업

> "Splash 화면의 콩이 위치만 살짝 옮겨줘"

→ 메인 세션이 `jsx-to-swiftui-port` + `worktree-branch-flow` 만 사용 → ios-feature-developer 1명 spawn → 작업 후 머지.

### 패턴 3 — 디버깅 / lint 정리

> "lint 안 통과돼"

→ 메인 세션이 `swiftlint-strict-pass` 만 사용. 에이전트 spawn 없이 본인이 처리.

## 데이터 전달 규약

| 무엇 | 어디에 |
|---|---|
| 작업 의존 그래프 | `TaskCreate` (blocks/blockedBy) |
| 실시간 합의 (DTO shape, 충돌) | `SendMessage` |
| 산출물 코드 | 각 worktree 의 모듈 파일 직접 작성 |
| 검증 보고서 | integration-qa 가 SendMessage 로 발신자에게 |

## 검증된 패턴

- **Phase 1 구현 시 사용된 워크플로우** 가 이 하네스의 검증 데이터:
  - 5개 worktree (CI/CD, 인프라, 서버) + 메인 1.0.0
  - 3개 atomic 커밋 ~ 8개 atomic 커밋 / worktree
  - regular merge (`--no-ff`) 로 모두 1.0.0 에 합쳤고 squash 0건
  - swift test 75건 / lint 0 violations / 162 files

## 다음 세션을 위한 진입점

새 세션에서 사용자가 작업 요청하면:

1. 요청 분류 → 1명 / 3명 / 본인 처리?
2. 1명 또는 3명이면 `Agent({ subagent_type: "general-purpose", isolation: "worktree", ... })` 으로 spawn
3. 본인 처리면 직접 스킬 따라 진행
4. 어떤 경우든 `worktree-branch-flow` + atomic 커밋 + `--no-ff` 머지

이 룰만 지키면 이 레포의 작업 품질이 일정해진다.
