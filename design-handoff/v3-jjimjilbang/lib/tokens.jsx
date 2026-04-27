// Design tokens — DESIGN-HANDOFF.md §④
const TOKENS = {
  bg: { base: '#0A0A0F', elevated: '#14141B' },
  glass: {
    rest: 'rgba(220, 220, 235, 0.08)',
    active: 'rgba(220, 220, 235, 0.14)',
    border: 'rgba(255, 255, 255, 0.08)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255,255,255,0.62)',
    tertiary: 'rgba(255,255,255,0.38)',
    placeholder: 'rgba(255,255,255,0.30)',
    danger: '#FF4D6D',
  },
  rooms: {
    daily: { accent: '#00FFB3', name: '일상', placeholder: '지금 뭐해?',     kor: '일상',  en: 'DAILY' },
    stock: { accent: '#FFD60A', name: '주식', placeholder: '지금 장 어때?', kor: '주식',  en: 'STOCK' },
    job:   { accent: '#5B9BFF', name: '취준', placeholder: '뭐 준비 중?',   kor: '취준',  en: 'JOB'   },
  },
  npc: '#C77DFF',
  motion: {
    instant: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fast:    'cubic-bezier(0.2, 0.9, 0.3, 1)',
    base:    'cubic-bezier(0.33, 1, 0.68, 1)',
    slow:    'cubic-bezier(0.5, 0, 0.2, 1)',
  },
};

const ROOM_IDS = ['daily', 'stock', 'job'];

// Global styles — Space Grotesk (display) + JetBrains Mono (handles/numerics)
// + Noto Sans KR for korean body text.
if (typeof document !== 'undefined' && !document.getElementById('pod-global-styles')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);

  const s = document.createElement('style');
  s.id = 'pod-global-styles';
  s.textContent = `
    .pod-app {
      font-family: 'Space Grotesk', 'Noto Sans KR', -apple-system, system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: ${TOKENS.text.primary};
    }
    .mono { font-family: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace; }
    .kor { font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif; }

    @keyframes pod-breath {
      0%, 100% { transform: scale(0.97); }
      50%      { transform: scale(1.00); }
    }
    @keyframes pod-breath-active {
      0%, 100% { transform: scale(1.00); }
      50%      { transform: scale(1.015); }
    }
    @keyframes ambient-drift {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
      50%      { transform: translate(10px, -8px) scale(1.08); opacity: 0.7; }
    }
    @keyframes lifebar-blink {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0.55; }
    }
    @keyframes wave-flow {
      0%   { transform: translateX(-120%); opacity: 0; }
      20%  { opacity: 1; }
      80%  { opacity: 1; }
      100% { transform: translateX(120%); opacity: 0; }
    }
    @keyframes msg-appear {
      0%   { transform: scale(0.92); opacity: 0; filter: blur(4px); }
      60%  { transform: scale(1.03); opacity: 1; filter: blur(0); }
      100% { transform: scale(1.00); opacity: 1; filter: blur(0); }
    }
    @keyframes msg-vanish {
      0%   { transform: translateY(0) scale(1);   opacity: 1; filter: blur(0); }
      100% { transform: translateY(-6px) scale(0.96); opacity: 0; filter: blur(6px); }
    }
    @keyframes stem-pulse {
      0%, 100% { opacity: 0.4; }
      50%      { opacity: 1; }
    }
    @keyframes counter-dot {
      0%, 100% { opacity: 0.4; }
      50%      { opacity: 1; }
    }
    @keyframes echo-rise {
      0%   { transform: translateY(20px); opacity: 0; }
      20%  { transform: translateY(0);    opacity: 1; }
      85%  { transform: translateY(0);    opacity: 1; }
      100% { transform: translateY(-8px); opacity: 0; filter: blur(4px); }
    }
    @keyframes shimmer {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes room-slide-in-right {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }

    .pod-ring-svg { transform: rotate(-90deg); transform-origin: center; }

    .tab-underline { transition: all 260ms cubic-bezier(0.33,1,0.68,1); }

    .kbd-key { user-select: none; }

    /* Scrollbars hidden inside pod preview */
    .no-scroll::-webkit-scrollbar { display: none; }
    .no-scroll { scrollbar-width: none; }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { TOKENS, ROOM_IDS });
