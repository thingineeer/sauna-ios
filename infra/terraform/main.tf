# Sauna · Terraform 진입점
#
# 현재는 스켈레톤. 실제 apply 는 다음을 충족한 뒤:
#   1) AWS 자격증명 (env 또는 profile)
#   2) ACM 인증서 사전 발급 또는 alb.tf 의 cert 모듈 활성화
#   3) S3 backend 마이그레이션 (아래 backend 블록 주석 해제)
#
# Workspace = 환경 (dev|prod). 자세한 내용은 README.md 참조.

# ---- Backend (현재는 로컬 state) ----
# 운영 진입 시 아래 블록 주석 해제 + 사전에 S3/DynamoDB 생성:
# terraform {
#   backend "s3" {
#     bucket         = "sauna-tfstate-aps2"
#     key            = "infra/terraform.tfstate"
#     region         = "ap-northeast-2"
#     dynamodb_table = "sauna-tfstate-lock"
#     encrypt        = true
#   }
# }

# ---- Provider ----
provider "aws" {
  region = var.region

  default_tags {
    tags = local.common_tags
  }
}

# ---- 공통 식별자/태그 ----
locals {
  name = "sauna"
  env  = var.env

  # 모든 자원 prefix. 예: sauna-dev-server
  name_prefix = "${local.name}-${local.env}"

  common_tags = {
    Project   = local.name
    Env       = local.env
    ManagedBy = "terraform"
  }

  # env 별 사이즈/리던던시 분기
  is_prod = local.env == "prod"

  # 가용 영역 2개 (서울 a/c).
  azs = ["${var.region}a", "${var.region}c"]
}
