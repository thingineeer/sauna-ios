// PixelMascot — 16-bit SNES-style pixel art 사우나 메이트
// 캐릭터: "콩이" — 머리에 양머리수건 두른 동그란 회색 캐릭터
// 사이즈: 16x16, 32x32 (둘 다 지원)
// 액션: drink_sikhye, soak, doze, eat_egg, idle, peek

// 16x16 픽셀 그리드 — 각 셀 = 한 픽셀
// 색상 팔레트 (SNES 풍부한 컬러):
const PIXEL_PALETTE = {
  '.': null,                    // transparent
  'k': '#1a1410',              // outline (deep brown-black)
  'B': '#2a2218',              // body shadow (dark)
  'b': '#5a4f44',              // body mid
  'g': '#a8a09a',              // body light gray
  'G': '#d8d2cc',              // body highlight
  'W': '#fef9f0',              // white highlight
  't': '#f4e4c4',              // towel base
  'T': '#fef5db',              // towel highlight
  'o': '#e87030',              // towel stripe orange (warm)
  'O': '#ffa860',              // towel stripe orange highlight
  'c': '#5ab8c8',              // towel stripe cyan (cool)
  'C': '#88dde8',              // towel stripe cyan highlight
  'p': '#f4a890',              // blush pink
  'P': '#ff8870',              // blush deep
  // 식혜 색
  's': '#e8b860',              // sikhye amber
  'S': '#ffd890',              // sikhye highlight
  'i': '#fef9f0',              // ice/jat
  'l': '#a89870',              // glass dark
  'L': '#d8c8a0',              // glass light
  // 계란
  'e': '#c8966a',              // egg shell brown
  'E': '#e8b890',              // egg highlight
  'd': '#704020',              // egg dark
  // 김
  'm': 'rgba(255,250,235,0.85)',  // steam light
  'M': 'rgba(255,250,235,0.55)',  // steam mid
  // 물
  'w': '#3a8a8a',              // water
  'V': '#6ab8b8',              // water highlight
  'v': '#1e5a5a',              // water dark
  // accent
  'r': '#8a3a20',              // egg deep shadow
  'y': '#fff080',              // sparkle
  'z': '#a890d8',              // zZz purple
};

