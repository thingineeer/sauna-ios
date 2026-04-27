# Sauna · Competitive Analysis

> 한·미·일 시장의 "익명 + 휘발성/실시간 채팅" 서비스 분석.
> 핵심 질문: Sauna는 카피캣인가, 빈 시장인가, 누가 죽었고 왜 죽었는가.
>
> 작성일: 2026-04-27

## 1. 한 줄 결론

**Sauna의 정확한 1:1 카피캣은 없다. 그러나 인접 묘지에는 시체가 가득하다.**

"익명 + 영속" 카테고리에서 글로벌 70%+ 사망률이며, 사인은 거의 단일하다 — **모더레이션 실패 → 미성년 피해 → 소송/규제 → 운영 포기**. Sauna의 휘발성 + 다대다 단일방 + 1:1 DM 부재 설계는 *상당수* 함정에서 구조적으로 떨어져 있다. 그러나 *모든* 함정에서 떨어진 것은 아니다.

빈자리는 "아무도 못 본 자리"가 아니라 "시도한 사람들이 함정에서 죽어서 비어 있는 자리"다. 카피캣 검증은 끝났고, 함정 회피 검증은 시작이다.

---

## 2. 4대 사망 함정 (Sauna가 의식해야 할 것)

### 함정 1 · 미성년 + 모더레이션 실패 → 소송/규제

| 사례 | 시점 | 사인 |
|---|---|---|
| Omegle | 2023 사망 | 11세 여아 성착취 소송, **Section 230 면책 패소**(제품책임으로 판단), $22M 청구 + 무한 소송 → 자진 종료 |
| YOLO/LMK | 2021 사망 | Carson Bride(16세) 자살 소송 → Snap이 Snap Kit 정책 변경, 익명 메시징 앱 전면 금지 (수십 개 동반 사망) |
| NGL | 빈사 (2024 합의) | "AI 모더레이션" 거짓 광고 + 가짜 메시지 자동생성 + COPPA 위반 → FTC $5M, 미성년 마케팅 영구 금지 |
| Sendit | 2025 FTC 제소 | NGL과 동일 패턴 |

**Sauna 노출도**: **높음**. 회원가입 없는 모델은 13세 미만 차단이 어렵다. 한국 한정이어도 방통위 자율심의·정보통신망법 적용. iOS 4+ 등급 제출 시 Apple Age Gate 필수.

### 함정 2 · 익명 약속의 거짓 → 데이터 유출

| 사례 | 시점 | 사인 |
|---|---|---|
| Whisper | 2025 사망 | 9억 건 게시물 + 위치 + 미성년 130만 건이 인증 없이 노출된 ElasticSearch 사고 |
| 5channel | 쇠퇴 | 2013 7만4천 카드정보 유출, 2025 도메인 정지 |
| 카카오 오픈채팅 | 2023 과징금 | 사용자 정보 추출/판매로 개인정보위 151억원 과징금 |

**Sauna 노출도**: **중간**. 메시지 휘발이 도와주지만 *서버 로그·IP·디바이스ID*는 결국 남는다.
**대응**: 첫 화면에 "우리는 무엇을 저장하지 않는가" 명시. 신뢰를 자산화.

### 함정 3 · 수익 모델 부재 → 자체 소진

| 사례 | 시점 | 사인 |
|---|---|---|
| 모씨 | 2021 사망 | 한국 익명 글로벌 SNS — **Sauna에 가장 가까운 한국 선례**. 청소년 70% 모더레이션 부담 + 광고 외 BM 부재 → 회사 자진 정리 |
| Houseparty | 2021 사망 | Epic 인수 후 BM 못 만들어 종료 |
| Yik Yak | 2017 1차 폐쇄 | 트래픽 감소 + 모더레이션 비용 폭증 |

**Sauna 노출도**: **높음**. 휘발성 + 방 3개 = 광고 인벤토리 거의 없음. "증기" 컨셉상 광고는 사실상 불가능.
**대응**: BM을 처음부터 설계 필요. 후원/네임드(PRD §7)는 v2+이지만 v1 BM은 미정 → `docs/PRD.md` 보강 필요.

### 함정 4 · 창업자 피로

| 사례 | 시점 | 사인 |
|---|---|---|
| Secret | 2015 사망 (16개월) | 비방·괴롭힘 + 브라질 자살 보도 → CEO Byttow 자진 종료, 투자금 환불 |
| Omegle | 2023 사망 | K-Brooks "정신적·재정적 한계" 종료 선언 |

**Sauna 노출도**: **낮음**. 한국 한정 + 방 3개 + 1:1 DM 없음 = 운영 부담 의도적 축소. **Sauna 설계 결정의 좋은 사이드이펙트.**

