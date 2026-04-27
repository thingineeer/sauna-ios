# Sauna · Design System

> Source: `design-handoff/lib/tokens.jsx` + `sauna-ds.jsx` + `sauna-app.html`
> 작성일: 2026-04-24

## 1. 톤 앤 매너

- 원목 사우나실 무드
- 다크 배경 (deep black-brown) · 히트 액센트 (amber/orange)
- 이모지 금지 · 전부 커스텀 SVG
- 모션은 느긋하고 은근하게 (증기처럼)

## 2. 컬러 토큰

(sauna-app.html의 DesignSystemSheet 기준)

| 이름 | 값 | 용도 |
|---|---|---|
| `heat-500` | `#FF8A3B` | 가장 강한 액센트 (CTA) |
| `heat-400` | `#FFB060` | 기본 액센트 |
| `heat-300` | `#FFC870` | 부드러운 액센트 |
| `cream` | `#FFE8C8` | 본문 텍스트 (다크 배경) |
| `wood` | `linear-gradient(135deg, #C08A55, #8a3e14)` | 원목 표면 |
| `deep` | `#0f0602` | 배경 가장 깊은 톤 |
| `deep-2` | `#1a0804` | 배경 한 단계 밝은 톤 |
| `surface-warm` | `rgba(20,8,2,0.6)` | 카드/칩 배경 |
| `border-warm` | `rgba(255,180,110,0.2)` | 카드 테두리 |
| `text-dim` | `rgba(255,220,180,0.6)` | 부 텍스트 |
| `text-body` | `rgba(40,30,20,0.85)` | 라이트 배경 본문 |

SwiftUI 매핑 예:

```swift
public extension Color {
    static let saunaHeat500 = Color(red: 1.00, green: 0.54, blue: 0.23)
    static let saunaHeat400 = Color(red: 1.00, green: 0.69, blue: 0.38)
    static let saunaHeat300 = Color(red: 1.00, green: 0.78, blue: 0.44)
    static let saunaCream   = Color(red: 1.00, green: 0.91, blue: 0.78)
    static let saunaDeep    = Color(red: 0.06, green: 0.02, blue: 0.01)
}
```

## 3. 타이포그래피

| 이름 | 폰트 | 용도 |
|---|---|---|
| `display` | Space Grotesk | 큰 제목 · 로고 |
| `body-kr` | Noto Sans KR | 한글 본문 |
| `mono` | JetBrains Mono | 수치/라벨 (mono-space) |
| `system` | -apple-system | fallback |

크기/무게는 sauna-app.html 인라인 참고:
- 메인 제목: 22pt bold (`letterSpacing: -0.4`)
- 섹션 레이블: 10pt mono `letterSpacing: 2.5`
- 본문: 12–13pt, line-height 1.55–1.7
- 아이콘 하단 라벨: 9pt mono

## 4. 아이콘 세트 (24종)

전부 **1.6px stroke · round cap/join · currentColor 상속**. SwiftUI Shape 또는 `Path` 로 구현.

| 이름 | 용도 |
|---|---|
| `IcSaunaMark` | 로고/브랜드 |
| `IcDaily` | 일상 방 |
| `IcStock` | 주식 방 |
| `IcJob` | 취준 방 |
| `IcWorldCup` | 시즌 방 |
| `IcMedal` | (미사용 후보) |
| `IcSteam` | 증기 모티프 |
| `IcWaves` | 물결 모티프 |
| `IcLeaf` | 자연 |
| `IcDoor` | 나가기 |
| `IcPerson` | 프로필 |
| `IcGear` | 설정 |
| `IcClock` | 시간 |
| `IcRefresh` | 새로고침 · 닉네임 재생성 |
| `IcDice` | 랜덤 |
| `IcBell` | 알림 |
| `IcMoon` | 다크 모드 |
| `IcVibrate` | 햅틱 |
| `IcContrast` | 명도 대비 |
| `IcMotion` | 모션 ON/OFF |
| `IcType` | 폰트 크기 |
| `IcTrash` | 삭제 (차단 해제 등) |
| `IcInfo` | 정보 |
| `IcArrowLeft` | 뒤로 |
| `IcArrowUpRight` | 외부 링크 |
| `IcChevron` | 리스트 꺾쇠 |
| `IcHeart` | 후원 (v2) |
| `AnonAvatar` | 익명 아바타 (프로필 자리표시) |

구현은 `CustomIcons` 모듈. 크기는 `size: CGFloat = 24` 기본.

## 5. 프리미티브 / 레이아웃

### Artboard 기준 치수
- 폰 아트보드: **413 × 874** (iPhone 15 Pro 대응 근삿값)
- 가로 여백: 대체로 20pt
- 카드 라운드: 12pt (섹션), 10pt (작은 칩)

### 주요 컴포넌트 (SharedUI 모듈 후보)
- `SaunaPhone` — 폰 프레임 + 상태바 위치 컨트롤
- `SteamBubble` — 증기 말풍선 (바닥 → 천장 애니메이션)
- `RoomCard` — 홈 3개 방 카드
- `TabBar` — 하단 탭 (Home / Me)
- `OccupancyMeter` — 현재 실시간 인원 밀도 표시

## 6. 모션 가이드

- 증기 말풍선: 바닥에서 부유하며 올라옴, 천장 근처에서 fade-out
- 방 진입: 문 열림 + 증기 확산 (v2 목표)
- 키보드 ON: 하단에서 시트처럼 스프링 애니메이션
- Splash: 로고 1.5s fade-in

**환경 설정에서 "모션 줄이기" 옵션 필수** (접근성).

## 7. 접근성

- Dynamic Type 지원 (커스텀 폰트여도 scale)
- VoiceOver: 아이콘에 `accessibilityLabel` 필수
- 컨트라스트: 본문 텍스트 vs 배경은 WCAG AA 이상 유지
- 햅틱 ON/OFF (설정)
- 모션 ON/OFF (설정)

## 8. 다크 모드만 제공?

sauna-app.html은 다크 톤 중심. v1은 **다크 모드 only**. 라이트 모드는 v2+ (or 검토 후 포기).

## 9. 참고

- `design-handoff/lib/sauna-ds.jsx` — 아이콘 컴포넌트 전체 소스
- `design-handoff/lib/tokens.jsx` — 색상/간격 토큰 원본
- `design-handoff/sauna-app.html` — 정본 플로우
