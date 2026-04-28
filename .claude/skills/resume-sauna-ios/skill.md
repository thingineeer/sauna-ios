---
name: resume-sauna-ios
description: Resume Sauna iOS session — auto-pulls, reads save point, prints briefing.
disable-model-invocation: true
---

# Resume — Sauna iOS

## 1. Sync with remote
Run `git fetch`. If the local branch is behind, run `git pull`.
If diverged, warn the user — do NOT force pull.

## 2. Project rules
@CLAUDE.md

## 3. Work state
@docs/checkpoints/SESSION-STATE.md

## 4. Git status
Run `git status` and `git branch`, then show recent commits using the larger of:
- All commits from today: `git log --oneline --since="midnight"`
- Last 10 commits: `git log --oneline -10`

Use whichever returns more results.

## 5. Key files
Read all files listed in the "Key Files" section of `SESSION-STATE.md`.

## 6. Build environment
Verify build/test commands work (no need to actually run heavy builds; just confirm Tuist is installed):
```bash
which tuist && tuist version
ls ios/Sauna.xcworkspace 2>/dev/null && echo "workspace exists" || echo "run: cd ios && make install && make generate"
```

## 7. Briefing
Print:

---
**Project**: Sauna iOS (황토방 톤 익명 실시간 채팅 — iOS 17+)
**Branch**: {branch}
**Done**: {completed items from SESSION-STATE.md}
**Current**: {in-progress work}
**Next**: {immediate next task — likely "1.0.0 → dev 머지" 또는 외부 시크릿 작업}
---

Ask: "Ready to continue?"
