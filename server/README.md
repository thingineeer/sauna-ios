# SaunaServer

Vapor 4 (Swift 6) backend for the Sauna iOS app — anonymous, ephemeral chat
across three fixed rooms (`daily` 일상, `stock` 주식, `job` 취준).

> 정본: `docs/tech-stack-final.md` §2.
> 메시지는 절대 어디에도 영속되지 않습니다 (Postgres / 로그 / 인메모리 큐 모두 X).
> 로그에는 카운트와 에러 사유만 적습니다.

## Endpoints (현재 단계)

| Path | Method | 설명 |
|---|---|---|
| `/health` | GET | 라이브니스 프로브. `{ok: true, version: "0.1.0"}` |
| `/ws/rooms/:roomId` | GET (WS) | `roomId ∈ {daily, stock, job}`. 다른 값은 400. |
| `/auth/passkey/register/begin` | POST | 등록 챌린지 발급 (스텁) |
| `/auth/passkey/register/finish` | POST | 등록 검증 + 세션 (스텁) |
| `/auth/passkey/login/begin` | POST | 로그인 챌린지 (스텁) |
| `/auth/passkey/login/finish` | POST | 로그인 검증 (스텁) |

> Passkey 4종은 phase 3에서 WebAuthnSwift로 실제 검증 붙입니다. 그 전까지는
> 클라이언트가 모양만 맞춰 통합할 수 있도록 placeholder 응답을 돌려줍니다.

## 로컬 실행

전제: macOS 14+, Swift 6.0 toolchain.

```bash
cd server
swift build              # 첫 빌드는 의존성 fetch 때문에 시간 걸림
swift run SaunaServer    # 기본 0.0.0.0:8080
```

확인:

```bash
curl -sS http://127.0.0.1:8080/health
# {"ok":true,"version":"0.1.0"}
```

WebSocket 빠르게 찍어보기:

```bash
brew install websocat
websocat ws://127.0.0.1:8080/ws/rooms/daily?userId=alice
# 입력:
# {"kind":"send","payload":{"text":"hello sauna"}}
# 같은 방을 보고 있는 다른 클라이언트에게 fanout
```

알 수 없는 방은 거절됩니다:

```bash
websocat ws://127.0.0.1:8080/ws/rooms/UNKNOWN
# HTTP 400
```

## 환경 변수

| Var | 기본값 | 의미 |
|---|---|---|
| `HOST` | `0.0.0.0` | 바인드 호스트 |
| `PORT` | `8080` | 바인드 포트 |
| `LOG_LEVEL` | `info` | Vapor 로거 레벨 (`trace|debug|info|notice|warning|error`) |
| `REDIS_URL` | _(unset)_ | `redis://[:password@]host:port[/db]`. 미설정 시 `InMemoryPubSubBus`로 폴백 (warning 로그) |
| `DATABASE_URL` | _(unset)_ | Phase 3에서 `PostgresPasskeyStore` 연결할 때 사용 |
| `APNS_KEY_ID` | _(unset)_ | Phase 5 (Push) |
| `APNS_TEAM_ID` | _(unset)_ | Phase 5 |
| `APNS_PRIVATE_KEY_PATH` | _(unset)_ | Phase 5 |

> `REDIS_URL`이 없거나 도달 불가하면 서버는 **죽지 않고** 인메모리 fanout으로
> 폴백합니다 (개발 편의). 단일 프로세스 안에서만 동작하므로 운영에서는 절대
> 그 폴백 경로로 들어가지 않게 하세요.

## 테스트

```bash
swift test
```

테스트 대상:

- `HealthTests` — `/health` 200 + 바디 일치
- `InMemoryPubSubBusTests` — publish/subscribe/unsubscribe 4종
- `RoomControllerTests` — 잘못된 `roomId` 거절, `RoomKind.parse` 도메인 정확도, `RateLimiter` 한도/리셋

## Docker

```bash
docker build -t sauna-server:dev server/
docker run --rm -p 8080:8080 -e LOG_LEVEL=debug sauna-server:dev
docker inspect --format='{{json .State.Health}}' <container_id>
```

이미지는 multi-stage:
- `swift:6.0-jammy` (build) → `swift:6.0-jammy-slim` (runtime)
- 비-root `sauna:sauna` 사용자
- 30초 간격 `curl /health` 헬스체크 (start-period 15s, retries 3)
- `EXPOSE 8080`

ECS Fargate (서울)로 배포하려면 `infra/terraform/`이 phase 2 이후 추가됩니다.

## 디렉터리 구조

```
server/
├── Package.swift
├── Sources/SaunaServer/
│   ├── entrypoint.swift          @main, async boot
│   ├── configure.swift           DI, PubSub 선택, 라우트 등록
│   ├── routes.swift
│   ├── Controllers/
│   │   ├── HealthController.swift
│   │   ├── RoomController.swift  WS endpoint, 채팅 fanout
│   │   └── PasskeyController.swift  4종 스텁
│   ├── Domain/                   클라이언트와 공유 가능한 모델
│   │   ├── Room.swift
│   │   ├── Nickname.swift
│   │   └── Message.swift
│   ├── PubSub/
│   │   ├── PubSubBus.swift       프로토콜
│   │   ├── InMemoryPubSubBus.swift  actor 기반 in-process
│   │   └── RedisPubSubBus.swift  RediStack
│   ├── Storage/
│   │   ├── PasskeyStore.swift    프로토콜
│   │   └── PostgresPasskeyStore.swift  PostgresKit (phase 3)
│   └── Middleware/
│       └── RateLimiter.swift     per-userId 1초 2개 (스텁)
├── Tests/SaunaServerTests/
└── Dockerfile
```

## 메시지 영속 금지 (재차)

- Postgres 테이블 `chat_messages` ← **만들지 마세요.**
- Redis Stream 으로 채팅 저장 ← **만들지 마세요.**
- Logger metadata에 `text` ← **넣지 마세요.** 카운트/사이즈/이유만.

채팅은 pub/sub fanout 단계 한 번만 거치고 휘발합니다. 이게 제품 본질입니다.