// ─────────────────────────────────────────────────────────────
// 16x16 sprites — base character poses
// ─────────────────────────────────────────────────────────────
const SPRITES_16 = {
  // idle — 기본 앉기 (수건 머리, 동그란 몸)
  idle_warm: [
    '................',
    '......kkkk......',
    '....kktTtkk.....',
    '...ktTtTtok.....',
    '...kToTtTtk.....',
    '...kktTtTkk.....',
    '..kbgggggbk.....',
    '.kbggGGGggbk....',
    'kbggGGGGGggbk...',
    'kbgGGppGppGgbk..',
    'kbgGkk..kkGgbk..',
    'kbggGGwwGGgbk...',
    'kbgggGGGGgggbk..',
    '.kbbgggggbbk....',
    '..kkbbbbbkk.....',
    '....kkkk........',
  ],
  // doze — 졸기 (눈 ^^, zZz)
  doze_warm: [
    '..............z.',
    '......kkkk....z.',
    '....kktTtkk..z..',
    '...ktTtTtok.z...',
    '...kToTtTtk.....',
    '...kktTtTkk.....',
    '..kbgggggbk.....',
    '.kbggGGGggbk....',
    'kbggGGGGGggbk...',
    'kbgGGkkGkkGgbk..',
    'kbgGGppGppGgbk..',
    'kbggGGwwGGgbk...',
    'kbgggGGGGgggbk..',
    '.kbbgggggbbk....',
    '..kkbbbbbkk.....',
    '....kkkk........',
  ],
  // peek — 빠끔 (큰 눈)
  peek_warm: [
    '................',
    '......kkkk......',
    '....kktTtkk.....',
    '...ktTtTtok.....',
    '...kToTtTtk.....',
    '...kktTtTkk.....',
    '..kbgggggbk.....',
    '.kbggGGGggbk....',
    'kbggGGGGGggbk...',
    'kbgGkWkGkWkgbk..',
    'kbgGppppppGgbk..',
    'kbggGGwwGGgbk...',
    'kbgggGGGGgggbk..',
    '.kbbgggggbbk....',
    '..kkbbbbbkk.....',
    '....kkkk........',
  ],
  // soak — 물에 잠긴 (시원한 톤, 수면 라인)
  soak_cool: [
    '................',
    '......kkkk......',
    '....kktTtkk.....',
    '...ktTtTtck.....',
    '...kTcTtTtk.....',
    '...kktTtTkk.....',
    '..kbgggggbk.....',
    '.kbggGGGggbk....',
    'wbggGGGGGggbw...',
    'wbgGGppGppGgbw..',
    'VvVwwVwVwwVwwV..',
    'vwwVwwwVwwwVwv..',
    'wVwvwVvwwvVwww..',
    'vVwvwwVwwvVwwV..',
    'wwVvwwVwwwvVww..',
    'VwwwVvwwVwwvww..',
  ],
  // drink_sikhye — 식혜 컵 들기
  drink_warm: [
    '................',
    '......kkkk......',
    '....kktTtkk.....',
    '...ktTtTtok.....',
    '...kToTtTtk.....',
    '...kktTtTkk.....',
    '..kbgggggbk.lLl.',
    '.kbggGGGggbklSil',
    'kbggGGGGGggbkSsl',
    'kbgGGppGppGglssl',
    'kbgGkk..kkGglssl',
    'kbggGGwwGGgblssl',
    'kbgggGGGGgggblll',
    '.kbbgggggbbk....',
    '..kkbbbbbkk.....',
    '....kkkk........',
  ],
  // eat_egg — 맥반석 계란 들기
  eat_warm: [
    '................',
    '......kkkk......',
    '....kktTtkk.....',
    '...ktTtTtok.....',
    '...kToTtTtk.....',
    '...kktTtTkk.....',
    '..kbgggggbk.kk..',
    '.kbggGGGggbkeEk.',
    'kbggGGGGGggbkek.',
    'kbgGGppGppGgkdk.',
    'kbgG..oo..GgGk..',
    'kbggGGooGGgbk...',
    'kbgggGGGGgggbk..',
    '.kbbgggggbbk....',
    '..kkbbbbbkk.....',
    '....kkkk........',
  ],
  // sweat — 땀
  sweat_warm: [
    '...........V....',
    '......kkkk.V....',
    '....kktTtkkV....',
    '...ktTtTtok.....',
    '...kToTtTtk.....',
    '...kktTtTkk.....',
    '..kbgggggbk.....',
    '.kbggGGGggbk....',
    'kbggGGGGGggbk...',
    'kbgGGkkGkkGgbk..',
    'kbgGGppGppGgbk..',
    'kbggGGwwGGgbk...',
    'kbgggGGGGgggbk..',
    '.kbbgggggbbk....',
    '..kkbbbbbkk.....',
    '....kkkk........',
  ],
};

// 32x32 — 디테일 풍부한 버전 (idle만 — placeholder, 나머지는 상위 호환)
const SPRITES_32 = {
  idle_warm: [
    '................................',
    '................................',
    '............kkkkkkkk............',
    '..........kkttTTttkkk...........',
    '.........kttTTTTTTttok..........',
    '........ktTTToooTTTTtok.........',
    '........kTTooOOoooTTTtk.........',
    '........kTToOOOoooTTTTk.........',
    '........kkTTToooTTTTkk..........',
    '.........kkTTTTTTkkk............',
    '......kkkbgggggggbkkk...........',
    '....kkbggggGGGGGGggggbkk........',
    '..kkbgggGGGGGGGGGGGGggbkk.......',
    '.kbggggGGGGGGGGGGGGGGgggbk......',
    'kbggggGGGGGGGGGGGGGGGGggbbk.....',
    'kbgggGGGGppppGGppppGGGGgggbk....',
    'kbggGGGGGppppGGppppGGGGGGgbk....',
    'kbggGGGGGGkkkGGkkkGGGGGGGgbk....',
    'kbggGGGGGGkkWGGkkWGGGGGGGgbk....',
    'kbggGGGGGGGGGGGGGGGGGGGGGgbk....',
    'kbggGGGGGGGGwwwwGGGGGGGGGgbk....',
    'kbggGGGGGGGGGwwGGGGGGGGGggbk....',
    '.kbggGGGGGGGGGGGGGGGGGGGgbk.....',
    '.kbgggGGGGGGGGGGGGGGGGgggbk.....',
    '..kbgggggGGGGGGGGGGGgggggbk.....',
    '...kkbggggggggggggggggbbkk......',
    '.....kkbbbbggggggggbbbkk........',
    '........kkkkbbbbbkkkk...........',
    '............kkkkk...............',
    '................................',
    '................................',
    '................................',
  ],
};

