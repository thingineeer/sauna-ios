// ConceptCairn — 돌탑 시안
// 메시지 = 돌멩이. 방 바닥에서 쌓아올려짐. 무게 따라 흔들림.
// 오래된 돌은 아래로 내려앉으며 이끼 낌. 너무 많으면 '와르르' 무너짐.
// 명상적 · 한국 돌탑 정서 · 야구/월드컵은 '응원 돌탑'으로 확장.

function ConceptCairn({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                       keyboardUp = false }) {
  const config = {
    daily: { name: '마음', sub: '일상 돌탑', sky: '#E8E0D2', ground: '#8B7F6E',
             stone: ['#A09080','#8B7B6B','#968574','#7B6C5C','#857467'],
             prayer: '오늘의 안녕' },
    stock: { name: '시세', sub: '주식 돌탑', sky: '#F5E3C1', ground: '#7A6848',
             stone: ['#C09655','#A67C3D','#8B6530','#704C22','#A88055'],
             prayer: '상승의 기원' },
    job:   { name: '소원', sub: '취준 돌탑', sky: '#DCE3D6', ground: '#6A7558',
             stone: ['#859173','#6F7A5F','#94A080','#5A634B','#788468'],
             prayer: '합격의 기원' },
  }[roomId];

  const [stones, setStones] = React.useState([]);
  const idRef = React.useRef(0);
  const [wind, setWind] = React.useState(0);

  React.useEffect(() => {
    if (reduceMotion) return;
    const bank = (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
    let cancelled = false;
    const spawn = () => {
      const m = bank[Math.floor(Math.random() * bank.length)];
      if (!m) return;
      const id = ++idRef.current;
      const w = 80 + Math.min(220, m.text.length * 7);
      const h = 28 + Math.min(50, m.text.length * 1.2);
      const color = config.stone[Math.floor(Math.random() * config.stone.length)];
      const offsetX = (Math.random() - 0.5) * 20;
      setStones(prev => [...prev, { id, ...m,
        w, h, color, offsetX, spawnAt: performance.now()
      }].slice(-12));
    };
    const i = setInterval(spawn, 2200);
    const k = [];
    for (let j = 0; j < 6; j++) k.push(setTimeout(spawn, j * 400));
    // wind drift
    let raf;
    const tick = (n) => { setWind(Math.sin(n / 2000) * 2 + Math.sin(n / 700) * 0.6); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => { cancelled = true; clearInterval(i); k.forEach(clearTimeout); cancelAnimationFrame(raf); };
  }, [roomId, reduceMotion]);

  // stack stones from bottom — older at bottom, newest on top
  const stacked = [];
  let y = 0;
  // oldest first at bottom
  stones.slice().forEach((s, idx) => {
    stacked.push({ ...s, y, idx });
    y += s.h + 2;
  });
  const topY = y;

  return (
    <div className="pod-app" style={{
      width, height,
      background: `linear-gradient(180deg, ${config.sky} 0%, ${config.ground}44 70%, ${config.ground} 100%)`,
      position: 'relative', overflow: 'hidden',
      color: '#2a1f14',
    }}>
      {/* floating particles (dust/spirit motes) */}
      {!reduceMotion && [...Array(12)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${(i * 37) % 100}%`, top: `${(i * 19) % 90}%`,
          width: 3, height: 3, borderRadius: '50%',
          background: 'rgba(255,255,255,0.6)',
          animation: `cairn-float ${6 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
          pointerEvents: 'none',
        }}/>
      ))}

      <div style={{height: 54}}/>

      {/* header */}
      <div style={{padding: '4px 22px 8px', position: 'relative', zIndex: 10}}>
        <div style={{fontSize: 10, color: 'rgba(42,31,20,0.5)', letterSpacing: 2.5,
          fontFamily: "'JetBrains Mono', monospace"}}>THE CAIRN</div>
        <div className="kor" style={{fontSize: 30, fontWeight: 300, color: '#2a1f14',
          letterSpacing: -0.5, lineHeight: 1.1, marginTop: 2}}>
          {config.name}<span style={{fontWeight: 700}}>돌탑</span>
        </div>
        <div className="kor" style={{fontSize: 11, color: 'rgba(42,31,20,0.55)',
          marginTop: 3}}>{config.sub} · {stones.length}개의 돌 · {config.prayer}</div>
      </div>

      {/* room chips */}
      <div style={{padding: '0 22px 4px', display: 'flex', gap: 6, position: 'relative', zIndex: 10}}>
        {[
          {id:'daily', n:'마음'}, {id:'stock', n:'시세'}, {id:'job', n:'소원'},
          {id:'baseball', n:'응원', soon:true},
        ].map(r => {
          const on = r.id === roomId;
          return (
            <div key={r.id} className="kor" style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 500,
              background: on ? 'rgba(42,31,20,0.9)' : 'rgba(255,255,255,0.3)',
              color: on ? config.sky : 'rgba(42,31,20,0.55)',
              border: '1px solid rgba(42,31,20,0.12)',
              opacity: r.soon ? 0.5 : 1,
            }}>{r.n}{r.soon && ' · soon'}</div>
          );
        })}
      </div>

      {/* the tower stage */}
      <div style={{
        position: 'absolute', top: 200, left: 0, right: 0, bottom: keyboardUp ? 310 : 100,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 30,
      }}>
        {/* ground */}
        <div style={{
          position: 'absolute', bottom: 10, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent 0%, rgba(42,31,20,0.35) 50%, transparent 100%)',
        }}/>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 12,
          background: 'radial-gradient(ellipse at center bottom, rgba(42,31,20,0.4) 0%, transparent 70%)',
        }}/>

        {/* stack */}
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column-reverse',
          alignItems: 'center', justifyContent: 'flex-start',
        }}>
          {stacked.slice().reverse().map((s, stackIdx) => {
            const depth = stones.length - 1 - s.idx;  // 0 = newest on top
            const weight = Math.min(1, (s.h - 28) / 30);
            const sway = wind * (1 - depth / Math.max(1, stones.length)) * 1.5;
            const mossiness = Math.min(0.35, depth * 0.06);
            return (
              <div key={s.id} style={{
                width: s.w, height: s.h,
                marginBottom: stackIdx === 0 ? 0 : 2,
                borderRadius: `${s.h/2 + 4}px / ${s.h/2}px`,
                background: `linear-gradient(180deg, ${s.color} 0%, ${adjustDark(s.color, 25)} 100%)`,
                position: 'relative',
                transform: `translateX(${s.offsetX + sway}px) rotate(${sway * 0.3}deg)`,
                transition: 'transform 400ms cubic-bezier(0.4,0,0.2,1)',
                boxShadow: `0 2px 4px rgba(42,31,20,${0.2 + depth * 0.03}), inset 0 2px 3px rgba(255,255,255,0.15), inset 0 -2px 3px rgba(0,0,0,0.2)`,
                animation: stackIdx === stones.length - 1 && !reduceMotion
                  ? 'cairn-drop 600ms cubic-bezier(0.3,1.4,0.5,1)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 14px',
                overflow: 'hidden',
              }}>
                {/* moss */}
                {mossiness > 0 && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: `linear-gradient(160deg, transparent 50%, rgba(80,110,60,${mossiness}) 100%)`,
                    pointerEvents: 'none',
                  }}/>
                )}
                {/* stone carving = message */}
                <div className="kor" style={{
                  fontSize: Math.min(13, Math.max(10, s.h * 0.35)),
                  color: 'rgba(250,245,235,0.92)',
                  fontWeight: 500, textAlign: 'center',
                  textShadow: '0 1px 2px rgba(0,0,0,0.45), 0 0 1px rgba(0,0,0,0.8)',
                  letterSpacing: -0.2, lineHeight: 1.2,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  position: 'relative', zIndex: 2,
                  maxWidth: s.w - 28,
                }}>{s.text}</div>
              </div>
            );
          })}
        </div>

        {/* small name tag on side of newest */}
        {stones.length > 0 && (
          <div style={{
            position: 'absolute', left: '50%', bottom: Math.min(topY + 60, 400),
            transform: 'translateX(60px)',
            fontSize: 10, color: 'rgba(42,31,20,0.55)',
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: 0.5, pointerEvents: 'none',
            opacity: 0.7,
          }}>
            ← {stones[stones.length-1].nickname.slice(0, 12)}
          </div>
        )}
      </div>

      {/* input */}
      <div style={{
        position: 'absolute', bottom: keyboardUp ? 301 : 34,
        left: 16, right: 16, zIndex: 10, height: 50, borderRadius: 25,
        background: 'rgba(255,253,248,0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(42,31,20,0.12)',
        display: 'flex', alignItems: 'center', padding: '0 6px 0 18px',
      }}>
        <div className="kor" style={{flex: 1, fontSize: 13, color: 'rgba(42,31,20,0.45)'}}>
          돌 하나 올리기...
        </div>
        <button style={{
          width: 40, height: 40, borderRadius: 20, border: 'none',
          background: '#2a1f14', color: '#fff', cursor: 'pointer',
          fontSize: 14,
        }}>⛰</button>
      </div>

      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(42,31,20,0.5)'}}/>
      </div>
    </div>
  );
}

function adjustDark(hex, amt) {
  const h = hex.replace('#','');
  const r = Math.max(0, parseInt(h.slice(0,2),16) - amt);
  const g = Math.max(0, parseInt(h.slice(2,4),16) - amt);
  const b = Math.max(0, parseInt(h.slice(4,6),16) - amt);
  return `rgb(${r},${g},${b})`;
}

if (typeof document !== 'undefined' && !document.getElementById('cairn-kf')) {
  const s = document.createElement('style');
  s.id = 'cairn-kf';
  s.textContent = `
    @keyframes cairn-drop {
      0%   { opacity: 0; transform: translateY(-50px) scale(0.7); }
      60%  { opacity: 1; transform: translateY(4px) scale(1.03); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes cairn-float {
      0%, 100% { transform: translate(0, 0); opacity: 0.3; }
      50%      { transform: translate(15px, -20px); opacity: 0.7; }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { ConceptCairn });
