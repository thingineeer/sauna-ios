# Sauna · GitHub Actions billing 메모

> 작성: 2026-04-28

## 현재 상태

PR #1 의 모든 CI 잡이 다음 메시지로 실패 중:

> The job was not started because recent account payments have failed or your spending limit needs to be increased.

이건 코드 문제가 아니라 **GitHub Actions billing 한도** 때문. SwiftLint 잡을 ubuntu 컨테이너로 옮겼는데도 동일하게 막힘 — private repo 의 Actions 사용량 자체가 차단됨.

## 로컬 검증으로 코드는 green

```
swift test --package-path ios/SaunaPackage   →  72/72 pass
swift test --package-path server             →  18/18 pass
swiftlint lint --strict --config .swiftlint.yml ios/SaunaPackage/Sources server/Sources
                                              →  0 violations / 170 files
```

## 해결 옵션 (사용자 결정 필요)

1. **GitHub 결제 정보 갱신 / spending limit 증액** (가장 빠름)
   - https://github.com/settings/billing
2. **Repo 를 public 으로 전환** (Actions 무료)
   - private 인 이유가 아직 없으면 권장
3. **Self-hosted runner** (장기적, 비용 0)
   - macOS Mini 또는 로컬 머신을 GitHub Actions runner 로 등록
4. **CI 비활성** (임시)
   - workflow 가 트리거되지 않게 paths-ignore 광범위 적용 또는 리포에서 disable

## macOS 잡 비용

- macos-14 = 10x multiplier (분당 0.08$)
- iOS SPM build + test 보통 5-10 분 → 0.4-0.8$ / 회
- 하루 평균 10 PR → 5-8$ / 일 → 150-240$ / 월

권장: PR 마다 자동 실행 대신 **label `ios-ci` 가 붙었을 때만** 실행하도록 게이트.
또는 push 시에만 (PR 마다는 안 함) 실행.
