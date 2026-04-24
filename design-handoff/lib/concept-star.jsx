// ConceptStar — 별자리 시안
// 각 메시지 = 하늘에 별 하나 반짝 태어나 천천히 소멸.
// 같은 방(토픽)에 있는 별들이 얇은 선으로 연결되며 형태 없는 별자리 형성.
// 최근 별 = 밝음, 오래된 별 = 어둡게 페이드.

function ConceptStar({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                      keyboardUp = false, myEchoText = '' }) {
  const room = TOKENS.rooms[roomId];
  const accent = room.accent;
  const [stars, setStars] = React.useState([]); // active (up to ~10)
  const idRef = React.useRef(0);

  React.useEffect(() => {
    if (reduceMotion) return;
    const bank = (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
    let cancelled = false;
    const spawn = () => {
      const msg = bank[Math.floor(Math.random() * bank.length)];
      if (!msg) return;
      const id = ++idRef.current;
      const x = 0.1 + Math.random() * 0.8;
      const y = 0.12 + Math.random() * 0.58;
      const life = 8000 + Math.random() * 3000;
      setStars(prev => {
        const next = [...prev, { id, ...msg, x, y, spawnAt: performance.now(), life }];
        // keep max ~12 stars — drop oldest
        return next.slice(-12);
      });
      setTimeout(() => { if (!cancelled) setStars(p => p.filter(s => s.id !== id)); }, life + 400);
    };
    const i = setInterval(spawn, 1400);
    const k = [];
    for (let j = 0; j < 6; j++) k.push(setTimeout(spawn, 150 + j * 320));
    return () => { cancelled = true; clearInterval(i); k.forEach(clearTimeout); };
  }, [roomId, reduceMotion]);

  return (
    <div className="pod-app" style={{
      width, height,
      background: `radial-gradient(ellipse at 50% 50%, #0a0d1a 0%, #04050a 50%, #000 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* background ambient stars (static) */}
      <AmbientStars width={width} height={height}/>
      {/* subtle nebula */}
      <div style={{
        position: 'absolute', top: '20%', left: '30%', width: 300, height: 300,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}14 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }}/>

      <div style={{height: 54}}/>
      <CleanTabBar roomId={roomId} accent={accent}/>

      {/* constellation canvas */}
      <div style={{
        position: 'absolute', top: 120, left: 0, right: 0,
        bottom: keyboardUp ? 310 : 100, overflow: 'hidden',
      }}>
        {/* lines connecting stars (MST-ish, just chain by spawn order) */}
        <svg style={{position: 'absolute', inset: 0, pointerEvents: 'none'}} width="100%" height="100%">
          {stars.slice(0, -1).map((s, i) => {
            const next = stars[i + 1];
            const age = (performance.now() - s.spawnAt) / s.life;
            const op = Math.max(0, (1 - age) * 0.35);
            return (
              <line key={s.id} x1={s.x * width} y1={s.y * 560}
                x2={next.x * width} y2={next.y * 560}
                stroke={accent} strokeWidth="0.6" opacity={op}
                strokeDasharray="2 3"/>
            );
          })}
        </svg>
        {stars.map(s => <Star key={s.id} star={s} accent={accent}
          reduceMotion={reduceMotion} width={width}/>)}
      </div>

      <CleanInput accent={accent} roomId={roomId}
        bottom={keyboardUp ? 301 : 34} placeholder={room.placeholder}/>
      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(255,255,255,0.45)'}}/>
      </div>
    </div>
  );
}

function Star({ star, accent, reduceMotion, width }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (reduceMotion) { setT(0.3); return; }
    let raf;
    const tick = (n) => {
      const p = Math.min(1, (n - star.spawnAt) / star.life);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [star.id, star.spawnAt, star.life, reduceMotion]);

  // birth flash: 0→0.05 big glow, then settle
  const birthFlash = t < 0.08 ? (1 - t / 0.08) : 0;
  // visibility: bright early, fades out
  const brightness = t < 0.08 ? t / 0.08 : Math.pow(1 - t, 1.3);
  // shimmer
  const shimmer = 1 + Math.sin(t * 30 + star.id) * 0.1;

  const cx = star.x * width;
  const cy = star.y * 560;
  const showLabel = t > 0.03 && t < 0.45;
  const labelOp = t < 0.08 ? (t - 0.03) / 0.05 : t > 0.35 ? (0.45 - t) / 0.1 : 1;

  return (
    <div style={{position: 'absolute', left: cx, top: cy, transform: 'translate(-50%, -50%)',
      pointerEvents: 'none'}}>
      {/* birth flash */}
      {birthFlash > 0 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)',
          width: 120, height: 120, borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}aa 0%, transparent 60%)`,
          opacity: birthFlash, filter: 'blur(4px)',
        }}/>
      )}
      {/* star point */}
      <div style={{
        position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)',
        width: 6 * shimmer, height: 6 * shimmer, borderRadius: '50%',
        background: '#fff',
        boxShadow: `0 0 8px #fff, 0 0 16px ${accent}, 0 0 24px ${accent}aa`,
        opacity: brightness,
      }}/>
      {/* 4-point cross spike */}
      <svg style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)',
        opacity: brightness * 0.8}} width="40" height="40" viewBox="-20 -20 40 40">
        <line x1="-14" y1="0" x2="14" y2="0" stroke={accent} strokeWidth="0.5" opacity="0.7"/>
        <line x1="0" y1="-14" x2="0" y2="14" stroke={accent} strokeWidth="0.5" opacity="0.7"/>
      </svg>
      {/* label bubble */}
      {showLabel && (
        <div style={{
          position: 'absolute', top: 12, left: 12,
          padding: '4px 10px', borderRadius: 10,
          background: 'rgba(10,10,15,0.7)',
          border: `1px solid ${accent}55`, backdropFilter: 'blur(8px)',
          whiteSpace: 'nowrap', maxWidth: 240,
          opacity: labelOp,
        }}>
          <div className="mono" style={{fontSize: 8, color: accent, opacity: 0.8}}>@{star.nickname}</div>
          <div className="kor" style={{fontSize: 12, color: '#fff', fontWeight: 500,
            whiteSpace: 'normal', maxWidth: 220, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
            {star.text}</div>
        </div>
      )}
    </div>
  );
}

function AmbientStars({ width, height }) {
  const stars = React.useMemo(() => [...Array(60)].map((_, i) => ({
    x: Math.random(), y: Math.random(),
    s: 0.4 + Math.random() * 1.2,
    o: 0.1 + Math.random() * 0.3,
  })), []);
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: s.x * width, top: s.y * height,
          width: s.s, height: s.s, borderRadius: '50%',
          background: '#fff', opacity: s.o,
        }}/>
      ))}
    </div>
  );
}

Object.assign(window, { ConceptStar });
