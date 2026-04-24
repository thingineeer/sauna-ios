// ConceptStarDeep — 별자리 v2 (고도화)
// + 최근 5개 별을 가는 선으로 연결 → 진짜 별자리
// + 내 별 = 골드, 크기 살짝 큼, 십자 스파크 반짝
// + "빛나는 순간(Peak)" — 많은 별이 동시에 태어나면 flash white
// + 취당 = 별똥별 (밤하늘 끝에서 끝으로 랜덤 시점)

function ConceptStarDeep({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                          keyboardUp = false, showPeak = false }) {
  const config = {
    daily: { name: '밤하늘', sub: 'DAILY CONSTELLATION',
             sky1: '#0a1233', sky2: '#020510', starBase: '#AFEEBF',
             accentGold: '#FFD76B', headCount: 142, density: 1 },
    stock: { name: '황금성단', sub: 'STOCK CONSTELLATION',
             sky1: '#2a1a05', sky2: '#060301', starBase: '#FFD773',
             accentGold: '#FFEA9A', headCount: 88, density: 1.4 },
    job:   { name: '청하늘', sub: 'JOB CONSTELLATION',
             sky1: '#0e1a3a', sky2: '#03061a', starBase: '#8FBFFF',
             accentGold: '#FFD76B', headCount: 56, density: 0.8 },
  }[roomId];

  const [stars, setStars] = React.useState([]);
  const idRef = React.useRef(0);
  const MY_ID = 'me';
  const [shootingStar, setShootingStar] = React.useState(null);

  React.useEffect(() => {
    if (reduceMotion) return;
    const bank = (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
    let cancelled = false;
    const spawn = (isMine = false) => {
      const m = bank[Math.floor(Math.random() * bank.length)];
      if (!m) return;
      const id = ++idRef.current;
      setStars(prev => [...prev, {
        id, ...m, x: 0.08 + Math.random() * 0.84,
        y: 0.08 + Math.random() * 0.82,
        spawnAt: performance.now(),
        senderId: isMine ? MY_ID : 'u' + id,
      }].slice(-18));
      setTimeout(() => {
        if (!cancelled) setStars(p => p.filter(s => s.id !== id));
      }, 14000);
    };
    const i = setInterval(spawn, 1400 / config.density);
    const mineTimer = setInterval(() => { if (Math.random() < 0.22) spawn(true); }, 6000);

    // shooting star every 12-20s
    const shoot = setInterval(() => {
      if (Math.random() < 0.5) {
        const y0 = 0.1 + Math.random() * 0.5;
        setShootingStar({ y0, key: Math.random() });
        setTimeout(() => setShootingStar(null), 1600);
      }
    }, 9000);

    const k = [];
    for (let j = 0; j < 5; j++) k.push(setTimeout(spawn, j * 300));
    return () => { cancelled = true; clearInterval(i); clearInterval(mineTimer);
      clearInterval(shoot); k.forEach(clearTimeout); };
  }, [roomId, reduceMotion, config.density]);

  // Latest 5 stars for constellation lines
  const recent = stars.slice(-5);
  const fieldTop = 196, fieldBottom = keyboardUp ? 534 : 744;
  const fieldH = fieldBottom - fieldTop;

  return (
    <div className="pod-app" style={{
      width, height,
      background: `radial-gradient(ellipse at 50% 40%, ${config.sky1} 0%, ${config.sky2} 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* distant stars — static backdrop */}
      {[...Array(40)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${(i * 37 + 7) % 100}%`,
          top: `${(i * 19 + 13) % 100}%`,
          width: (i % 7 === 0) ? 2 : 1, height: (i % 7 === 0) ? 2 : 1,
          background: '#fff',
          opacity: 0.15 + (i % 5) * 0.05,
          borderRadius: '50%', pointerEvents: 'none',
          animation: reduceMotion ? 'none' : `star-distant ${3 + (i % 5)}s ease-in-out ${i * 0.15}s infinite`,
        }}/>
      ))}

      {/* peak flash overlay */}
      {showPeak && (
        <div style={{position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 60%)',
          animation: 'star-peak-flash 2s ease-out',
          pointerEvents: 'none', zIndex: 20,
        }}/>
      )}

      <div style={{height: 54}}/>

      {/* Header */}
      <div style={{position: 'relative', zIndex: 10, padding: '4px 22px 8px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
          <div>
            <div className="mono" style={{fontSize: 10, color: config.starBase,
              letterSpacing: 2, opacity: 0.75}}>{config.sub}</div>
            <div className="kor" style={{fontSize: 28, fontWeight: 700, color: '#fff',
              letterSpacing: -0.5, lineHeight: 1.1}}>{config.name}</div>
            <div className="kor" style={{fontSize: 11, color: 'rgba(255,255,255,0.55)',
              marginTop: 2}}>반짝이는 별 {stars.length}개 · {config.headCount}명</div>
          </div>
          {showPeak && (
            <div style={{
              padding: '5px 10px', borderRadius: 10,
              background: 'linear-gradient(180deg, rgba(255,215,107,0.9), rgba(255,190,50,0.9))',
              color: '#000', fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
              animation: 'star-peak-bob 1.5s ease-in-out infinite',
            }}>✨ PEAK · 성단 폭발</div>
          )}
        </div>
      </div>

      {/* Room chips */}
      <div style={{position: 'relative', zIndex: 10, padding: '0 22px 8px',
        display: 'flex', gap: 6}}>
        {['daily','stock','job'].map(id => {
          const on = id === roomId;
          const n = id === 'daily' ? '밤하늘' : id === 'stock' ? '황금성단' : '청하늘';
          const c = id === 'daily' ? '#AFEEBF' : id === 'stock' ? '#FFD773' : '#8FBFFF';
          return (
            <div key={id} className="kor" style={{
              padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: on ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.3)',
              color: on ? '#fff' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${on ? c + '88' : 'transparent'}`,
              backdropFilter: 'blur(10px)',
            }}>{n}</div>
          );
        })}
      </div>

      {/* Constellation field */}
      <div style={{
        position: 'absolute', top: fieldTop, left: 0, right: 0,
        bottom: keyboardUp ? 310 : 100, overflow: 'hidden', zIndex: 8,
      }}>
        {/* connection lines SVG */}
        <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
          {recent.slice(0, -1).map((s, i) => {
            const next = recent[i + 1];
            const x1 = s.x * width, y1 = s.y * fieldH;
            const x2 = next.x * width, y2 = next.y * fieldH;
            return (
              <line key={s.id + '-' + next.id}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={config.starBase} strokeWidth="0.6"
                strokeDasharray="2,4"
                opacity="0.35"
                style={{filter: `drop-shadow(0 0 2px ${config.starBase})`}}/>
            );
          })}
        </svg>

        {/* shooting star */}
        {shootingStar && (
          <div key={shootingStar.key} style={{
            position: 'absolute', top: shootingStar.y0 * fieldH,
            left: -40, width: 80, height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${config.starBase} 50%, #fff 100%)`,
            boxShadow: `0 0 8px ${config.starBase}, 0 0 4px #fff`,
            animation: 'star-shoot 1.5s ease-out forwards',
            pointerEvents: 'none',
          }}/>
        )}

        {/* stars */}
        {stars.map((s, idx) => (
          <StarOrb key={s.id} s={s} config={config} width={width} fieldH={fieldH}
            reduceMotion={reduceMotion} isMine={s.senderId === MY_ID}
            isNewest={idx === stars.length - 1}/>
        ))}
      </div>

      {/* Input */}
      <div style={{
        position: 'absolute', bottom: keyboardUp ? 301 : 34,
        left: 14, right: 14, zIndex: 10, height: 50, borderRadius: 25,
        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)',
        border: `1px solid ${config.starBase}44`,
        display: 'flex', alignItems: 'center', padding: '0 6px 0 18px',
      }}>
        <div className="kor" style={{flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.5)'}}>
          별 하나 띄우기...
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: 19, border: 'none',
          background: config.starBase, color: '#000', cursor: 'pointer', fontSize: 14,
        }}>★</button>
      </div>

      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(255,255,255,0.45)'}}/>
      </div>
    </div>
  );
}

