---
name: vapor-controller-add
description: server/Sources/SaunaServer 에 Vapor 4 라우트나 WebSocket 핸들러를 추가할 때 반드시 트리거된다. RouteCollection.boot 등록, RoomKind validation, Authorization Bearer 검증, RateLimiter 미들웨어 적용, PubSubBus 추상 사용, XCTVapor + InMemoryPubSubBus 테스트, 에러 → status code 매핑까지 다룬다. "서버 endpoint 추가", "WS 핸들러", "라우트 만들어줘", "Passkey API 구현", "rate-limit 적용" 같은 요청 시 사용. 메시지 영속·로깅은 절대 하지 않는다.
---

# vapor-controller-add

`server/` 의 Vapor 4 서버에 새 컨트롤러를 추가한다.

## 절대 지키는 규칙

1. **메시지 텍스트 절대 영속/로깅 X.** Redis PUBLISH 까지만, SUBSCRIBE 가 떠난 다음에는 흔적 0.
2. **알 수 없는 roomId 는 라우터가 404.** controller 안에서 `Abort(.badRequest)` 하지 말 것 — Vapor WS upgrade 의 promise cascade 가 제대로 응답을 못 보내는 알려진 함정.
3. **PubSubBus 프로토콜 뒤에**: 컨트롤러는 `RedisPubSubBus` 를 직접 import 하지 않는다. `app.storage[PubSubBusKey.self]` 로 주입.
4. **`@unchecked Sendable` 사용 시 사유 주석 필수**.
5. **Auth 헤더는 한 곳에서 검증** (Phase 3): `PasskeyAuthMiddleware` 가 `Authorization: Bearer <token>` 검증하고 `req.auth.userId` 채움. controller 가 직접 token 디코드 금지.

## 라우트 추가 절차

```
[1] DOMAIN — DTO Codable
    server/Sources/SaunaServer/Domain/<Name>.swift
    ─ struct Name: Content { let field: Type }
    ─ iOS 의 RemoteRoomRepository 의 매칭 struct 와 byte 단위 일치

[2] CONTROLLER
    server/Sources/SaunaServer/Controllers/<Name>Controller.swift
    ─ struct NameController: RouteCollection {
        func boot(routes: RoutesBuilder) throws {
          routes.grouped("name").post(use: handle)
        }
        func handle(_ req: Request) async throws -> Response { ... }
      }

[3] WIRE 등록
    server/Sources/SaunaServer/routes.swift
    ─ try app.register(collection: NameController())

[4] CONFIG (만약 새 의존성 필요)
    server/Sources/SaunaServer/configure.swift
    ─ app.storage[CustomKey.self] = ...

[5] RATE LIMIT (send 류 라우트)
    .grouped(RateLimiter(per: "userId", limit: 2, window: .seconds(1)))

[6] TEST — XCTVapor + InMemoryPubSubBus
    server/Tests/SaunaServerTests/<Name>ControllerTests.swift
    ─ try await app.test(.POST, "/name", afterResponse: { response in
        XCTAssertEqual(response.status, .noContent)
      })
    ─ port = 0 으로 ephemeral binding (다른 테스트와 충돌 0)

[7] BUILD + TEST
    swift build --package-path server
    swift build --package-path server -c release  ← release 빌드도 확인
    swift test  --package-path server

[8] iOS 측 RemoteRoomRepository 갱신 (DTO 변경 시)
    ios-feature-developer 에게 SendMessage:
    "Vapor 의 NewRoute 는 다음 shape 의 JSON 을 받음/리턴함: { ... }"

[9] ATOMIC 커밋
    · feat(server,domain): <Name> Codable
    · feat(server): <Name>Controller + 테스트
    · (필요) refactor(server): configure.swift 에 의존성 등록
```

## WebSocket 핸들러 패턴

per-room 라우팅 패턴 (이미 RoomController 가 사용):

```swift
func boot(routes: RoutesBuilder) throws {
    for kind in Room.Kind.allCases {  // daily/stock/job
        routes.webSocket("ws", "rooms", kind.rawValue) { req, ws in
            Task { await Self.handle(ws: ws, room: kind, req: req) }
        }
    }
}
```

알 수 없는 roomId 는 자동 404. controller 에서 validation 안 함.

## 에러 → status code 매핑

| 상황 | status |
|---|---|
| 정상 send (no body) | 204 No Content |
| 빈 body / 너무 김 | 400 Bad Request |
| Authorization 누락/유효하지 않음 | 401 Unauthorized |
| RateLimiter 거절 | 429 Too Many Requests + `Retry-After` 헤더 |
| PubSub 실패 | 503 Service Unavailable |
| 알 수 없는 roomId | 404 (라우터가 자동) |

iOS 의 `NetworkError.statusCode(Int)` 가 위 코드들을 보고 사용자에게 어떻게 보일지 결정.

## 테스트 패턴

```swift
final class NewControllerTests: XCTestCase {
    func testHappyPath() async throws {
        let app = try await Application.make(.testing)
        defer { try? app.syncShutdown() }
        try await configure(app)        // 같은 configure 사용
        // InMemoryPubSubBus 가 자동 주입됨 (테스트 환경)

        try await app.testable().test(.POST, "/name", beforeRequest: { req in
            try req.content.encode(NamePayload(text: "hi"))
            req.headers.bearerAuthorization = .init(token: "test-jwt")
        }, afterResponse: { res in
            XCTAssertEqual(res.status, .noContent)
        })
    }
}
```

## 흔한 함정

- **WS upgrade 안에서 `Abort` throw**: cascade 가 무응답을 만들고 client 가 hang. → per-route 등록으로 해결.
- **`@Sendable` 누락한 closure**: `app.webSocket(...) { req, ws in ... }` 의 inner Task 가 ws 를 캡처할 때 strict-concurrency 발끈. → `Task { @Sendable in ... }` 또는 actor.
- **Test 가 hang**: WS 가 닫히길 기다리는데 안 닫음 → `defer { Task { try? await ws.close() } }` 짝.
- **release build 만 깨짐**: optimization level 차이. `swift build -c release` 로 사전 점검.

## 출력

```
파일: server/Sources/SaunaServer/Controllers/NameController.swift
파일: server/Sources/SaunaServer/Domain/Name.swift
파일: server/Tests/SaunaServerTests/NameControllerTests.swift

swift build:           ✅ debug, ✅ release
swift test:            ✅ N tests pass

iOS DTO 일치:          □ (integration-qa 호출 필요)
커밋:
  feat(server,domain): Name Codable
  feat(server): NameController + 테스트
```
