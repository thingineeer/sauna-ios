---
name: worktree-branch-flow
description: Sauna 모노레포의 git worktree 분기-병합 워크플로우를 강제한다. 1.0.0 에서 worktree 를 cut 하고, atomic 커밋 N개를 쌓고, regular merge (squash 절대 금지) 로 1.0.0 에 합치고, 안정되면 dev → release 로 승급한다. push 는 명시적 요청 시에만. Co-Authored-By 절대 금지. 어떤 단위 작업이든 (feature/fix/refactor/docs/ci) 시작·종료 시 반드시 트리거. CLAUDE.md 의 "브랜치 / 머지 워크플로우" 의 실행 가이드.
---

# worktree-branch-flow

이 레포의 분기 정책은 CLAUDE.md "브랜치 / 머지 워크플로우" 가 정본. 이 스킬은 그 실행 절차.

## 계층

```
release          ← 출시본
  ▲
 dev             ← 통합 테스트 / TestFlight
  ▲
 1.0.0           ← 현재 버전 통합
  ▲ ▲ ▲
 feature/foo  feature/bar  ...   ← worktree 단위 브랜치
```

## 절대 지키는 규칙

1. **Squash merge 절대 금지.** `git merge --no-ff <branch>` 만.
2. **새 단위 작업 = 새 worktree + 새 브랜치.** 한 worktree 안에서 두 단위를 섞지 않는다.
3. **push 는 명시적 요청 시에만.** 임의로 origin 에 올리지 않는다.
4. **Co-Authored-By 절대 금지.** AI 문구도 금지. author 는 `thingineeer <dlaudwls1203@gmail.com>` 만.
5. **메시지는 한국어 또는 conventional commits**. `feat(scope):`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`, `ci:`, `test:` 사용.
6. **atomic 커밋**: 한 커밋 = 한 의도. 한 사이클은 보통 3-8개의 의미 있는 커밋이 된다.

## 시작 (worktree 생성)

```bash
# 1.0.0 에서 새 단위 작업 시작
git worktree add ../sauna-ios.feature-X -b feature/X 1.0.0

cd ../sauna-ios.feature-X
# 작업 → atomic 커밋 N 개
```

또는 Agent 도구로 자동:
```
Agent({
  isolation: "worktree",
  prompt: "...",
  ...
})
```
→ 에이전트가 `worktree-agent-<hash>` 브랜치를 받아 작업.

## 커밋 (한 사이클)

```bash
# 한 의도의 변경 staging
git add ios/SaunaPackage/Sources/Domain/UseCases/NewVerb.swift \
        ios/SaunaPackage/Tests/DomainTests/NewVerbTests.swift

# author 명시 (글로벌 config 건드리지 말 것)
git -c user.name="thingineeer" -c user.email="dlaudwls1203@gmail.com" \
    commit -m "feat(domain): NewVerb UseCase + 결정론 테스트 4건"
```

각 커밋은:
- 빌드 가능
- 테스트 통과
- 단일 의도

## 머지 (worktree → 1.0.0)

```bash
# main 작업 트리로 돌아옴
cd /Users/imyeongjin/Desktop/sauna-ios
git checkout 1.0.0

# worktree 의 브랜치를 머지 — squash 절대 금지
git -c user.name="thingineeer" -c user.email="dlaudwls1203@gmail.com" \
    merge --no-ff feature/X -m "merge: feature/X — <한 줄 설명>

<원래 atomic 커밋들 요약>"

# worktree 정리
git worktree remove ../sauna-ios.feature-X -f -f
git branch -d feature/X
```

`--no-ff` 가 핵심 — fast-forward 를 막아 머지 커밋이 항상 남는다. 히스토리에서 어떤 작업 단위였는지 보임.

## 안정화 → dev 머지

`1.0.0` 이 stable 하다고 판단되면 (전체 빌드/테스트 green, integration-qa P0/P1 발견 0):

```bash
git checkout dev
git merge --no-ff 1.0.0 -m "merge: 1.0.0 → dev — <안정점 설명>"
```

dev 에서 통합 테스트 + TestFlight (Phase 2+).

## 출시 → release 머지

App Store / TestFlight 통과 + 출시 결정 후:

```bash
git checkout release
git merge --no-ff dev -m "release: vN.N.N

<release notes>"
git tag vN.N.N
```

push 는 사용자가 명시적으로 요청할 때만.

## 충돌 처리

worktree 가 동시에 같은 파일을 수정해서 충돌 → 머지 시점에 알려진다.

```bash
git merge --no-ff feature/X
# CONFLICT 라인 표시
# → 수동 해결 → git add → git commit (no -m, default merge message OK)
```

해결 시: 양쪽 변경 의도를 *전부* 살린다. 한쪽 의도를 버려야 한다면 그 에이전트에게 SendMessage 로 합의 요청.

## 자주 보는 함정

- **`--squash` 실수**: 절대 사용 금지. `--no-ff` 만.
- **`git push --force` 욕구**: 거절. 히스토리 망가뜨림. 정 필요하면 사용자에게 확인.
- **글로벌 git config 변경**: 절대 금지. `-c user.name="..."` per-command 만.
- **embedded git submodule 경고**: `.claude/worktrees/agent-*` 가 `git add -A` 에 잡히면 mode 160000 으로 들어감 → `.gitignore` 가 `.claude/worktrees/` 를 막아야 함 (이미 적용됨).
- **agent 가 1.0.0 에 직접 commit**: worktree 가 lock 상태로 같은 git 디렉터리 공유 → 가끔 race 로 main 브랜치에 커밋이 뜬다. 발견 시 그대로 두되 merge commit 의 의미 부여 (파일은 이미 정상).

## 출력

작업 완료 시:
```
브랜치:   feature/X (또는 worktree-agent-<hash>)
worktree:  ../sauna-ios.feature-X
커밋:
  abc1234 feat(domain): NewVerb UseCase + 테스트
  def5678 feat(data):   NewVerbRepo + 테스트
  ...
머지 후 1.0.0:
  ghi9012 merge: feature/X — NewVerb 사이클
정리:    worktree removed, branch deleted
```