---

## 3. 국가별 서비스 분석

### 3.1 미국 — 안티-패턴 백과사전

| 서비스 | 출시 | 상태 | 익명성 | 휘발성 | 방 구조 | 사인 또는 위험 신호 |
|---|---|---|---|---|---|---|
| Yik Yak | 2013 | 빈사 | 완전 | 영속 | 위치기반 5마일 | 인종 협박·총격 협박 → 100여 대학 차단, 2017 1차 폐쇄. 2021 부활했으나 다시 사이버불링 폭증 |
| Whisper | 2012 | **사망 2025** | 닉네임 | 영속 | 게시판 | 9억 건 ElasticSearch 미인증 노출 |
| Secret | 2014 | **사망 2015** | 친구의친구 | 영속 | 관계기반 | CEO 자진 종료 |
| Omegle | 2009 | **사망 2023** | 완전 | 휘발 | 1:1 무작위 | Section 230 패소 |
| NGL/Sendit | 2021 | 빈사 | 완전 | 영속 | DM Q&A | FTC 제재 |
| YOLO/LMK | 2019 | **사망 2021** | 완전 | 영속 | DM Q&A | Bride 소송 → Snap 차단 |
| Sidechat | 2022 | 활성 | .edu 인증 | 영속 | 캠퍼스 | (캠퍼스 시위 모더레이션 압력 받는 중) |
| Honk | 2020 | 회색 | 친구간 | 휘발 | 1:1 | **Sauna에 가장 가까운 컨셉**. 트래픽 부재 |

### 3.2 한국 — 휘발성 부재 시장

| 서비스 | 출시 | 상태 | Sauna와의 거리 |
|---|---|---|---|
| 에브리타임 | 2014 | 활성 (2024 251만 MAU) | 영속 + 학교격리 → 멀음, 단 사용자 풀 일부 겹침 |
| 블라인드 | 2013 | 활성 (한국 대기업 직장인 80%) | 영속 + 회사인증 → P1 페르소나 정면 겹침 |
| 모씨 | 2014 | **사망 2021** | **가장 가까운 한국 선례.** 사인: BM 부재 + 청소년 모더레이션 부담 |
| 카톡 오픈채팅 (Lite) | 2015 (Lite 2024) | 활성, 지배적 | **사실상 직접 경쟁자.** 글로벌 단일방 컨셉 동일. 단 영속 + 카톡 계정 묶임 |
| 네이버 오픈톡 | 2022 | 활성 (2025 KBO 포스트시즌 누적 160만, 메시지 320만 YoY +96%) | **주식방 정면 충돌 후보.** 영속 + 네이버 계정 묶임 + 토픽 파편 |
| 다톡/Soul/즐챗 | 2015~ | 활성 | 1:1 랜덤 — 다른 카테고리. 한국에서 *조건만남 변질*로 단속 반복 → Sauna가 "1:1 DM 없음" 결정한 이유 |
| 씨씨 (CC) | 2024 | 활성 | 신규 대학생 익명 + DM. 학교격리라 충돌 약함 |

→ **휘발성을 핵심으로 내세운 한국 서비스는 사실상 부재.** 모씨 사망 이후 익명 글로벌 SNS 신규 도전이 거의 끊겼다.

### 3.3 일본 — 익명이 디폴트인 시장

| 서비스 | 출시 | 상태 | Sauna와의 거리 |
|---|---|---|---|
| 5channel (구 2ch) | 1999 | 쇠퇴 | 게시판 vs 채팅 — 멀음. 단 익명 약속 신뢰 붕괴는 학습거리 |
| LINE OpenChat | 2019 | 활성 (2023 Live Talk 1만명 음성토크룸 추가) | 카톡 오픈채팅과 동일하게 가까움 |
| Yay! (yay.space) | 2019 | 활성 (누적 800만+) | 익명 + 관심사 써클. 영속 + 친구추가 모델이라 Sauna보다 무거움 |

→ 일본은 익명 자체가 기본 문화라 별도 "익명" 마케팅이 약함. 휘발성 강조 서비스 미발견.

---

## 4. Sauna 설계 결정 → 함정 회피 매핑

| 결정 | 회피 함정 | 회피 강도 |
|---|---|---|
| 닉네임 매일 자정 리셋 | Secret (연속성 익명이 비방 누적) | 중 |
| 메시지 영속 부재 | Whisper (데이터 유출), 모씨 (저장비용) | 강 |
| **1:1 DM 없음** | Omegle/다톡 (미성년 성착취) | 강 — **절대 양보 X** |
| 사진 전송 없음 | 카톡 오픈채팅 N번방 함정 | 강 |
| 방 3개 고정 | Yik Yak (트래픽 폭증 시 모더레이션 한계) | 중 |
| 한국 한정 MVP | NGL/Sendit (FTC 영역 우선 회피) | 강 |

