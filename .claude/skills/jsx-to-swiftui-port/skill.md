---
name: jsx-to-swiftui-port
description: design-handoff/v3-jjimjilbang/lib/*.jsx 컴포넌트를 ios/SaunaPackage 의 SwiftUI 로 옮길 때 반드시 트리거된다. JJIM 토큰 매핑, ClayWall 레이아웃, PixelMascot 임베딩, Canvas 기반 Path 렌더링, MainActor isolation, 동등한 SwiftUI 모디파이어 선택 모두 다룬다. "Splash 옮겨줘", "Onboard1 SwiftUI 로", "JjimRoom 키보드 변형 추가", "디자인 정본의 X 화면 구현" 같은 요청 시 사용. 새 화면 / 새 위젯 / 새 컴포넌트가 디자인 정본에서 시작되면 반드시 이 스킬을 거친다.
---

# jsx-to-swiftui-port

JSX 디자인 핸드오프를 SwiftUI 로 옮긴다. 디자인 정본은 `design-handoff/v3-jjimjilbang/Jjimjilbang Flow.html` 와 그 `lib/` 디렉터리.

## 절대 지키는 규칙

1. **색·간격은 토큰만.** 매직 컬러 (`Color(red: ...)` 직접) 는 `JJIM` enum 에 없는 값일 때만 허용 — 그조차 코멘트로 출처 (jjim-tokens.jsx 의 어떤 키) 를 적는다.
2. **`background`-as-image 는 `Canvas` 또는 `LinearGradient/RadialGradient`** 로 바꾼다. JSX 의 `repeating-linear-gradient` 패턴은 `ClayBrickPattern` / `ClayFloorPattern` 처럼 Canvas Procedural 로 미리 빼둔다.
3. **`zIndex` 대신 `ZStack` 의 순서**. `position: absolute; top: …; left: …` 는 SwiftUI 의 `.frame` + `.padding` 또는 `.offset` 으로.
4. **`backdropFilter: blur(...)` → `.ultraThinMaterial`** 또는 `.background(.regularMaterial)`.
5. **Pixel sprite 그림** 은 `<div imageRendering: pixelated>` → `PixelMascotView(pose:tone:size:scale:)`.
6. **이모지 (`✱`, `↗`, `‹`) 는 그대로 Text 로 두지 말 것.** 디자인이 의도적으로 이모지처럼 보이는 ASCII 사용한 경우 (예: `↗` 전송 버튼) 는 SwiftUI Text 가능 — 단 한국어 화면용 textbox 안의 이모지는 거부.

## 매핑 표

| JSX 패턴 | SwiftUI 등가 |
|---|---|
| `display: flex; flexDirection: column` | `VStack` |
| `display: flex; flexDirection: row` | `HStack` |
| `gap: 14px` | `VStack(spacing: 14)` |
| `padding: 14px 16px` | `.padding(.horizontal, 16).padding(.vertical, 14)` |
| `borderRadius: 14` | `.clipShape(RoundedRectangle(cornerRadius: 14))` |
| `border: 1px solid X` | `.overlay(RoundedRectangle(cornerRadius: 14).stroke(X, lineWidth: 1))` |
| `boxShadow: 0 4px 14px rgba(...)` | `.shadow(color: ..., radius: 7, y: 4)` (블러는 절반 정도) |
| `backdropFilter: blur(8px)` | `.background(.ultraThinMaterial)` 또는 `Color.x.opacity(...)` |
| `opacity: 0.78` | `.opacity(0.78)` |
| `letterSpacing: -0.5` | `.kerning(-0.5)` |
| `lineHeight: 1.65` | `.lineSpacing(N)` (계산: `(line-height − 1) × fontSize`) |
| `<button onClick={…}>` | `Button(action: …) { … }.buttonStyle(.plain)` |
| `<svg viewBox="0 0 24 24">` | `Canvas { ctx, _ in … }` 안에 Path 또는 별도 Shape struct |
| `position: absolute` | ZStack + `.frame(maxWidth/Height: .infinity, alignment: …)` 또는 GeometryReader |
| `transform: translateX(-50%)` | 보통 ZStack center alignment 로 자연 해결 |
| `text-shadow` | `.shadow(color: …, radius: 1, y: 1)` |

## MainActor 주의

- View 를 반환하는 computed property 안에서 다른 View 의 `init` 을 호출하면 Swift 6 strict concurrency 가 발끈한다.
- 해결: 그 property 에 `@MainActor` 를 달거나, View 안에서 직접 인스턴스화한다.

## 절차 (체크리스트)

```
[ ] JSX 의 컴포넌트 이름 → 목표 Swift 파일명 (예: JjimOnboard1.swift)
[ ] 모듈 결정 — 기능 화면이면 Feature*, 재사용 위젯이면 SharedUI
[ ] 의존 import 정리 (Domain/DesignSystem/CustomIcons/PixelMascot/SharedUI)
[ ] 색·간격 → JJIM 토큰 매핑 (jjim-tokens.jsx 와 1:1 비교)
[ ] 레이아웃 골격 → ZStack/VStack/HStack 트리
[ ] SVG → Canvas Path 또는 Shape struct
[ ] 픽셀 스프라이트 → PixelMascotView
[ ] 인터랙션 (onClick / state) → ViewModel 또는 @State
[ ] #Preview 추가 (SaunaPhone 393×852 frame)
[ ] swift build → swift test → swiftlint --strict 트리플 체크
```

## 자주 보는 함정

- **JSX 의 `borderRadius: '50% 50% 18px 18px'`**: SwiftUI 는 `UnevenRoundedRectangle` 사용 — top corner 는 `topLeading/topTrailing`, bottom 은 named radius.
- **`textWrap: 'pretty'`** 는 SwiftUI 에 없음. 무시.
- **`React.useEffect` + `requestAnimationFrame`**: SwiftUI 는 `TimelineView(.animation)` 로 frame loop. `RisingPhysics` 처럼 시간 함수를 순수로 빼면 결정론 + 테스트 가능.
- **`String.padStart(4, '0')`** → `String(format: "%04X", n)`.
- **Korean text wrap (`wordBreak: 'keep-all'`)** → SwiftUI 는 자동으로 한국어 줄바꿈을 잘 처리. `.lineLimit` + `.minimumScaleFactor` 만 신경 쓰기.

## 모범 예시

`design-handoff/v3-jjimjilbang/lib/jjim-screens-entry.jsx` 의 `JjimOnboard1` →
`ios/SaunaPackage/Sources/FeatureOnboarding/JjimOnboard1.swift` 변환 결과를 참고. 같은 토큰, 같은 레이아웃, 같은 모션 의도, 다른 구현.

## 출력

작성한 파일 경로 + Preview 제대로 뜨는지 확인 + swift test 통과 확인.
