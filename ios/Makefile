# Sauna iOS · Tuist (TMA) Makefile
#
# 정본 단일 명령들. Tuist 4 + TMA 5-target 패턴.

SHELL := /bin/bash
.SHELLFLAGS := -eu -o pipefail -c
.DEFAULT_GOAL := help

IOS_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))

DEST    := platform=iOS Simulator,name=iPhone 17,OS=latest
WS      := Sauna.xcworkspace
SCHEMES_TEST := Domain Data PixelMascot Observability \
                FeatureOnboarding FeatureHome FeatureRoom FeatureMe

CYAN  := \033[36m
RESET := \033[0m

.PHONY: help
help: ## 사용 가능한 타겟 목록
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2}'

# =====================================================================
# Tuist
# =====================================================================

.PHONY: install
install: ## tuist install — 외부 SPM (Sentry 등) 다운로드
	cd $(IOS_DIR) && tuist install

.PHONY: generate
generate: ## tuist generate — .xcworkspace + .xcodeproj 들 생성
	cd $(IOS_DIR) && tuist generate --no-open

.PHONY: build
build: generate ## 빌드 (Sauna app, Debug)
	cd $(IOS_DIR) && xcodebuild -workspace $(WS) -scheme Sauna \
		-destination "$(DEST)" -configuration Debug build

.PHONY: test
test: generate ## 모든 모듈 단위 테스트 (한 번에 모듈별로 통과 카운트)
	@cd $(IOS_DIR) && \
	pass=0; fail=0; \
	for s in $(SCHEMES_TEST); do \
	  out=$$(xcodebuild test -workspace $(WS) -scheme "$$s" \
	    -destination "$(DEST)" 2>&1); \
	  p=$$(echo "$$out" | grep -cE "Test Case .* passed"); \
	  f=$$(echo "$$out" | grep -cE "Test Case .* failed"); \
	  status="OK"; [ "$$f" -gt 0 ] && status="FAIL"; \
	  printf "  [%s] %-22s %3d passed / %d failed\n" "$$status" "$$s" "$$p" "$$f"; \
	  pass=$$((pass + p)); fail=$$((fail + f)); \
	done; \
	echo ""; echo "Total: $$pass passed / $$fail failed"; \
	[ "$$fail" -eq 0 ]

.PHONY: lint
lint: ## SwiftLint --strict (전체 모듈)
	cd $(IOS_DIR)/.. && swiftlint lint --strict --config .swiftlint.yml \
		ios/Projects server/Sources

.PHONY: triple-check
triple-check: build test lint ## 빌드 + 테스트 + lint 한 방에

.PHONY: open
open: generate ## Xcode 에서 열기
	cd $(IOS_DIR) && open Sauna.xcworkspace

.PHONY: clean
clean: ## 생성물 정리 (.xcodeproj, .xcworkspace, DerivedData)
	cd $(IOS_DIR) && tuist clean
	rm -rf $(IOS_DIR)/Sauna.xcworkspace
	rm -rf $(IOS_DIR)/Projects/**/*.xcodeproj
	rm -rf $(IOS_DIR)/Projects/**/**/*.xcodeproj
	rm -rf $(IOS_DIR)/.build

# =====================================================================
# TestFlight (Fastlane)
# =====================================================================

.PHONY: beta
beta: generate ## TestFlight 업로드 (App Store Connect API 키 필요)
	cd $(IOS_DIR) && bundle exec fastlane beta
