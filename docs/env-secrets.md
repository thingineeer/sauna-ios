# Sauna · 환경변수 / 시크릿 인벤토리

> 작성: 2026-04-28
> 정본 — 새 환경 만들 때 이 표를 보고 채움.

## 보안 원칙

1. **이 레포에 실제 값을 커밋하지 않는다.** 위반 시 즉시 revert 후 키 회전.
2. 템플릿 (`*.example`) 만 커밋. 실제 `.env` / `.fastlane.env` / `*.p8` 등은 `.gitignore` 에서 차단.
3. 시크릿은 다음 3 곳 중 하나에 둔다:
   - **로컬 개발**: `.env` 파일 (gitignored)
   - **CI**: GitHub Actions repository secrets
   - **운영**: AWS Secrets Manager 또는 ECS task definition env (Phase 2+ 인프라 적용 시)
4. 사용자의 통합 env 저장소는 별도 private repo: **https://github.com/thingineeer/thingineeer-env**
   - sauna-ios 가 public 이 되면 이 곳이 진짜 시크릿 저장소.

## 시크릿 인벤토리

### iOS (앱 런타임)

| 키 | 어디서 사용 | 어디에 저장 | 누가 발급 |
|---|---|---|---|
| `SAUNA_HTTP_BASE_URL` | `AppEnvironment.fromBundle()` | Info.plist + xcconfig | 우리가 정함 (예: `https://api.sauna.app`) |
| `SAUNA_WS_BASE_URL` | 동일 | 동일 | `wss://api.sauna.app` |
| `SAUNA_SENTRY_DSN` | `Observability.bootstrap(...)` | Info.plist + xcconfig + GitHub Actions secret | sentry.io 프로젝트 생성 시 |
| `SAUNA_USE_STUB_ROOM` | preview / 오프라인 데모 | xcconfig 만 (Debug only) | `1` (스텁) / `0` (실 서버) |

### TestFlight (Fastlane)

| 키 | 어디서 사용 | 어디에 저장 | 누가 발급 |
|---|---|---|---|
| `FASTLANE_TEAM_ID` | `Appfile` | `.env.fastlane` (local) + GitHub Actions secret | Apple Developer (10자) |
| `FASTLANE_ITC_TEAM_ID` | `Appfile` | 동일 | App Store Connect (앱이 다른 팀일 수 있음) |
| `FASTLANE_USER` | `Appfile` (옵션) | 동일 | Apple ID 이메일 |
| `APP_STORE_CONNECT_API_KEY_KEY_ID` | `Fastfile` `app_store_connect_api_key` | 동일 | App Store Connect → Users → API Keys |
| `APP_STORE_CONNECT_API_KEY_ISSUER_ID` | 동일 | 동일 | 동일 |
| `APP_STORE_CONNECT_API_KEY_KEY` | 동일 | 동일 (`.p8` 의 base64) | 동일 |
| `MATCH_PASSWORD` | (옵션) Match 사용 시 | 동일 | 임의 |
| `FASTLANE_CHANGELOG` | 빌드 노트 | (옵션) | 임의 |

### Server (Vapor)

| 키 | 어디서 사용 | 어디에 저장 | 발급 / 기본값 |
|---|---|---|---|
| `HOST` | `configure.swift` | docker-compose / ECS task | 보통 `0.0.0.0` |
| `PORT` | 동일 | 동일 | `8080` |
| `REDIS_URL` | `RedisPubSubBus.connect` | 동일 | `redis://redis:6379` (로컬) / ElastiCache 엔드포인트 |
| `DATABASE_URL` | `wirePostgres` | 동일 | `postgres://user:pw@host:5432/db?sslmode=require` |
| `RP_ID` | `Application.rpIdentifier` | 동일 | `sauna.app` (도메인 등록 후) |
| `APNS_KEY_ID` | (Phase 5) | 동일 | Apple Developer → Keys |
| `APNS_TEAM_ID` | 동일 | 동일 | 동일 |
| `APNS_AUTH_KEY` | 동일 | 동일 (`.p8` base64) | 동일 |
| `SENTRY_DSN` | (Phase 3+) Sentry-Cocoa-server | 동일 | sentry.io 프로젝트 (server) |

### Infrastructure (Terraform / docker-compose)

| 키 | 어디서 사용 | 어디에 저장 |
|---|---|---|
| `POSTGRES_PASSWORD` | `infra/.env` (도커 컴포즈) | gitignored `infra/.env` (예시는 `.env.example`) |
| AWS credentials | `terraform apply` | `~/.aws/credentials` 또는 GitHub OIDC role (Phase 2 운영 시) |

### GitHub Actions secrets (CI)

CI 가 자동으로 사용. `gh secret set <KEY>` 또는 https://github.com/thingineeer/sauna-ios/settings/secrets/actions

```
FASTLANE_TEAM_ID
FASTLANE_ITC_TEAM_ID
APP_STORE_CONNECT_API_KEY_KEY_ID
APP_STORE_CONNECT_API_KEY_ISSUER_ID
APP_STORE_CONNECT_API_KEY_KEY              # .p8 base64
SAUNA_SENTRY_DSN                           # iOS app
SAUNA_HTTP_BASE_URL                        # 옵션 — Release 빌드 시 xcconfig 에 주입
SAUNA_WS_BASE_URL
MATCH_PASSWORD                             # (옵션)
```

## 새 환경 만드는 절차

1. `git clone git@github.com:thingineeer/thingineeer-env.git ~/.sauna-env`
2. 거기서 `sauna/` 폴더 안에 있는 `.env.fastlane`, `.env.server`, `.env.infra` 등을 적절한 경로에 symlink
   - `ln -sf ~/.sauna-env/sauna/.env.fastlane ios/.env.fastlane`
   - `ln -sf ~/.sauna-env/sauna/.env.server server/.env`
   - `ln -sf ~/.sauna-env/sauna/.env.infra infra/.env`
3. `gh secret set` 으로 CI secrets 한 번 등록 (CI 첫 셋업 시 1회)
4. iOS Release 빌드 시 xcconfig 에 `SAUNA_*` 환경 변수 매핑 (Phase 2 시 추가)

## 노출되면 즉시 회전해야 할 키

| 키 | 회전 절차 |
|---|---|
| App Store Connect API Key | App Store Connect → Users → API Keys → Revoke + 새 키 발급 |
| Apple APNS Key | Apple Developer → Keys → 기존 revoke + 새 .p8 생성 |
| Sentry DSN | sentry.io → Project → Settings → Client Keys → Revoke |
| Postgres 비밀번호 | RDS 콘솔 modify → 새 master password |
| Redis ACL (Phase 5+) | ElastiCache modify |
| GitHub PAT | https://github.com/settings/tokens → Revoke |
