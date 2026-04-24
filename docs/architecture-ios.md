# Sauna iOS · Clean Architecture + 모듈화

> Source of truth: sauna-app.html + tech-stack.md
> 작성일: 2026-04-24

## 1. 원칙

1. **Clean Architecture** — 의존성 방향은 바깥 → 안으로만.
   `App → Feature → Domain ← Data`
2. **SOLID** — 특히 DIP (Domain은 Data를 모름, Protocol로만).
3. **Modular** — 기능별 SPM 모듈. 빌드 시간 단축 + 경계 명확.
4. **Testable** — Domain 레이어는 UIKit/SwiftUI/Alamofire 의존 0.

## 2. 레이어 구조

```
┌───────────────────────────────────────────────────────────┐
│  App (iOS target: SaunaApp.swift · Composition Root)      │
└───────────────────────────────────────────────────────────┘
              │
              ▼
┌───────────────────────────────────────────────────────────┐
│  Features (SwiftUI Views · ViewModels · Coordinators)     │
│  ├─ FeatureOnboarding                                     │
│  ├─ FeatureHome                                           │
│  ├─ FeatureRoom   ← 핵심                                  │
│  └─ FeatureMe                                             │
└───────────────────────────────────────────────────────────┘
              │ depends on
              ▼
┌───────────────────────────────────────────────────────────┐
│  Domain (순수 Swift · UseCases · Entities · Protocols)     │
│  ├─ SendMessageUseCase                                    │
│  ├─ ObserveRoomMessagesUseCase                            │
│  ├─ AssignDailyNicknameUseCase                            │
│  └─ entities: Message, Room, Nickname, User               │
└───────────────────────────────────────────────────────────┘
              ▲ implements                    ▲
              │                               │
┌─────────────┴───────────┐    ┌──────────────┴────────────┐
│  Data (Repositories 구현) │    │  Shared (DS · Utilities) │
│  ├─ RemoteDataSource      │    │  ├─ DesignSystem         │
│  │   (Firebase RTDB)      │    │  ├─ CustomIcons (SVG)    │
│  ├─ LocalDataSource       │    │  ├─ Haptics              │
│  │   (SwiftData/UserDef)  │    │  └─ Logger               │
│  └─ NetworkClient         │    └──────────────────────────┘
│     (Alamofire)           │
└───────────────────────────┘
```

## 3. SPM 모듈 구성 (1차 안)

```
SaunaPackage/
├── Package.swift
└── Sources/
    ├── SaunaApp/                # Composition Root, DI
    ├── Domain/                  # 순수 Swift
    ├── DomainInterfaces/        # Repository 프로토콜 (Domain에서 분리 가능)
    ├── Data/                    # Repo 구현, Firebase mapping
    ├── NetworkCore/             # Alamofire wrapper (NetworkClient)
    ├── DesignSystem/            # 색/폰트/Spacing 토큰
    ├── CustomIcons/             # SVG 아이콘 컴포넌트 (SwiftUI Shape)
    ├── SharedUI/                # 공통 Button, Card, SteamBubble 등
    ├── FeatureOnboarding/       # Splash + Onboard 1/2/3
    ├── FeatureHome/             # 방 카드 리스트 + Enter
    ├── FeatureRoom/             # 방 내부 · 증기 말풍선 · 키보드
    └── FeatureMe/               # 프로필 · 설정 · 알림
```

Tuist를 쓸 수도 있으나 초기엔 SPM만으로 충분. 앱 타겟(xcodeproj)이 SaunaPackage 전체를 의존.

## 4. 의존성 방향 규칙

| 모듈 | Import 허용 |
|---|---|
| Domain | (Foundation만) |
| DomainInterfaces | Domain |
| Data | Domain, DomainInterfaces, NetworkCore, Firebase |
| NetworkCore | Alamofire, Foundation |
| DesignSystem | SwiftUI |
| CustomIcons | SwiftUI, DesignSystem |
| SharedUI | SwiftUI, DesignSystem, CustomIcons |
| Feature* | Domain, DomainInterfaces, SharedUI, DesignSystem, CustomIcons |
| SaunaApp | 전부 (Composition Root) |

## 5. 주요 도메인 타입

