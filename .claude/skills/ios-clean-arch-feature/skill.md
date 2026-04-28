---
name: ios-clean-arch-feature
description: Sauna iOS 에 새 Feature 모듈 또는 새 UseCase 를 Clean Architecture + TDD 로 추가할 때 반드시 트리거된다. Domain UseCase 시그니처 결정 → failing test → 최소 구현 → Repository 프로토콜 → Data 구현체 → ViewModel(@Observable @MainActor) → SwiftUI View → Composition Root 주입까지 한 사이클을 안내한다. "새 기능 추가", "UseCase 만들어줘", "ViewModel 짜줘", "Feature 모듈 추가", "X 화면 wireup" 같은 요청 시 사용. Phase 2 wireup (Stub → 실제 구현 교체) 도 이 스킬 범위.
---

# ios-clean-arch-feature

`ios/SaunaPackage/` 의 Clean Architecture 한 사이클을 처음부터 끝까지 짜는 스킬.

## 의존 방향

```
SaunaApp           ← Composition Root (모든 모듈 import 가능)
   ↓
Feature*           ← 화면 + ViewModel
   ↓
Domain ← Data
DomainInterfaces  ← 양쪽이 의존하는 프로토콜
NetworkCore
```

`Feature` 가 다른 `Feature` 를 import 하면 즉시 거부. 공유 컴포넌트는 `SharedUI` 로.

## 한 사이클 (체크리스트)

새 UseCase + 화면을 만든다고 가정.

```
[1] DOMAIN — 시그니처 결정
    Sources/Domain/UseCases/<Verb>UseCase.swift
    ─ public protocol VerbUseCase: Sendable {
        func callAsFunction(...) async throws -> Result
      }
    ─ public struct DefaultVerbUseCase<R: ...Delegating>: VerbUseCase {
        let repo: R
        let clock: ClockProviding
        ...
      }

[2] DOMAIN — Repository 프로토콜 (필요 시)
    Sources/DomainInterfaces/<Noun>Repository.swift
    ─ public protocol NounRepository: Sendable { ... }

[3] TEST — failing test (Red)
    Tests/DomainTests/<Verb>UseCaseTests.swift
    ─ import @testable Domain
    ─ Spy/Stub repo + FixedClock + StubRandomGenerator 로 결정론
    ─ XCTAssert 로 기대 동작 명시

[4] DOMAIN — 최소 구현 (Green)
    XCTAssert 통과 + 다른 테스트 깨지 않게

[5] REFACTOR — Domain 코드 정리 + 주석은 WHY 만

[6] DATA — 실제 Repository 구현
    Sources/Data/<Noun>RemoteRepository.swift
    ─ URL + WebSocket / Keychain / SwiftData 사용
    ─ DTO 는 private struct, mapping 은 toDomain() 으로 한 곳에서

[7] DATA TEST — URL session mock or in-memory store
    Tests/DataTests/<Noun>RemoteRepositoryTests.swift

[8] VIEW MODEL
    Sources/Feature*/<Screen>ViewModel.swift
    ─ @Observable @MainActor public final class
    ─ UseCase 들을 init 에서 주입받음
    ─ tick / sendInput / onAppear / onDisappear 같은 명령형 인터페이스

[9] VIEW MODEL TEST
    Tests/Feature*Tests/<Screen>ViewModelTests.swift
    ─ FixedClock + Stub random + Spy UseCase
    ─ @MainActor 테스트 클래스

[10] SWIFTUI VIEW
    Sources/Feature*/<Screen>.swift
    ─ jsx-to-swiftui-port 스킬 적용
    ─ #Preview 다양한 상태 (lonely/medium/packed 식)

[11] COMPOSITION ROOT 갱신
    Sources/SaunaApp/AppContainer.swift
    ─ live() 가 새 UseCase 를 어떻게 만드는지
    ─ mock() 도 Stub 으로 동시 갱신

[12] ROUTING (필요 시)
    Sources/SaunaApp/RootView.swift
    ─ phase / activeTab / fullScreenCover 등에 추가

[13] BUILD + TEST + LINT 트리플 체크
    swift build --package-path ios/SaunaPackage
    swift test  --package-path ios/SaunaPackage
    swiftlint lint --strict --config .swiftlint.yml ios/SaunaPackage/Sources

[14] ATOMIC 커밋
    한 사이클을 의미 단위 N 커밋으로:
    · feat(domain): <Verb>UseCase + 테스트
    · feat(data):   <Noun>RemoteRepository + 테스트
    · feat(<feature>): <Screen>ViewModel + View
    · feat(app):    AppContainer 주입 + RootView 라우팅
```

## 결정론 패턴

```swift
// Production
let useCase = DefaultSendMessageUseCase(
    repo: liveRepo,
    clock: SystemClock(),
    limiter: SlidingWindowRateLimiter()
)

// Test
let useCase = DefaultSendMessageUseCase(
    repo: SpyRepo(),
    clock: FixedClock(.distantPast),
    limiter: StubLimiter(retryAfter: nil)
)
```

## 흔한 함정

- **`AsyncStream` 필요한 곳에서 protocol 만 선언하고 구현 까먹음**: `repo.observeMessages(...)` 가 stream 을 finish 안 하면 ViewModel 의 task 가 누수. `continuation.onTermination` 와 `Task` cancel 짝 맞추기.
- **@MainActor 누락**: ViewModel 은 항상 @MainActor. UI binding 시 발끈 방지.
- **`@Sendable` 누락한 closure**: `Authenticator.register(displayName:)` 같은 async 콜백이 escape 하면 closure 에 `@Sendable` 어노테이션 필수.
- **DTO leak**: Data 의 private struct 가 Domain 으로 새지 않게. 항상 `toDomain()` 으로 매핑.
- **Stub 이 Domain entity 만들 때 force unwrap**: 테스트 안에서는 OK, 단 `swiftlint:disable:next force_unwrapping` 한 줄 + 사유.

## 출력

각 사이클 완료 후 보고 형식:
- 추가된 파일 경로
- 테스트 수 (sub-step 단위)
- 누적 swift test 합계
- swiftlint 결과
- 커밋 SHA 들 + 그래프
