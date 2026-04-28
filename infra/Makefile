# Sauna · 인프라 Makefile
#
# 로컬: docker compose 래핑
# Terraform: env 별 workspace 진입 (dev|prod) — 아직 backend 미설정, 로컬 state.

SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

# ----- 경로 -----
INFRA_DIR  := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
COMPOSE    := docker compose -f $(INFRA_DIR)/docker-compose.yml
TF_DIR     := $(INFRA_DIR)/terraform

# ----- 환경 -----
# 사용 예: make tf-plan ENV=dev
ENV ?= dev

# ----- 컬러 -----
CYAN  := \033[36m
RESET := \033[0m

.PHONY: help
help: ## 사용 가능한 타겟 목록
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2}'

# =====================================================================
# Local (Docker Compose)
# =====================================================================

.PHONY: local-up
local-up: ## 로컬 Redis + Postgres 시작 (-d)
	$(COMPOSE) up -d
	$(COMPOSE) ps

.PHONY: local-down
local-down: ## 로컬 컨테이너 정지 (볼륨 보존)
	$(COMPOSE) down

.PHONY: local-nuke
local-nuke: ## 로컬 컨테이너 + 볼륨 삭제 (Postgres 데이터 사라짐)
	$(COMPOSE) down -v

.PHONY: local-logs
local-logs: ## 로컬 컨테이너 로그 follow
	$(COMPOSE) logs -f --tail=100

.PHONY: local-ps
local-ps: ## 로컬 상태
	$(COMPOSE) ps

.PHONY: local-redis
local-redis: ## Redis CLI 접속
	$(COMPOSE) exec redis redis-cli

.PHONY: local-psql
local-psql: ## Postgres psql 접속
	$(COMPOSE) exec postgres psql -U $${POSTGRES_USER:-sauna} -d $${POSTGRES_DB:-sauna_dev}

.PHONY: local-validate
local-validate: ## docker-compose.yml 문법 검증
	$(COMPOSE) config -q && echo "compose: ok"

# =====================================================================
# Terraform
# =====================================================================
# 모든 tf 타겟은 ENV=dev|prod 필요. workspace 로 분리.

.PHONY: _tf-guard
_tf-guard:
	@case "$(ENV)" in \
		dev|prod) ;; \
		*) echo "ENV 는 dev 또는 prod 여야 합니다 (지정값: $(ENV))"; exit 1;; \
	esac

.PHONY: tf-init
tf-init: _tf-guard ## terraform init (현재는 로컬 backend)
	cd $(TF_DIR) && terraform init -upgrade
	cd $(TF_DIR) && terraform workspace select $(ENV) || terraform workspace new $(ENV)

.PHONY: tf-fmt
tf-fmt: ## terraform fmt -recursive
	cd $(TF_DIR) && terraform fmt -recursive

.PHONY: tf-fmt-check
tf-fmt-check: ## terraform fmt -check
	cd $(TF_DIR) && terraform fmt -check -recursive

.PHONY: tf-validate
tf-validate: _tf-guard ## terraform validate
	cd $(TF_DIR) && terraform workspace select $(ENV)
	cd $(TF_DIR) && terraform validate

.PHONY: tf-plan
tf-plan: _tf-guard ## terraform plan -var "env=$(ENV)"
	cd $(TF_DIR) && terraform workspace select $(ENV)
	cd $(TF_DIR) && terraform plan -var "env=$(ENV)" -out=$(ENV).tfplan

.PHONY: tf-apply
tf-apply: _tf-guard ## terraform apply (수동 확인 필요)
	@echo "주의: 실제 AWS 자원이 생성됩니다."
	cd $(TF_DIR) && terraform workspace select $(ENV)
	cd $(TF_DIR) && terraform apply $(ENV).tfplan

.PHONY: tf-destroy
tf-destroy: _tf-guard ## terraform destroy (위험)
	@read -p "$(ENV) 환경의 모든 자원을 삭제합니다. 계속? [y/N] " ans; [ "$$ans" = "y" ]
	cd $(TF_DIR) && terraform workspace select $(ENV)
	cd $(TF_DIR) && terraform destroy -var "env=$(ENV)"
