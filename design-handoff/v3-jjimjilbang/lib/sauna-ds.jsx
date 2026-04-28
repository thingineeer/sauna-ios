// ============================================================
// Sauna Design System
// ------------------------------------------------------------
// Single source of truth for:
//  · Color tokens (wood, heat, text, room accents)
//  · Type scale
//  · SVG icon set — NO emoji anywhere in the app
//  · Shared primitives (Button, MonoTag, Divider)
// ============================================================

// ---- Tokens ------------------------------------------------
const SAUNA = {
  wood: {
    plank: `
      linear-gradient(180deg, rgba(50,25,10,0.35) 0%, transparent 14%, transparent 86%, rgba(30,14,4,0.45) 100%),
      repeating-linear-gradient(90deg,
        #C08A55 0px, #C89362 8px, #B47A47 9px, #B47A47 10px,
        #C89362 11px, #BE8858 24px, #A87140 25px, #A87140 26px,
        #BE8858 27px, #C08A55 40px)`,
    dark: `
      linear-gradient(180deg, #2a1208 0%, #1a0804 100%),
      repeating-linear-gradient(90deg,
        #3a1e0c 0px, #4a2612 1px, #2a1408 2px, #2a1408 3px)`,
    deep: '#0f0602',
  },
  glow: `
    radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,180,90,0.28), transparent 70%),
    radial-gradient(ellipse 50% 30% at 20% 100%, rgba(255,140,60,0.18), transparent 70%),
    radial-gradient(ellipse 50% 30% at 80% 100%, rgba(255,140,60,0.16), transparent 70%)`,
  heat: {
    100: '#FFE8C8',   // primary text (cream)
    200: '#FFD490',   // highlighted
    300: '#FFC870',   // accent link
    400: '#FFB060',   // primary start
    500: '#FF8A3B',   // live dot
    600: '#E87020',   // primary end
    700: '#8a3e14',
  },
  text: {
    primary:   '#FFE8C8',
    secondary: 'rgba(255,220,180,0.72)',
    tertiary:  'rgba(255,220,180,0.55)',
    muted:     'rgba(255,220,180,0.38)',
    dim:       'rgba(255,220,180,0.25)',
  },
  surface: {
    card: 'linear-gradient(180deg, rgba(80,42,16,0.7) 0%, rgba(30,14,4,0.85) 100%)',
    panel: 'rgba(20,8,2,0.55)',
    panelLight: 'rgba(20,8,2,0.35)',
    hairline: 'rgba(255,180,110,0.2)',
    hairlineStrong: 'rgba(255,200,140,0.35)',
  },
  room: {
    daily: { accent: '#8FD19E', bg: 'rgba(140,210,160,0.15)', tag: 'DAILY', label: '일상' },
    stock: { accent: '#FF9A55', bg: 'rgba(255,150,80,0.15)',  tag: 'STOCK', label: '주식' },
    job:   { accent: '#A8C5F0', bg: 'rgba(160,190,240,0.15)', tag: 'JOB',   label: '취준' },
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 },
};

// ---- Icon system -------------------------------------------
// All icons are stroke-based line icons on a 24-unit grid.
// size controls pixel size; color inherits via currentColor.
function SIcon({ children, size = 22, color = 'currentColor', stroke = 1.6, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round"
      style={{display: 'block', ...style}}>
      {children}
    </svg>
  );
}

// ===== Brand ================================================
// Abstract sauna mark: a bench with rising heat waves inside a
// rounded enclosure. No face, no figure.
function IcSaunaMark({ size = 56, color = '#2a1000' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
      stroke={color} strokeLinecap="round" strokeLinejoin="round">
      {/* enclosure */}
      <rect x="7" y="9" width="34" height="30" rx="4" strokeWidth="2.2"/>
      {/* bench */}
      <line x1="11" y1="31" x2="37" y2="31" strokeWidth="2"/>
      <line x1="14" y1="35" x2="34" y2="35" strokeWidth="2"/>
      {/* heat waves */}
      <path d="M16 22c0-2 2-2 2-4s-2-2-2-4" strokeWidth="1.8"/>
      <path d="M24 22c0-2 2-2 2-4s-2-2-2-4" strokeWidth="1.8"/>
      <path d="M32 22c0-2 2-2 2-4s-2-2-2-4" strokeWidth="1.8"/>
    </svg>
  );
}

