// =============================================================
// Jjimjilbang (황토방) 톤 토큰 + 베이스 컴포넌트
// 사진 레퍼런스: 황토 벽돌 + 마룻바닥 + 양머리수건
// =============================================================

const JJIM = {
  // 황토 (red clay) 팔레트
  clay: {
    deep:   '#3a1810',  // 가장 깊은 그늘
    dark:   '#5a2c14',  // 벽 그늘
    mid:    '#8a4820',  // 황토 본색
    base:   '#B86A40',  // 황토 벽돌 면
    light:  '#C8784a',  // 벽돌 하이라이트
    glow:   '#FFB070',  // 가마 안쪽 빛
    bright: '#FFD68A',  // 가마 핵심 빛
  },
  // 마룻바닥 (wooden floor)
  floor: {
    dark:  '#5a3a18',
    mid:   '#8c6238',
    light: '#9c7048',
  },
  // 텍스트 (다크 배경 위)
  text: {
    primary:   '#FFE8C8',
    secondary: 'rgba(255,220,180,0.78)',
    tertiary:  'rgba(255,220,180,0.6)',
    muted:     'rgba(255,220,180,0.42)',
    dim:       'rgba(255,220,180,0.28)',
  },
  // 액센트
  accent: {
    primary: '#FF9050',   // 가장 강한 (CTA)
    warm:    '#FFB060',   // 따뜻한 액센트
    soft:    '#FFD4A0',   // 부드러운 텍스트 액센트
    deep:    '#C95830',   // gradient end
  },
  // 표면
  surface: {
    panel:           'rgba(40,15,5,0.72)',
    panelStrong:     'rgba(40,15,5,0.88)',
    panelLight:      'rgba(40,15,5,0.45)',
    hairline:        'rgba(255,180,120,0.28)',
    hairlineStrong:  'rgba(255,180,120,0.42)',
    card:            'linear-gradient(180deg, rgba(80,40,18,0.65) 0%, rgba(40,18,8,0.85) 100%)',
  },
};

// 황토 벽돌 패턴 (벽 전체)
const CLAY_BG = `
  linear-gradient(180deg, rgba(80,30,12,0.65) 0%, transparent 18%, transparent 65%, rgba(40,18,5,0.6) 100%),
  repeating-linear-gradient(0deg,
    #B86A40 0px, #B86A40 28px,
    #6a3818 28px, #6a3818 30px,
    #C8784a 30px, #C8784a 58px,
    #6a3818 58px, #6a3818 60px),
  repeating-linear-gradient(90deg,
    rgba(0,0,0,0) 0px, rgba(0,0,0,0) 56px,
    rgba(60,28,10,0.7) 56px, rgba(60,28,10,0.7) 58px)`;

// 천장 황토 가마 글로우
const CLAY_GLOW = `
  radial-gradient(ellipse 90% 35% at 50% -5%, rgba(255,150,80,0.5), transparent 70%),
  radial-gradient(ellipse 100% 40% at 50% 100%, rgba(255,140,60,0.18), transparent 60%)`;

// 마룻바닥 (한국 찜질방의 짙은 갈색 마루)
const FLOOR_BG = `
  linear-gradient(180deg, transparent 0%, rgba(40,18,5,0.4) 70%),
  repeating-linear-gradient(90deg,
    #8c6238 0px, #8c6238 14px,
    #5a3a18 14px, #5a3a18 16px,
    #9c7048 16px, #9c7048 30px,
    #5a3a18 30px, #5a3a18 32px)`;

// 어두운 톤 (홈/설정 화면 배경 — 벽 아닌 사우나 로비 느낌)
const ROOM_BG = `
  linear-gradient(180deg, #2a1408 0%, #1a0a04 100%),
  repeating-linear-gradient(90deg,
    #3a1e0c 0px, #4a2612 1px, #2a1408 2px, #2a1408 3px)`;

// =============================================================
// 황토 가마 등 (덕트형 작은 등) — 우상단 데코
// =============================================================
function ClayLamp({ top = 130, right = 22, size = 1 }) {
  const w = 32 * size, h = 38 * size;
  return (
    <div style={{
      position:'absolute', top, right, zIndex: 5,
      width: w, height: h, borderRadius: '50% 50% 8px 8px',
      background:'radial-gradient(ellipse at 50% 70%, #FFD68A 0%, #FF9050 40%, #C95830 80%, #5a2010 100%)',
      boxShadow:'0 0 24px rgba(255,160,80,0.55)',
      border:'1px solid rgba(80,30,10,0.6)',
    }}/>
  );
}

