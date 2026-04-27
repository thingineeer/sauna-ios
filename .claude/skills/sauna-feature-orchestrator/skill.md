---
name: sauna-feature-orchestrator
description: Sauna 의 새 기능 추가, 화면 추가, server endpoint 추가, Phase 2 wireup (Stub→실구현 교체) 작업의 최상위 오케스트레이터. iOS / Vapor / 통합 검증을 한 사이클로 돌린다. "X 기능 추가해줘", "이 화면 만들어줘", "API endpoint Y 만들고 iOS 도 연결해줘", "Passkey 진짜 붙여줘", "TestFlight 준비" 같은 요청 시 반드시 트리거. ios-feature-developer + vapor-server-developer + integration-qa 에이전트 팀을 구성해 자체 조율시킨다.
---

# sauna-feature-orchestrator

이 레포의 새 기능 추가 사이클을 한 번에 돈다.

## 실행 모드

**에이전트 팀 (TeamCreate).** 3명 팀:
- `ios-feature-developer` (iOS 사이드)
- `vapor-server-developer` (서버 사이드)
- `integration-qa` (경계 검증)

팀원들이 SendMessage 로 자체 조율 + TaskCreate/Update 로 작업 추적 + 파일은 worktree 안의 `_workspace/` 또는 직접 모듈에 작성.

## 의사결정 트리

요청을 분류:

```
사용자 요청
   │
   ├─ iOS 단독 (서버 contract 변경 0)?
   │      └→ ios-feature-developer 한 명 + integration-qa 사후 1회
   │
   ├─ Vapor 단독 (iOS contract 변경 0)?
   │      └→ vapor-server-developer 한 명 + integration-qa 사후 1회
   │
   └─ 양쪽 다 변경 (대부분의 신규 기능)?
          └→ 3명 팀 + 파이프라인:
               1. DTO shape 합의 (양쪽 ⇄ 메시지)
               2. server 라우트 + 테스트 (vapor-server-developer)
               3. iOS Domain UseCase + Repository + ViewModel + View (ios-feature-developer)
                  ↑ 2 와 3 은 합의된 DTO 가 있으면 병렬 가능
               4. integration-qa: byte-level contract 검증
               5. 양쪽 모두 1.0.0 으로 머지 (worktree-branch-flow)
```

## Phase 별 절차

### Phase 1 — 분석

1. 요청을 읽고 무엇이 필요한지 정리:
   - 새 화면? 어느 모듈?
   - 새 endpoint? path / method / DTO?
   - 새 영속? Keychain / Postgres / 메모리?
   - 새 의존성? 어느 모듈에 추가?
2. 영향 범위 (모듈 경계) 명시.
3. CLAUDE.md "절대 피할 것" / "비영속" 정책에 위반 없는지 확인. 있으면 즉시 거부.

### Phase 2 — 팀 구성 + 작업 분배

`TaskCreate` 로 의존 그래프 명시:

```
T1: DTO 합의 (양쪽 동시 SendMessage)
    blocks: T2, T3
T2: vapor 라우트 추가
    blockedBy: T1
T3: iOS Domain UseCase + Repo + ViewModel + View
    blockedBy: T1
T4: integration-qa 검증
    blockedBy: T2, T3
T5: 머지 (양쪽 worktree → 1.0.0)
    blockedBy: T4
```

`TeamCreate` 로 3명 팀 띄우고 각자 owner 할당.

### Phase 3 — 모니터링

각 에이전트의 task 상태 변화를 본다. blocking 발생 시 SendMessage 로 unblock 시도.

각 commit 직후 `integration-qa` 가 incremental 검증.

### Phase 4 — 합의 안 됨 / 충돌

- DTO 시그니처 충돌: 오케스트레이터가 중재 — 한쪽 의도 우선이 맞는지 사용자에게 컨펌.
- Test 실패: 에이전트가 1회 자체 수정. 재실패 시 사용자.
- worktree 충돌: 머지 시점에 수동 해결.

### Phase 5 — 머지 + 정리

`worktree-branch-flow` 스킬 따라 양쪽 worktree → 1.0.0 머지. 모두 끝나면:

```bash
swift test --package-path ios/SaunaPackage  # 65 → N+M
swift test --package-path server            # 10 → N+M
swiftlint --strict --config .swiftlint.yml ios/SaunaPackage/Sources server/Sources  # 0 violations
```

전부 green 이어야 끝.

## 데이터 전달 프로토콜

| 무엇 | 어떻게 |
|---|---|
| DTO Codable shape | SendMessage 로 양쪽 텍스트 명세 + 양쪽 코드에 동시 작성 |
| 작업 상태 | TaskCreate / TaskUpdate (blocks/blockedBy 명시) |
| 발견 / 충돌 | SendMessage (오케스트레이터에게 cc) |
| 산출물 | 직접 모듈 파일 (worktree 안) — 따로 `_workspace/` 안 씀, 파일이 곧 산출물 |

## 에러 핸들링

- **에이전트 1회 재시도** 후 재실패 시: 해당 에이전트 결과 없이 진행하지 말 것 — 사용자에게 에스컬레이션.
- **integration-qa 가 P0 발견**: 머지 차단. 발견 위치의 에이전트가 수정 후 재검증.
- **integration-qa 가 P1 발견**: 머지는 진행, 별도 task 로 follow-up 등록.
- **양쪽 동시 수정 충돌**: 양쪽 에이전트 SendMessage 로 합의 시도, 안 되면 사용자.

## 테스트 시나리오

### 정상 흐름: "방 차단 기능 추가"

1. 분석: iOS Settings 에 "차단 목록" 화면 + Vapor `/auth/block` endpoint + Keychain/Postgres 저장.
2. 팀 구성: 3명.
3. T1 DTO 합의: `BlockEntry { userId: String, blockedAt: Date }`.
4. T2 vapor: `POST /auth/block`, `DELETE /auth/block/:id`, `GET /auth/blocks`.
5. T3 iOS: `BlockUseCase`, `BlockRepository` (Keychain), `BlockListView`, Settings 에 추가.
6. T4 integration-qa: path/method/DTO/auth header 비교 → 모두 일치.
7. T5 머지: 양쪽 worktree → 1.0.0 (`merge --no-ff`).
8. 검증: build/test/lint 트리플 green.

### 에러 흐름: integration-qa 가 P0 발견

1. T2 finished: server 가 `POST /auth/blocks` (복수형) 로 등록.
2. T3 finished: iOS 가 `POST /auth/block` (단수) 로 호출.
3. T4 검증 → P0: path 불일치.
4. 오케스트레이터가 SendMessage 로 양쪽 알림 + 컨센서스 제안 (단수형 권장).
5. vapor-server-developer 가 path 수정 + 재테스트 + 재커밋.
6. T4 재검증 → green.
7. T5 머지.

## 산출물 체크리스트

- [ ] 양쪽 worktree 가 1.0.0 으로 `--no-ff` 머지됨 (squash 아님)
- [ ] swift test ios/server 둘 다 green
- [ ] swiftlint --strict 0 violations
- [ ] integration-qa P0/P1 0건
- [ ] 새 기능이 CLAUDE.md "비영속" / "이모지 금지" 정책 위반 없음
- [ ] worktree 디렉터리 모두 정리됨 (`git worktree list` 가 main 만)