// ===== Room icons ==========================================
// Replaces 🌿(daily) 🔥(stock) 🪵(job)

// DAILY — three pebbles stacked (calm)
function IcDaily({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <ellipse cx="12" cy="18.5" rx="8" ry="2.5"/>
      <ellipse cx="11" cy="13" rx="6" ry="2.2"/>
      <ellipse cx="13" cy="8" rx="4" ry="2"/>
    </SIcon>
  );
}
// STOCK — candlestick (bar chart, no fire emoji)
function IcStock({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <line x1="7"  y1="4"  x2="7"  y2="20"/>
      <rect x="4.5" y="8"  width="5" height="8" rx="0.5"/>
      <line x1="17" y1="5"  x2="17" y2="19"/>
      <rect x="14.5" y="10" width="5" height="6" rx="0.5"/>
    </SIcon>
  );
}
// JOB — folded paper / document
function IcJob({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <path d="M7 3h8l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>
      <path d="M15 3v4h4"/>
      <line x1="9" y1="13" x2="16" y2="13"/>
      <line x1="9" y1="17" x2="14" y2="17"/>
    </SIcon>
  );
}
// WORLDCUP — ball (pentagon-ish)
function IcWorldCup({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <circle cx="12" cy="12" r="8"/>
      <polygon points="12,8 15,10 14,14 10,14 9,10"/>
      <line x1="12" y1="4" x2="12" y2="8"/>
      <line x1="15" y1="10" x2="19" y2="9"/>
      <line x1="14" y1="14" x2="17" y2="17"/>
      <line x1="10" y1="14" x2="7" y2="17"/>
      <line x1="9" y1="10" x2="5" y2="9"/>
    </SIcon>
  );
}
// OLYMPICS — medal
function IcMedal({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <path d="M8 3l-2 6 6 4 6-4-2-6"/>
      <path d="M8 3h8"/>
      <circle cx="12" cy="16" r="5"/>
    </SIcon>
  );
}

// ===== Steam / presence ====================================
function IcSteam({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <path d="M7 19c0-2 2-2 2-4s-2-2-2-4"/>
      <path d="M12 21c0-2 2-2 2-4s-2-2-2-4 2-2 2-4"/>
      <path d="M17 19c0-2 2-2 2-4s-2-2-2-4"/>
    </SIcon>
  );
}
function IcWaves({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>
      <path d="M3 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>
      <path d="M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>
    </SIcon>
  );
}
function IcLeaf({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <path d="M20 4c-9 0-14 5-14 11 0 3 2 5 5 5 6 0 11-5 11-14v-2z"/>
      <path d="M6 20c2-4 6-8 12-12"/>
    </SIcon>
  );
}

// ===== Nav / tab ===========================================
function IcDoor({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <rect x="6" y="3" width="12" height="18" rx="1"/>
      <line x1="14.5" y1="12" x2="14.5" y2="13.2"/>
    </SIcon>
  );
}
function IcPerson({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
    </SIcon>
  );
}
function IcGear({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>
    </SIcon>
  );
}

