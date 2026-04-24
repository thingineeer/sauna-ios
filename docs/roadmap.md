# Sauna · Roadmap

> 작성일: 2026-04-24
> 절대 일정 X · 의존성과 순서 위주

## Phase 0 · Setup (이 레포 · 지금)
- [x] 디자인 핸드오프 수령 (sauna-app.html)
- [x] 레포 구조/문서 스켈레톤
- [x] Git + GitHub private 레포
- [ ] Xcode 프로젝트 생성 (집 PC)
- [ ] SPM 모듈 초기화

## Phase 1 · Foundation (구현 Sprint 1)
- [ ] DesignSystem 모듈: 색/폰트/Spacing 토큰
- [ ] CustomIcons 모듈: 24종 SVG → SwiftUI Path
- [ ] SharedUI 모듈: SaunaPhone frame, TabBar
- [ ] NetworkCore (Alamofire wrapper) 뼈대
- [ ] Firebase 프로젝트 생성 + Bundle ID 연결
- [ ] Splash + Onboarding 1/2/3

## Phase 2 · Home (Sprint 2)
- [ ] RoomCard 컴포넌트
- [ ] Home 3 시나리오 (morning/evening/night) 정적 구현
- [ ] 방 입장 전환 (Enter 화면)
- [ ] Firebase RTDB 방 카운트 연동

## Phase 3 · Room 핵심 (Sprint 3)
- [ ] SteamBubble 컴포넌트 + 애니메이션
- [ ] Room 3방 (daily/stock/job) 실시간 연동
- [ ] 키보드 ON 입력 화면
- [ ] 메시지 전송 (rate limit 포함)
- [ ] 도배/비속어 기본 필터

## Phase 4 · Me & Settings (Sprint 4)
- [ ] Profile 화면 (세션 메타)
- [ ] Settings (알림/햅틱/모션/폰트)
- [ ] 알림 프리뷰
- [ ] 차단 목록

## Phase 5 · Polish (Sprint 5)
- [ ] 방 진입 트랜지션 (문 열림 · 증기 확산)
- [ ] Empty state, 네트워크 오프라인
- [ ] 접근성 (VoiceOver, Dynamic Type)
- [ ] 성능 (60fps 증기 애니메이션 체크)
- [ ] 번역/로케일 (v1은 한국어만)

## Phase 6 · Launch
- [ ] App Store Connect 메타/스크린샷
- [ ] TestFlight 내부 → 외부
- [ ] 심사 제출

## 추후 (v2+)
- [ ] Android (Kotlin · Jetpack Compose)
- [ ] 시즌 방 admin 플로우
- [ ] NPC 자동 발화
- [ ] 후원/네임드 기획 검토
