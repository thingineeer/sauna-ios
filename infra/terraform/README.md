# Sauna · Terraform Skeleton

> 상태: **스켈레톤 (not deployable yet)**.
> 실제 `terraform apply` 전에 아래 "운영 진입 체크리스트" 충족 필요.

이 디렉터리는 Sauna 백엔드 인프라를 IaC 로 정의합니다.
스택: VPC + ECS Fargate + ElastiCache Redis + RDS Postgres + ALB + ECR + ACM + Route53.

## 구조

```
terraform/
├── versions.tf            ← terraform / provider 버전 잠금
├── main.tf                ← provider 선언 + locals (name, env, tags, AZ)
├── variables.tf           ← 입력 변수 (env, domain, image_tag, 등)
├── network.tf             ← VPC + 2 public + 2 private + IGW + NAT
├── security_groups.tf     ← ALB / ECS / RDS / Redis SG
├── ecr.tf                 ← ECR 저장소 (sauna-server) + lifecycle policy
├── ecs.tf                 ← Cluster + Task Def + Service + Auto-scaling
├── elasticache.tf         ← Redis 7 (dev: 단일 노드 / prod: replication group)
├── rds.tf                 ← Postgres 16 (dev: single-AZ / prod: Multi-AZ + 암호화)
├── alb.tf                 ← ALB + ACM 인증서 + Route53 A record + WS idle 3600s
├── outputs.tf             ← alb_dns_name, redis_endpoint, db_endpoint 등
└── README.md              ← 이 파일
```

## 환경 = Workspace

`dev` / `prod` 환경을 Terraform workspace 로 분리합니다.

```bash
make tf-init ENV=dev    # workspace 생성 + init
make tf-plan ENV=dev    # 실행 계획 확인
make tf-apply ENV=dev   # 실제 적용
```

dev/prod 차이는 `main.tf` 의 `local.is_prod` 분기로 처리:

| 자원 | dev | prod |
|---|---|---|
| NAT Gateway | 1개 (single_nat) | AZ 별 1개 |
| Fargate capacity | FARGATE_SPOT 우선 | FARGATE 보장 |
| ECS Container Insights | off | on |
| RDS instance | t4g.micro | t4g.small |
| RDS Multi-AZ | off | on |
| RDS deletion_protection | off | on |
| RDS final snapshot | off | on |
| Redis | 단일 cluster | replication group + AUTH + TLS |
| Log retention | 7일 | 30일 |

## 운영 진입 체크리스트

스켈레톤을 실제 운영 가능 상태로 만들기 위해 필요한 것:

1. **AWS 자격증명**
   - 로컬에 `~/.aws/credentials` 또는 환경변수 (`AWS_ACCESS_KEY_ID` 등)
   - CI 에서는 OIDC 권장 (GitHub Actions → IAM Role)

2. **Route53 hosted zone**
   - 베이스 도메인 (`sauna.app`) 의 hosted zone 사전 생성 필요
   - `data.aws_route53_zone.main` 가 자동 lookup

3. **State backend (S3 + DynamoDB)**
   - 처음에는 로컬 state 로 시작 (지금)
   - prod 직전에 `main.tf` 의 `backend "s3"` 블록 주석 해제 + `terraform init -migrate-state`
   - 사전 생성:
     ```bash
     aws s3api create-bucket --bucket sauna-tfstate-aps2 \
       --region ap-northeast-2 \
       --create-bucket-configuration LocationConstraint=ap-northeast-2
     aws s3api put-bucket-versioning --bucket sauna-tfstate-aps2 \
       --versioning-configuration Status=Enabled
     aws dynamodb create-table --table-name sauna-tfstate-lock \
       --attribute-definitions AttributeName=LockID,AttributeType=S \
       --key-schema AttributeName=LockID,KeyType=HASH \
       --billing-mode PAY_PER_REQUEST \
       --region ap-northeast-2
     ```

4. **ECR 이미지**
   - 첫 `apply` 는 `image_tag = "latest"` 로 가능 — ECS 가 이미지 없어 task 가 실패하지만 인프라는 올라옴
   - CI 에서 `docker build && docker push` 후 `terraform apply -var "image_tag=$GIT_SHA"`

5. **변수 입력**
   - `terraform.tfvars` 또는 `-var` 플래그
   - 최소: `env`, `domain` (예: `dev.sauna.app`)

## Plan/Apply 워크플로

```bash
# 첫 셋업 (dev)
cd infra/terraform
terraform init
terraform workspace new dev

terraform plan -var "env=dev" -var "domain=dev.sauna.app" -out=dev.tfplan
terraform apply dev.tfplan
```

또는 `infra/Makefile` 사용:

```bash
make tf-init ENV=dev
make tf-plan ENV=dev
make tf-apply ENV=dev
```

## 비용 절감 메모

- dev 는 `FARGATE_SPOT` 으로 task 비용 70% 절감
- dev 는 NAT 1개 → AZ 간 데이터 트래픽 발생하지만 비용 절반
- ECR lifecycle 로 이미지 30개만 유지 + untagged 7일
- Container Insights 는 prod 만 (dev 는 CloudWatch 기본 메트릭으로 충분)

## 미구현 (다음 단계)

- [ ] WAF (ALB 앞단)
- [ ] CloudFront (정적 자산 / about 페이지)
- [ ] APNs 키를 Secrets Manager 에 보관 + IAM 정책
- [ ] Sentry source map 업로드 IAM
- [ ] CloudWatch Alarm → SNS → Slack
- [ ] RDS read replica (prod 트래픽 증가 시)
- [ ] ECR cross-region 복제 (DR 단계)