// Render a sprite grid (each char = 1 pixel)
function PixelSprite({ grid, scale = 4, palette = PIXEL_PALETTE }) {
  const rows = grid.length;
  const cols = grid[0].length;
  return (
    <div style={{
      width: cols * scale, height: rows * scale,
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, ${scale}px)`,
      gridTemplateRows: `repeat(${rows}, ${scale}px)`,
      imageRendering: 'pixelated',
      lineHeight: 0,
    }}>
      {grid.flatMap((row, y) =>
        row.split('').map((ch, x) => {
          const color = palette[ch];
          return (
            <div key={`${y}-${x}`} style={{
              width: scale, height: scale,
              background: color || 'transparent',
            }}/>
          );
        })
      )}
    </div>
  );
}

function PixelMascot({ pose = 'idle', tone = 'warm', size = 16, scale = 4 }) {
  const key = `${pose}_${tone}`;
  const set = size === 32 ? SPRITES_32 : SPRITES_16;
  const grid = set[key] || set[`idle_${tone}`] || set.idle_warm;
  return <PixelSprite grid={grid} scale={scale}/>;
}

// ─────────────────────────────────────────────────────────────
// PixelMascotShowcase — 캐릭터 명세 카드
// ─────────────────────────────────────────────────────────────
function PixelMascotShowcase() {
  const poses = [
    { id: 'idle',   tone: 'warm', name: '기본', desc: '\uc890\uc544\uc788\uae30' },
    { id: 'doze',   tone: 'warm', name: '\uc878\uae30',  desc: 'zZz · \uba85\uc0c1' },
    { id: 'sweat',  tone: 'warm', name: '\ub540',     desc: '\uba38\ub9ac\uc5d0 \uc2dd\uc740 \ub540' },
    { id: 'drink',  tone: 'warm', name: '\uc2dd\ud61c',  desc: '\uc0b4\uc5bc\uc74c \uc2dd\ud61c \ub4e4\uae30' },
    { id: 'eat',    tone: 'warm', name: '\uacc4\ub780',  desc: '\ub9e5\ubc18\uc11d \uacc4\ub780' },
    { id: 'soak',   tone: 'cool', name: '\uc7a0\uae40',  desc: '\uc695\ud0d5 / \ub0c9\ud0d5' },
    { id: 'peek',   tone: 'warm', name: '\ube60\ub054',  desc: '\uc54c\ub9bc / \uc0c8 \uba54\uc2dc\uc9c0' },
  ];

  return (
    <div style={{
      width: 920, padding: '28px',
      background: 'linear-gradient(180deg, #f0eee9 0%, #e8e3d8 100%)',
      borderRadius: 16, border: '1px solid rgba(60,40,20,0.12)',
      fontFamily: "'Noto Sans KR', -apple-system, sans-serif",
    }}>
      <div className="mono" style={{fontSize:10, color:'#c96442',
        letterSpacing:2.5, fontWeight:700}}>16-BIT · PIXEL MASCOT</div>
      <div style={{fontSize:24, fontWeight:800, color:'#3a2a1a',
        letterSpacing:-0.5, marginTop:6}}>콩이 — 사우나 픽셀 메이트</div>
      <div style={{fontSize:13, color:'rgba(40,30,20,0.7)', marginTop:6,
        lineHeight: 1.6, maxWidth: 720}}>
        16x16 / 32x32 픽셀아트. SNES 풍부한 컬러 팔레트.
        머리에 양머리수건 두른 동그란 회색 캐릭터 — 한국 찜질방 분위기.
      </div>

      {/* 32x32 hero */}
      <div style={{marginTop: 24, display: 'flex', gap: 24, alignItems: 'center',
        background: 'linear-gradient(135deg, #f4e8d0 0%, #e8d8b8 100%)',
        padding: '24px 28px', borderRadius: 12,
        border: '1px solid rgba(60,40,20,0.15)'}}>
        <div style={{
          padding: 12, background: '#fff',
          borderRadius: 8, border: '2px dashed rgba(60,40,20,0.2)',
          imageRendering: 'pixelated',
        }}>
          <PixelMascot pose="idle" tone="warm" size={32} scale={6}/>
        </div>
        <div>
          <div style={{fontSize: 11, color: '#c96442', fontWeight: 700,
            letterSpacing: 1.5}}>32×32 · HERO</div>
          <div style={{fontSize: 18, fontWeight: 700, color: '#3a2a1a',
            marginTop: 4}}>풀 디테일 캐릭터 카드</div>
          <div style={{fontSize: 12, color: 'rgba(40,30,20,0.6)',
            marginTop: 4, lineHeight: 1.5, maxWidth: 360}}>
            프로필 / 스플래시 / 큰 화면용. 양머리수건 + 볼 홍조 + 동그란 몸.
          </div>
        </div>
      </div>

      {/* 16x16 액션 그리드 */}
      <div style={{marginTop: 22}}>
        <div className="mono" style={{fontSize: 10, color:'#3a2a1a',
          letterSpacing: 1.5, fontWeight: 700, marginBottom: 12}}>
          16×16 · 7 ACTIONS
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 10}}>
          {poses.map(p => (
            <div key={p.id} style={{
              background: '#fff', padding: '14px 8px', borderRadius: 10,
              border: '1px solid rgba(60,40,20,0.1)',
              boxShadow: '0 2px 4px rgba(60,40,20,0.05)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{
                background: p.tone === 'cool'
                  ? 'linear-gradient(180deg, #b8d8d8, #6aa8a8)'
                  : 'linear-gradient(180deg, #f4d8a8, #d8a070)',
                padding: 8, borderRadius: 6, marginBottom: 8,
                imageRendering: 'pixelated',
              }}>
                <PixelMascot pose={p.id} tone={p.tone} size={16} scale={4}/>
              </div>
              <div style={{fontSize: 12, fontWeight: 700, color: '#3a2a1a'}}>
                {p.name}
              </div>
              <div style={{fontSize: 10, color: 'rgba(40,30,20,0.6)',
                marginTop: 2, textAlign: 'center', lineHeight: 1.3}}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Palette card */}
      <div style={{marginTop: 22, padding: 18, borderRadius: 12,
        background: 'linear-gradient(180deg, #2a1a10, #18100a)',
        border: '1px solid rgba(255,200,140,0.2)'}}>
        <div className="mono" style={{fontSize: 10, color: '#FFD4A0',
          letterSpacing: 1.5, fontWeight: 700, marginBottom: 12}}>
          16-BIT PALETTE · 24 COLORS
        </div>
        <div style={{display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)', gap: 4}}>
          {['k','B','b','g','G','W','t','T','o','O','c','C',
            'p','P','s','S','i','l','L','e','E','d','w','V'].map(ch => (
            <div key={ch} style={{aspectRatio: 1, borderRadius: 4,
              background: PIXEL_PALETTE[ch],
              border: '1px solid rgba(0,0,0,0.3)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)'}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PixelMascot, PixelSprite, PixelMascotShowcase, PIXEL_PALETTE });
