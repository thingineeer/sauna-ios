# Sauna · 인프라 운영 가이드

이 디렉터리는 Sauna 백엔드의 **로컬 개발 환경** 과 **AWS 운영 환경 IaC** 를 모두 담습니다.

```
infra/
├── docker-compose.yml      ← 로컬 (Redis + Postgres)
├── .env.example            ← 비밀 템플릿
├── Makefile                ← 자주 쓰는 명령 래퍼
├── terraform/              ← AWS 인프라 (스켈레톤)
└── README.md               ← 이 파일
```

연관 문서:

- `docs/tech-stack-final.md` §3 — 인프라 결정의 근거
- `infra/terraform/README.md` — Terraform 모듈 설명 + 운영 진입 체크리스트

## 1. 로컬 개발

### 사전 준비

- Docker Desktop (Mac) 또는 OrbStack 또는 colima
- `make`

### 시작

```bash
cd infra
cp .env.example .env       # 필요 시 비밀번호 변경 — .env 는 gitignore 됨
make local-up              # 또는: docker compose up -d
make local-ps              # 상태 확인
```

성공하면:

| 서비스 | 호스트:포트 | 헬스체크 |
|---|---|---|
| Redis 7 | `localhost:6379` | `redis-cli ping` → `PONG` |
| Postgres 16 | `localhost:5432` | `pg_isready` |

### 연결 테스트

```bash
# Redis
make local-redis           # 컨테이너 안에서 redis-cli
# 또는 호스트에서:
redis-cli -h localhost -p 6379 ping

# Postgres
make local-psql            # 컨테이너 안에서 psql
# 또는 호스트에서:
psql "postgres://sauna:dev@localhost:5432/sauna_dev" -c "SELECT version();"
```

서버 (Vapor) 가 읽을 환경변수 (자체 `server/.env` 또는 export):

```bash
export DATABASE_URL=postgres://sauna:dev@localhost:5432/sauna_dev
export REDIS_URL=redis://localhost:6379
```

### 정지 / 초기화

```bash
make local-down            # 컨테이너 정지 (데이터 보존)
make local-nuke            # 컨테이너 + 볼륨 삭제 (Postgres 데이터 사라짐)
make local-logs            # 실시간 로그
```

### 정책

- **Redis 영속 X** — `appendonly no`, `save ""`. 휘발성 채팅과 정합.
- **Postgres 영속 O** — `pg_data` named volume. Passkey 자격증명 등.
- **타임존 KST** — Postgres `TZ=Asia/Seoul`. 자정 닉네임 리셋과 정합.

## 2. AWS 운영

### 개요

| 환경 | 호스팅 | 식별 |
|---|---|---|
| local | docker compose | (이 폴더) |
| dev | AWS 서울 · 작은 Fargate task 1개 | `terraform workspace = dev` |
| prod | AWS 서울 · Fargate auto-scale + Multi-AZ | `terraform workspace = prod` |

### 자원 구성 (`infra/terraform/`)

```
인터넷
   ↓
ALB (:443, idle 3600s for WS)
   ↓ TLS terminate
ECS Service (Fargate, ARM64, /health 헬스체크)
   ↓
ElastiCache Redis 7 (Pub/Sub + presence)
RDS Postgres 16 (Passkey credentials)
```

서울 리전 (`ap-northeast-2`), AZ 2개 (a/c). 자세한 자원 목록은 `terraform/README.md` 참조.

### 진입 흐름 (요약)

```bash
# 0. 처음 한 번: hosted zone, ECR 사전 생성, AWS 자격증명 셋업

# 1. dev workspace 진입
make tf-init ENV=dev

# 2. 변경 미리보기
make tf-plan ENV=dev

# 3. 적용 (확인 후)
make tf-apply ENV=dev

# 4. 결과 확인
cd terraform && terraform output
```

자세한 체크리스트와 backend 마이그레이션은 `terraform/README.md` 의 "운영 진입 체크리스트" 참조.

## 3. CI/CD 와의 관계

GitHub Actions 흐름 (`.github/workflows/server.yml`):

1. PR → `swift test` 통과
2. main 머지 → Docker build → ECR push (`<repo>:<git-sha>`)
3. `terraform apply -var "image_tag=<git-sha>"` 로 task definition revision 갱신
4. ECS service 가 rolling update (deployment circuit breaker 활성)

iOS 앱은 별도 (`.github/workflows/ios.yml`) — 인프라 영향 없음.

## 4. 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| `docker compose up` 에서 5432 충돌 | 호스트의 Postgres 가 먼저 떠 있음. `lsof -i:5432` 로 확인, brew 등으로 정지. |
| Redis 가 즉시 OOM | `maxmemory 256mb` + `allkeys-lru` 라 큰 페이로드는 평가 X. 정상. |
| `make tf-plan` 이 인증 오류 | AWS 자격증명 누락. `aws sts get-caller-identity` 로 확인. |
| ECS task 가 즉시 stop | `image_tag` 가 ECR 에 없음 (첫 apply). `docker push` 후 재시도. |
| ALB DNS 가 503 | task 가 `/health` 200 을 못 줌. CloudWatch Logs 에서 `/aws/ecs/sauna-<env>-server` 확인. |
| WebSocket 이 30초 후 끊김 | ALB idle_timeout 확인 (기본 3600). 클라이언트 ping/pong 도 점검. |

## 5. 보안 메모

- `.env` 는 절대 커밋 금지 — `.gitignore` 적용됨
- prod 의 RDS/Redis 자격증명은 Secrets Manager + IAM 으로만 접근 (코드/터미널 노출 X)
- ALB 는 TLS 1.2/1.3 만 (`ELBSecurityPolicy-TLS13-1-2-2021-06`)
- RDS · ElastiCache 는 private subnet, 보안 그룹은 ECS task 만 in-bound
- 메시지는 어떤 영속 저장소에도 들어가지 않음 (휘발이 본질)
