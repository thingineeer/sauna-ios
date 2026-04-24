# Sauna · Tech Stack

> 선정 근거와 대안 비교
> 작성일: 2026-04-24

## 요약

| 레이어 | 선정 | 근거 |
|---|---|---|
| 언어 | Swift 6 | 최신 concurrency · Sendable 안정 |
| 최소 버전 | iOS 17+ | Observable macro · SwiftUI 성숙 |
| UI | SwiftUI + 부분 UIKit | 메인은 SwiftUI, 증기 애니메이션은 UIKit/CAEmitter 검토 |
| 비동기 | Swift Concurrency (async/await) | 공식 표준, GCD/Combine 최소화 |
| 네트워크 | Alamofire 5.x | 인터셉터·재시도 생태계 성숙 / URLSession wrapper |
| 실시간 | Firebase Realtime DB or Supabase Realtime | MVP 빠른 구축 · pub/sub 기본 내장 |
| 로컬 저장 | SwiftData | iOS 17 기본. 메시지 히스토리 저장 안 하므로 최소만 |
| 의존성 관리 | SPM (Swift Package Manager) | 공식, Xcode 통합, CocoaPods 회피 |
| 모듈화 | Tuist 또는 SPM multi-target | 아키텍처 문서 참조 |
| 로깅 | OSLog (os_log) | 공식 표준, Console.app 통합 |
| 분석 | Firebase Analytics | 무료 · Crashlytics와 세트 |
| 에러 추적 | Firebase Crashlytics | 무료 · 세팅 쉬움 |
| 배포 | Fastlane + TestFlight | 회사/개인 모두 이미 사용 중 |

## Alamofire vs URLSession

사용자 요청상 **Alamofire 같은 라이브러리** 지정됨. 두 방향 다 열어둠:

### Alamofire 선택 시
- 인터셉터 체인 (인증 토큰 refresh 등)
- Retry policy 내장
- Multipart / Download progress 편함
- 생태계 예제 많음

### URLSession + Swift Concurrency 선택 시
- 외부 의존성 zero
- `URLSession.shared.data(for:)` 가 이미 async
- 인터셉터는 `URLProtocol` 또는 커스텀 Client에서 구현
- 최근 트렌드 (공식 권장 방향)

**1차 결정: Alamofire 사용** (요청 준수). 단, 추상화는 `NetworkClient` 프로토콜 뒤에 둬서 교체 용이하게.

## 실시간 백엔드 비교

| | Firebase RTDB | Supabase Realtime | Pusher / Ably | 자체 WebSocket |
|---|---|---|---|---|
| 초기 구축 | ★★★★★ | ★★★★ | ★★★ | ★ |
| 가격 (MVP) | 무료 tier 충분 | 무료 tier 충분 | 유료 위주 | 서버 비용 |
| SwiftUI 궁합 | 중 | 중 | 중 | 자유 |
| 확장성 | 중 | 상 | 상 | 최상 |
| 락인 | Google | Postgres 기반 | 있음 | 없음 |

**1차 결정: Firebase Realtime Database** — 메시지 휘발성이라 RTDB의 write-heavy / short-TTL 패턴이 잘 맞음. Crashlytics/Analytics와도 한 번에.

## 로컬 저장 범위

메시지는 절대 저장 X. 대신:
- 오늘의 닉네임 (자정 변경)
- 설정 (알림, 다크, 햅틱)
- 차단 목록 (userId 해시)
- 온보딩 완료 플래그

UserDefaults로 충분하지만 타입 안전성 위해 SwiftData 최소 모델.

## 의존성 (1차 안)

```swift
// Package.swift 예시
dependencies: [
    .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.9.0"),
    .package(url: "https://github.com/firebase/firebase-ios-sdk.git", from: "11.0.0"),
    .package(url: "https://github.com/kishikawakatsumi/KeychainAccess.git", from: "4.2.0"),
]
```

## 개발 도구

- Xcode 16.x
- SwiftLint (규칙 문서화 예정)
- SwiftFormat
- Fastlane (이미 사용 중)

## 테스트

- XCTest (기본)
- ViewInspector (SwiftUI view 단위 테스트)
- 스냅샷 테스트는 v2 이후 (MVP 속도 우선)