// ===== Utility =============================================
function IcClock({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <circle cx="12" cy="12" r="8.5"/>
      <path d="M12 7v5l3 2"/>
    </SIcon>
  );
}
function IcRefresh({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <path d="M4 12a8 8 0 0 1 14-5"/>
      <path d="M18 3v5h-5"/>
      <path d="M20 12a8 8 0 0 1-14 5"/>
      <path d="M6 21v-5h5"/>
    </SIcon>
  );
}
function IcDice({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <rect x="4" y="4" width="16" height="16" rx="3"/>
      <circle cx="8.5" cy="8.5" r="1" fill={color} stroke="none"/>
      <circle cx="15.5" cy="8.5" r="1" fill={color} stroke="none"/>
      <circle cx="12" cy="12" r="1" fill={color} stroke="none"/>
      <circle cx="8.5" cy="15.5" r="1" fill={color} stroke="none"/>
      <circle cx="15.5" cy="15.5" r="1" fill={color} stroke="none"/>
    </SIcon>
  );
}
function IcBell({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2z"/>
      <path d="M10 20a2 2 0 0 0 4 0"/>
    </SIcon>
  );
}
function IcMoon({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>
    </SIcon>
  );
}
function IcVibrate({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <rect x="8" y="6" width="8" height="12" rx="1.5"/>
      <path d="M4 10v4M20 10v4"/>
    </SIcon>
  );
}
function IcContrast({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <circle cx="12" cy="12" r="8.5"/>
      <path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill={color} stroke="none"/>
    </SIcon>
  );
}
function IcMotion({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <circle cx="12" cy="12" r="8.5"/>
      <path d="M7 14c2-3 4-3 5 0s3 3 5 0"/>
    </SIcon>
  );
}
function IcType({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <path d="M5 6h14M8 6v13M16 6v13M11 19h6"/>
    </SIcon>
  );
}
function IcTrash({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <path d="M4 7h16"/>
      <path d="M9 7V4h6v3"/>
      <path d="M6 7l1 13h10l1-13"/>
      <path d="M10 11v6M14 11v6"/>
    </SIcon>
  );
}
function IcInfo({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <circle cx="12" cy="12" r="8.5"/>
      <path d="M12 11v5M12 7.8v.2"/>
    </SIcon>
  );
}
function IcArrowLeft({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <path d="M15 4l-8 8 8 8"/>
    </SIcon>
  );
}
function IcArrowUpRight({ size = 22, color = 'currentColor' }) {
  return (
    <SIcon size={size} color={color}>
      <path d="M7 17L17 7"/>
      <path d="M8 7h9v9"/>
    </SIcon>
  );
}
function IcChevron({ size = 22, color = 'currentColor', dir = 'right' }) {
  const d = { right: 'M9 6l6 6-6 6', left: 'M15 6l-6 6 6 6' }[dir];
  return (
    <SIcon size={size} color={color}>
      <path d={d}/>
    </SIcon>
  );
}
function IcHeart({ size = 22, color = 'currentColor', filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color} strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round"
      style={{display: 'block'}}>
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
    </svg>
  );
}

// ===== Avatar (used instead of 🦊) =========================
// Soft anonymous mask — hood silhouette with two eye dots.
function AnonAvatar({ size = 44, accent = '#FFB060' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size/2,
      background: `linear-gradient(180deg, rgba(255,180,110,0.35), rgba(120,60,20,0.55))`,
      border: '1px solid rgba(255,200,140,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none"
        stroke={accent} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        {/* hooded head */}
        <path d="M6 13c0-4 2.7-7 6-7s6 3 6 7v4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4z"/>
        <circle cx="10" cy="13" r="0.7" fill={accent}/>
        <circle cx="14" cy="13" r="0.7" fill={accent}/>
      </svg>
    </div>
  );
}

// ===== Primitives ==========================================
function MonoTag({ children, color = SAUNA.heat[400], style }) {
  return (
    <div className="mono" style={{
      fontSize: 10, color, letterSpacing: 2.5, fontWeight: 600,
      ...style,
    }}>{children}</div>
  );
}

function DoorButton({ children, primary = true, onClick, style, iconLeft }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', height: 52, borderRadius: 14, border: 'none',
      background: primary
        ? 'linear-gradient(180deg, #FFB060 0%, #E87020 100%)'
        : 'rgba(255,220,180,0.08)',
      color: primary ? '#2a1000' : SAUNA.text.primary,
      cursor: 'pointer',
      fontWeight: primary ? 800 : 600, fontSize: 15, letterSpacing: 0.3,
      boxShadow: primary
        ? '0 6px 18px rgba(255,120,40,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
        : '0 0 0 1px rgba(255,180,110,0.2)',
      fontFamily: "'Noto Sans KR', sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...style,
    }}>
      {iconLeft}
      {children}
    </button>
  );
}

// Export everything
Object.assign(window, {
  SAUNA,
  SIcon,
  // Brand
  IcSaunaMark, AnonAvatar,
  // Rooms
  IcDaily, IcStock, IcJob, IcWorldCup, IcMedal,
  // Steam
  IcSteam, IcWaves, IcLeaf,
  // Nav
  IcDoor, IcPerson, IcGear,
  // Utility
  IcClock, IcRefresh, IcDice, IcBell, IcMoon, IcVibrate,
  IcContrast, IcMotion, IcType, IcTrash, IcInfo,
  IcArrowLeft, IcArrowUpRight, IcChevron, IcHeart,
  // Primitives
  MonoTag, DoorButton,
});
