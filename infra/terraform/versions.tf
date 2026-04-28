# Provider/모듈 버전 잠금
# 운영 진입 직전(=프로덕션 첫 apply)에 lockfile (.terraform.lock.hcl) 커밋 권장.

terraform {
  required_version = ">= 1.6.0, < 2.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.60"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}