---

## 5. 그래도 남는 4가지 위험 (정직하게)

1. **휘발성이 한국 정보통신망법 사업자 책임을 면제하지 않음.** 신고/차단/로그 최소 3개월 보관 의무 발생. 메시지를 안 저장해도 **신고 메타(누가 누구를 신고)** 와 **접속 로그**는 보관해야 함.
2. **방 3개 고정 = 토픽 다양성 천장.** 모씨처럼 1년 흥하고 정체 가능. 시즌방(PRD §6 SHOULD)이 이 천장을 늦출 수 있음.
3. **닉네임 매일 리셋 = 정체성 누적 불가 = 재방문 동기 약화.** Yay!/Sidechat이 강한 이유는 정체성 누적임. Sauna는 의도적으로 버림 — 양날의 검. P3 같은 페르소나에는 *치료*지만, P5에는 *재방문 동기 약화*.
4. **수익 모델 미해결 (모씨와 동일한 사인 위험).** PRD §6에 BM이 없음. 후원/네임드(§7)는 v2+. v1 BM 부재 시 모씨 사인 그대로.

---

## 6. 출처

### 미국
- [Why Yik Yak Failed — Failory](https://www.failory.com/cemetery/yik-yak)
- [Whisper Accidental Overexposure 900M Users — ITRC](https://www.idtheftcenter.org/post/whisper-accidental-overexposure-exposes-sensitive-information-of-900-million-users/)
- [Secret Shuts Down — TechCrunch](https://techcrunch.com/2015/04/29/psst/)
- [Omegle shuts down after 14 years — NPR](https://www.npr.org/2023/11/09/1211807851/omegle-shut-down-leif-k-brooks)
- [FTC Order Against NGL Labs](https://www.ftc.gov/news-events/news/press-releases/2024/07/ftc-order-will-ban-ngl-labs-its-founders-offering-anonymous-messaging-apps-kids-under-18-halt)
- [Sendit FTC complaint — TechCrunch](https://techcrunch.com/2025/09/30/anonymous-question-app-sendit-deceived-children-and-illegally-collected-their-data-ftc-alleges/)
- [Snap suspends YOLO and LMK — Engadget](https://www.engadget.com/snapchat-yolo-lmk-suspended-lawsuit-155401305.html)
- [Sidechat — Wikipedia](https://en.wikipedia.org/wiki/Sidechat)
- [Honk — TechCrunch](https://techcrunch.com/2020/12/23/honk-introduces-a-real-time-ephemeral-messaging-app-aimed-at-gen-z/)

### 한국
- [에브리타임 — 나무위키](https://namu.wiki/w/%EC%97%90%EB%B8%8C%EB%A6%AC%ED%83%80%EC%9E%84)
- [블라인드 — 나무위키](https://namu.wiki/w/%EB%B8%94%EB%9D%BC%EC%9D%B8%EB%93%9C(%EC%95%A0%ED%94%8C%EB%A6%AC%EC%BC%80%EC%9D%B4%EC%85%98))
- [모씨 — 나무위키](https://namu.wiki/w/%EB%AA%A8%EC%94%A8) / [500만 다운로드 후 사라진 모씨 — 머니투데이방송](https://news.mtn.co.kr/news-detail/2023071116110626644)
- [카카오톡 오픈채팅 — Kakao](https://www.kakaocorp.com/page/detail/10811)
- [네이버 오픈톡 야구 사용량 — 네이트 뉴스](https://m.news.nate.com/view/20251116n10914)
- [네이버페이 증권 종목토론실 — 나무위키](https://namu.wiki/w/%EB%84%A4%EC%9D%B4%EB%B2%84%ED%8E%98%EC%9D%B4%20%EC%A6%9D%EA%B6%8C/%EC%A2%85%EB%AA%A9%ED%86%A0%EB%A1%A0%EC%8B%A4)

### 일본
- [2channel — Wikipedia](https://en.wikipedia.org/wiki/2channel)
- [LINE OpenChat](https://openchat.line.me/) / [Live Talk — LINE Corp](https://www.linecorp.com/en/pr/news/global/2023/131)
- [Yay! Founder Spotlight — Headline Asia](https://headline.com/asia/en-us/post/founder-spotlight-of-nanameue-yay-takahiro-ishihama)