// =============================================================
// 마룻바닥 (화면 하단)
// =============================================================
function ClayFloor({ height = 140, zIndex = 4 }) {
  return (
    <div style={{
      position:'absolute', bottom: 0, left: 0, right: 0,
      height, zIndex,
      background: FLOOR_BG,
      boxShadow:'inset 0 8px 16px rgba(0,0,0,0.5)',
      pointerEvents: 'none',
    }}/>
  );
}

// =============================================================
// 황토 벽 + 천장 글로우 (사우나실 내부 베이스)
// =============================================================
function ClayWall({ children, glowOnly = false }) {
  return (
    <div style={{
      position:'absolute', inset: 0, overflow: 'hidden',
      background: glowOnly ? ROOM_BG : CLAY_BG,
      fontFamily: "'Noto Sans KR', -apple-system, sans-serif",
      color: JJIM.text.primary,
    }}>
      {/* 천장/바닥 글로우 */}
      <div style={{position:'absolute', inset:0, zIndex:1, pointerEvents:'none',
        background: CLAY_GLOW}}/>
      {children}
    </div>
  );
}

// =============================================================
// MonoTag — 작은 모노 라벨
// =============================================================
function JjimMonoTag({ children, color = JJIM.accent.warm, dotted = false }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap: 6,
    }}>
      {dotted && <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: color, boxShadow: `0 0 6px ${color}`,
      }}/>}
      <span className="mono" style={{
        fontSize: 10, color, letterSpacing: 2.5, fontWeight: 700,
      }}>{children}</span>
    </div>
  );
}

// =============================================================
// 황토 버튼 (CTA)
// =============================================================
function ClayButton({
  children, primary = true, iconLeft, onClick, disabled,
  style = {}, fullWidth = true,
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        height: 52,
        width: fullWidth ? '100%' : 'auto',
        padding: fullWidth ? '0 16px' : '0 22px',
        borderRadius: 14, border: 'none',
        background: disabled
          ? 'rgba(60,30,15,0.5)'
          : primary
            ? 'linear-gradient(180deg, #FFB060 0%, #C95830 100%)'
            : 'rgba(40,15,5,0.65)',
        color: primary ? '#2a1000' : JJIM.text.primary,
        fontSize: 15, fontWeight: 700,
        fontFamily: "'Noto Sans KR', sans-serif",
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: primary && !disabled
          ? '0 6px 18px rgba(255,140,60,0.35), inset 0 1px 0 rgba(255,255,255,0.25)'
          : 'inset 0 1px 0 rgba(255,180,110,0.12)',
        outline: !primary ? `1px solid ${JJIM.surface.hairline}` : 'none',
        outlineOffset: -1,
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}>
      {iconLeft}
      {children}
    </button>
  );
}

// =============================================================
// Header (뒤로가기 + 타이틀)
// =============================================================
function JjimHeader({ title, subtitle, leadingBack = true, trailing }) {
  return (
    <div style={{
      position:'absolute', top: 0, left: 0, right: 0, zIndex: 20,
      paddingTop: 56, paddingLeft: 16, paddingRight: 16, paddingBottom: 12,
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      {leadingBack && (
        <button style={{
          width: 36, height: 36, borderRadius: 10, border: 'none',
          background: JJIM.surface.panel,
          outline: `1px solid ${JJIM.surface.hairline}`, outlineOffset: -1,
          color: JJIM.text.primary, cursor: 'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          backdropFilter:'blur(6px)', fontSize: 20, lineHeight: 1,
          paddingBottom: 2,
        }}>‹</button>
      )}
      <div style={{flex: 1, minWidth: 0, paddingTop: 2}}>
        {subtitle && (
          <JjimMonoTag color={JJIM.accent.warm}>{subtitle}</JjimMonoTag>
        )}
        <div style={{
          marginTop: subtitle ? 4 : 0,
          fontSize: 22, fontWeight: 800, letterSpacing: -0.5,
          color: JJIM.text.primary,
          textShadow: '0 2px 6px rgba(0,0,0,0.55)',
        }}>{title}</div>
      </div>
      {trailing}
    </div>
  );
}

Object.assign(window, {
  JJIM, CLAY_BG, CLAY_GLOW, FLOOR_BG, ROOM_BG,
  ClayLamp, ClayFloor, ClayWall,
  JjimMonoTag, ClayButton, JjimHeader,
});
