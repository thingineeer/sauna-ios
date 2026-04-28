---
name: swiftlint-strict-pass
description: Sauna 의 SwiftLint --strict 가 막혔을 때 트리거된다. 이 레포에서 이미 발견·해결된 lint 패턴 (vertical_parameter_alignment, force_unwrapping, identifier_name 1-letter, file_length, cyclomatic_complexity, orphaned_doc_comment, function_parameter_count, blanket_disable_command 등) 을 어떻게 통과시킬지 안내한다. "lint 통과 안 돼", "swiftlint 실패", "strict 모드 막힘", "force unwrap 경고" 같은 요청 시 사용. CI 가 macos-14 에서 swiftlint --strict 로 돌리므로 0 violations 는 필수.
---

# swiftlint-strict-pass

이 레포의 `.swiftlint.yml` 은 Canvas + SwiftUI 가 많은 코드베이스에 맞춰 튜닝됨. 룰을 더 풀기 전에 **로컬 fix** 를 먼저 본다.

## 우선 순위

```
1. 자동 수정 시도          swiftlint --fix
2. 코드 패턴 변경          (이 문서의 매핑표)
3. 한 줄 disable 주석     // swiftlint:disable:next <rule>
   + 사유 주석 (위 줄)
4. .swiftlint.yml 룰 수정 (식별자 추가, 파라미터 수 등 — 사용자 컨펌 필요)
```

## 자주 부딪히는 룰 → 해결

### `force_unwrapping`
```swift
// ❌
let url = URL(string: "https://sauna.app/about")!

// ✅ 사유 + 한 줄 disable
// "https://sauna.app/about" 는 컴파일 타임 상수 — URL.init 실패는 프로그래머 에러.
// swiftlint:disable:next force_unwrapping
let url = URL(string: "https://sauna.app/about")!
```

### `cyclomatic_complexity` (32 way switch 같은 lookup table)
```swift
// 한 함수만 면제
public static func color(for ch: Character) -> Color? {  // swiftlint:disable:this cyclomatic_complexity
    switch ch {
    case ".": return nil
    case "k": return ...
    ...
    }
}
```
`disable:this` (현 라인) / `disable:next` (다음 라인) / `disable:previous` (이전 라인) 셋 다 OK. 무경계 `disable` (`blanket_disable_command`) 은 거부됨.

### `vertical_parameter_alignment_on_call`
이미 disabled — Canvas 그리기 호출이 너무 많다.

### `identifier_name` — 1 letter (`x`, `y`, `r`, ...)
`.swiftlint.yml` 의 `excluded` 에 이미 `a~z` 추가됨. 더 추가 필요시 `excluded` 에 cap-letter 도 (`"P"`, `"Q"`, `"T"`).

### `file_length` (Icons.swift 691줄)
800/1500 으로 이미 완화. 더 가야 한다면 모듈 분리 검토 (`Icons-Brand.swift`, `Icons-Rooms.swift`, …).

### `function_body_length` / `type_body_length`
80/200 으로 완화. SwiftUI View body 가 길어지는 건 자연. 굳이 잘게 쪼개 줄이지 말 것.

### `orphaned_doc_comment`
`///` 와 declaration 사이에 `//` (non-doc) 주석이 끼면 발생. 해결: doc 코멘트와 선언을 인접하게.

```swift
// ❌
public enum X {
    /// 이 함수는 ...
    /// ...
    // swiftlint:disable:next cyclomatic_complexity   ← 이 라인이 doc 흐름 끊음
    public func foo() { ... }
}

// ✅
public enum X {
    /// 이 함수는 ...
    /// ...
    public func foo() { ... }  // swiftlint:disable:this cyclomatic_complexity
}
```

### `function_parameter_count` (Vapor WS 핸들러 6개)
`.swiftlint.yml` 의 `function_parameter_count: warning: 7, error: 10` 으로 이미 완화.

### `redundant_optional_initialization` (옵셔널 `T? = nil`)
DTO 가독성을 위해 disabled.

### `comma`, `colon` (정렬 패턴)
토큰 표 정렬을 위해 disabled.

### `blanket_disable_command`
`// swiftlint:disable rule` (범위 표시 없음) 사용 시 발생. 항상 `disable:next` / `disable:this` / `disable:previous` 로.

### Auto-fix 가능한 룰

```bash
swiftlint --fix ios/SaunaPackage/Sources
```

수정 후 반드시 `swift build` 와 `swift test` 재실행 — auto-fix 가 가끔 잘못된 패턴 (예: `count > 0` 을 collection 이 아닌 Int 에 `!isEmpty` 적용) 을 만든다.

## 검증

```bash
swiftlint lint --strict --config .swiftlint.yml ios/SaunaPackage/Sources server/Sources
# Done linting! Found 0 violations, 0 serious in N files.
```

CI 가 동일 명령을 macos-14 + brew swiftlint 로 돌린다.

## 룰 변경이 정말 필요할 때

`.swiftlint.yml` 수정은 코드 패턴이 정말로 자주 부딪히는 경우만. 단발성 violation 은 disable 주석으로.

수정 시 사용자에게 "이 룰을 풀자고 제안" + 영향 범위 (몇 파일, 어떤 패턴) 보여주고 컨펌 받기.

## 출력

```
이전: N violations
적용: <패턴1> 자동 수정 (M 곳), <패턴2> disable 주석 (K 곳)
이후: 0 violations  ✅
빌드: ✅
테스트: ✅ N건 pass
```