function StarOrb({ s, config, width, fieldH, reduceMotion, isMine, isNewest }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (reduceMotion) { setT(0.5); return; }
    let raf;
    const tick = (n) => {
      const p = Math.min(1, (n - s.spawnAt) / 14000);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [s.id, reduceMotion]);

  const x = s.x * width, y = s.y * fieldH;
  const op = t < 0.08 ? t / 0.08 : t > 0.7 ? (1 - t) / 0.3 : 1;
  const size = isMine ? 12 : 9;
  const color = isMine ? config.accentGold : config.starBase;

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    }}>
      {/* cross spark (newest or mine) */}
      {(isNewest || isMine) && t < 0.35 && !reduceMotion && (
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          width: 40, height: 40, transform: 'translate(-50%, -50%)',
          animation: 'star-flash 600ms ease-out',
        }}>
          <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1.5,
            background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
            transform: 'translateX(-50%)',
            boxShadow: `0 0 4px ${color}`,}}/>
          <div style={{position: 'absolute', top: '50%', left: 0, right: 0, height: 1.5,
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            transform: 'translateY(-50%)',
            boxShadow: `0 0 4px ${color}`,}}/>
        </div>
      )}
      {/* Star dot */}
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `radial-gradient(circle, #fff 0%, ${color} 60%, transparent 100%)`,
        opacity: op,
        boxShadow: `0 0 ${isMine ? 14 : 8}px ${color}, 0 0 4px #fff`,
      }}/>
      {/* text beside star */}
      <div className="kor" style={{
        position: 'absolute', left: size + 6, top: -6, whiteSpace: 'nowrap',
        fontSize: 11, color: '#fff', opacity: op * 0.85,
        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        fontWeight: 500, letterSpacing: -0.1,
        fontFamily: "'Noto Sans KR', sans-serif",
      }}>
        {s.text.slice(0, 14)}{s.text.length > 14 ? '…' : ''}
      </div>
    </div>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('star-deep-kf')) {
  const st = document.createElement('style');
  st.id = 'star-deep-kf';
  st.textContent = `
    @keyframes star-flash {
      0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
      50%  { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1.8); }
    }
    @keyframes star-distant {
      0%, 100% { opacity: 0.2; }
      50%      { opacity: 0.6; }
    }
    @keyframes star-peak-flash {
      0%   { opacity: 0; }
      20%  { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes star-peak-bob {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-2px); }
    }
    @keyframes star-shoot {
      0%   { transform: translateX(0) rotate(15deg); opacity: 1; }
      100% { transform: translateX(480px) rotate(15deg); opacity: 0; }
    }
  `;
  document.head.appendChild(st);
}

Object.assign(window, { ConceptStarDeep });