```swift
// Domain/Entities/Room.swift
public struct Room: Equatable, Identifiable {
    public enum Kind: String, CaseIterable { case daily, stock, job }
    public let id: Kind
    public let name: String
    public let occupancy: Int
    public let crowd: Crowd
}

public enum Crowd: String { case lonely, medium, packed }

// Domain/Entities/Message.swift
public struct Message: Equatable, Identifiable {
    public let id: UUID
    public let roomId: Room.Kind
    public let nickname: String
    public let text: String
    public let createdAt: Date
}

// Domain/Entities/Nickname.swift
public struct Nickname: Equatable {
    public let value: String   // "퇴근하고싶은판다#1203"
    public let issuedAt: Date  // 자정 배정
}
```

## 6. 핵심 UseCase 예시

```swift
// DomainInterfaces/RoomRepository.swift
public protocol RoomRepository {
    func observeMessages(for room: Room.Kind) -> AsyncStream<[Message]>
    func send(_ text: String, to room: Room.Kind) async throws
    func occupancy(of room: Room.Kind) async throws -> Int
}

// Domain/UseCases/ObserveRoomMessagesUseCase.swift
public struct ObserveRoomMessagesUseCase {
    let repo: RoomRepository
    public func callAsFunction(_ room: Room.Kind) -> AsyncStream<[Message]> {
        repo.observeMessages(for: room)
    }
}
```

## 7. NetworkClient 추상화

```swift
// NetworkCore/NetworkClient.swift
public protocol NetworkClient {
    func request<T: Decodable>(_ endpoint: Endpoint) async throws -> T
}

// Data/AlamofireNetworkClient.swift  (구현부에서만 Alamofire import)
import Alamofire
public final class AlamofireNetworkClient: NetworkClient { ... }
```

→ 추후 URLSession 기반으로 교체 시 Data 레이어만 건드리면 됨.

## 8. 실시간 구독 (Firebase RTDB)

```swift
// Data/FirebaseRoomRepository.swift
public final class FirebaseRoomRepository: RoomRepository {
    public func observeMessages(for room: Room.Kind) -> AsyncStream<[Message]> {
        AsyncStream { continuation in
            let ref = Database.database().reference()
                .child("rooms").child(room.rawValue).child("messages")
            let handle = ref.queryLimited(toLast: 50).observe(.value) { snap in
                let msgs = Self.decode(snap)
                continuation.yield(msgs)
            }
            continuation.onTermination = { _ in ref.removeObserver(withHandle: handle) }
        }
    }
}
```

## 9. ViewModel 패턴 (Observable)

```swift
@Observable
public final class RoomViewModel {
    public private(set) var messages: [Message] = []
    private let observe: ObserveRoomMessagesUseCase
    private var task: Task<Void, Never>?

    public init(observe: ObserveRoomMessagesUseCase) { self.observe = observe }

    public func onAppear(room: Room.Kind) {
        task = Task { for await batch in observe(room) { messages = batch } }
    }
    public func onDisappear() { task?.cancel() }
}
```

## 10. 테스트 전략

| 레이어 | 테스트 도구 | 커버리지 목표 |
|---|---|---|
| Domain | XCTest (pure) | 90%+ |
| Data | XCTest + URLProtocol mock | 70% |
| Feature | ViewInspector | 주요 flow만 |
| UI 스냅샷 | v2+ 도입 | — |

## 11. DI / Composition Root

`SaunaApp` 타겟의 `App` 진입점에서 전부 조립:

```swift
@main struct SaunaApp: App {
    let container = AppContainer.live()  // 실제 Firebase
    var body: some Scene { WindowGroup { RootView().environment(container) } }
}
```

테스트 시 `AppContainer.mock()` 으로 교체.

## 12. 네이밍 컨벤션

- UseCase: `동사UseCase` (e.g., `SendMessageUseCase`)
- ViewModel: `화면명ViewModel`
- View: `화면명View` / `섹션명Section`
- SwiftUI Modifier: 동사 prefix (`saunaCardStyle()`)

## 13. 오픈 이슈

- [ ] 모듈 경계 재검토 (Feature 간 공유 상태 있을 때)
- [ ] 증기 애니메이션: SwiftUI Canvas vs CAEmitterLayer 벤치
- [ ] offline 처리 전략 (RTDB는 기본 오프라인 캐시 있음)
- [ ] 푸시 알림 (FCM) 구조
