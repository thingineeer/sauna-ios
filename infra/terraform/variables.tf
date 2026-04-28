# 입력 변수
#
# 사용 예:
#   terraform plan -var "env=dev" -var "domain=dev.sauna.app"

variable "env" {
  description = "배포 환경 (dev | prod). workspace 와 일치시켜 사용."
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "prod"], var.env)
    error_message = "env 는 dev 또는 prod 만 허용됩니다."
  }
}

variable "region" {
  description = "AWS 리전. 한국 사용자 대상이므로 서울 고정."
  type        = string
  default     = "ap-northeast-2"
}

variable "domain" {
  description = "ALB + Route53 에서 사용할 베이스 도메인. 예: dev.sauna.app / api.sauna.app"
  type        = string
  default     = "api.sauna.app"
}

variable "image_tag" {
  description = "ECR 에서 가져올 SaunaServer 이미지 태그 (보통 git SHA). CI 가 -var 로 주입."
  type        = string
  default     = "latest"
}

# ---- 네트워크 ----
variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
  default     = "10.40.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public 서브넷 CIDR 2개 (a/c)"
  type        = list(string)
  default     = ["10.40.0.0/20", "10.40.16.0/20"]
}

variable "private_subnet_cidrs" {
  description = "Private 서브넷 CIDR 2개 (a/c) — Fargate task / RDS / ElastiCache"
  type        = list(string)
  default     = ["10.40.32.0/20", "10.40.48.0/20"]
}

# ---- ECS / Fargate ----
variable "service_desired_count" {
  description = "ECS 서비스 baseline task 개수"
  type        = number
  default     = 1
}

variable "service_min_capacity" {
  description = "auto-scaling 최소"
  type        = number
  default     = 1
}

variable "service_max_capacity" {
  description = "auto-scaling 최대"
  type        = number
  default     = 6
}

variable "task_cpu" {
  description = "Fargate task CPU (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "task_memory" {
  description = "Fargate task 메모리 (MB)"
  type        = number
  default     = 1024
}

variable "container_port" {
  description = "Vapor 서버 컨테이너 포트"
  type        = number
  default     = 8080
}

# ---- ALB ----
variable "alb_idle_timeout_seconds" {
  description = "ALB idle timeout. WebSocket 유지를 위해 3600s."
  type        = number
  default     = 3600
}

# ---- RDS ----
variable "db_name" {
  description = "Postgres DB 이름"
  type        = string
  default     = "sauna"
}

variable "db_username" {
  description = "Postgres 마스터 사용자명. 패스워드는 random_password 로 생성, Secrets Manager 저장 권장."
  type        = string
  default     = "sauna"
}

variable "db_allocated_storage_gb" {
  description = "RDS 할당 스토리지 (GB)"
  type        = number
  default     = 20
}

variable "db_backup_retention_days" {
  description = "RDS 백업 보존 일수. dev=1, prod=7."
  type        = number
  default     = 1
}

# ---- ElastiCache (Redis) ----
variable "redis_node_type" {
  description = "ElastiCache 노드 타입. dev=t4g.micro, prod=t4g.small 권장."
  type        = string
  default     = "cache.t4g.micro"
}
