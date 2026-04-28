# Sauna iOS · Makefile
#
# 정본 단일 명령들. 새 환경에서도 이거만 보고 시작 가능.

SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

IOS_DIR  := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
PKG_DIR  := $(IOS_DIR)/SaunaPackage
PROJ_YML := $(IOS_DIR)/project.yml
XCODEPROJ := $(IOS_DIR)/Sauna.xcodeproj

CYAN  := \033[36m
RESET := \033[0m

.PHONY: help
help: ## 사용 가능한 타겟 목록
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2}'

# =====================================================================
# SPM
# =====================================================================

.PHONY: build
build: ## SaunaPackage SPM 빌드
	cd $(PKG_DIR) && swift build

.PHONY: test
test: ## SaunaPackage SPM 테스트 (커버리지 포함)
	cd $(PKG_DIR) && swift test --enable-code-coverage

.PHONY: lint
lint: ## SwiftLint --strict (CI 와 동일)
	cd $(IOS_DIR)/.. && swiftlint lint --strict --config .swiftlint.yml ios/SaunaPackage/Sources

.PHONY: lint-fix
lint-fix: ## SwiftLint 자동 수정 가능한 violation 들
	cd $(IOS_DIR)/.. && swiftlint --fix ios/SaunaPackage/Sources

.PHONY: triple-check
triple-check: build test lint ## 빌드 + 테스트 + lint 한 방에

# =====================================================================
# Xcode project (xcodegen)
# =====================================================================

.PHONY: xcode
xcode: ## ios/Sauna.xcodeproj 생성/갱신 (xcodegen 필요)
	@if ! command -v xcodegen >/dev/null 2>&1; then \
		echo "xcodegen 이 없습니다. 'brew install xcodegen' 후 다시 실행하세요."; \
		exit 1; \
	fi
	cd $(IOS_DIR) && xcodegen generate --spec project.yml

.PHONY: xcode-clean
xcode-clean: ## .xcodeproj 삭제 (재생성 전 안전 정리)
	rm -rf $(XCODEPROJ)

.PHONY: xcode-open
xcode-open: ## Xcode 에서 열기 (xcodeproj 없으면 먼저 생성)
	[ -d "$(XCODEPROJ)" ] || $(MAKE) xcode
	open $(XCODEPROJ)

# =====================================================================
# TestFlight (Fastlane)
# =====================================================================

.PHONY: beta
beta: ## TestFlight 업로드 (App Store Connect API 키 필요)
	cd $(IOS_DIR) && bundle exec fastlane beta

.PHONY: release
release: ## App Store 배포 (수동 확인 필요)
	cd $(IOS_DIR) && bundle exec fastlane release
