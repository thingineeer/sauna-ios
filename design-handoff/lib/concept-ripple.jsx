// ConceptRipple — 수면 파문 시안
// 발화 = 물에 돌 던지기. 각 메시지는 화면 랜덤 위치에 동심원 파문으로 표현.
// 메시지 텍스트는 파문 중심에 잠시 떴다 사라짐. 파문끼리 겹칠 때 간섭.

function ConceptRipple({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                        keyboardUp = false, myEchoText = '' }) {
  const room = TOKENS.rooms[roomId];
  const accent = room.accent;
  const [ripples, setRipples] = React.useState([]);
  const idRef = React.useRef(0);
  const lastSpots = React.useRef([]);

  React.useEffect(() => {
    if (reduceMotion) return;
    const bank = (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
    let cancelled = false;
    const spawn = (isMine = false, text, nick) => {
      const msg = isMine ? { text, nickname: nick || '나' }
                         : bank[Math.floor(Math.random() * bank.length)];
      if (!msg) return;
      // weighted random spot — avoid last 2
      let cx, cy, tries = 0;
      do {
        cx = 0.15 + Math.random() * 0.7;
        cy = 0.2 + Math.random() * 0.55;
        tries++;
      } while (tries < 8 && lastSpots.current.some(p => Math.hypot(p.cx - cx, p.cy - cy) < 0.22));
      lastSpots.current = [{cx, cy}, ...lastSpots.current].slice(0, 3);

      const id = ++idRef.current;
      setRipples(prev => [...prev, { id, ...msg, cx, cy, isMine,
        spawnAt: performance.now(), life: 5200 + Math.random() * 800 }]);
      setTimeout(() => { if (!cancelled) setRipples(p => p.filter(r => r.id !== id)); }, 6000);
    };
    const i = setInterval(spawn, 1500);
    const k = [];
    for (let j = 0; j < 4; j++) k.push(setTimeout(spawn, 200 + j * 500));
    return () => { cancelled = true; clearInterval(i); k.forEach(clearTimeout); };
  }, [roomId, reduceMotion]);

  return (
    <div className="pod-app" style={{
      width, height,
      background: `radial-gradient(ellipse at 50% 40%, ${accent}12 0%, #05050a 60%, #000 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* caustics bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(ellipse at 30% 20%, ${accent}0a 0%, transparent 40%), radial-gradient(ellipse at 70% 80%, ${accent}0a 0%, transparent 40%)`,
      }}/>

      <div style={{height: 54}}/>
      <CleanTabBar roomId={roomId} accent={accent}/>

      {/* ripple stage */}
      <div style={{
        position: 'absolute', top: 120, left: 0, right: 0,
        bottom: keyboardUp ? 310 : 100, overflow: 'hidden',
      }}>
        {ripples.map(r => <Ripple key={r.id} ripple={r} accent={accent}
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

function Ripple({ ripple, accent, reduceMotion, width }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (reduceMotion) { setT(0.4); return; }
    let raf;
    const tick = (n) => {
      const p = Math.min(1, (n - ripple.spawnAt) / ripple.life);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ripple.id, ripple.spawnAt, ripple.life, reduceMotion]);

  const rings = [0, 0.12, 0.24, 0.36]; // 4 staggered rings
  const maxR = 180;
  const cxPx = ripple.cx * width;
  const cyPxHeight = ripple.cy * 580;

  // text: fades in 0.1→0.25, stays, fades out 0.7→0.9
  const textOp = t < 0.1 ? 0 : t < 0.25 ? (t - 0.1) / 0.15
                : t < 0.7 ? 1 : t < 0.9 ? (0.9 - t) / 0.2 : 0;

  return (
    <div style={{
      position: 'absolute',
      left: cxPx, top: cyPxHeight,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    }}>
      {/* rings */}
      {rings.map((delay, i) => {
        const rp = Math.max(0, Math.min(1, (t - delay) / 0.55));
        if (rp <= 0 || rp >= 1) return null;
        const r = 6 + rp * maxR;
        const op = (1 - rp) * 0.65;
        return (
          <div key={i} style={{
            position: 'absolute',
            top: -r, left: -r, width: r * 2, height: r * 2,
            borderRadius: '50%',
            border: `${ripple.isMine ? 2 : 1.2}px solid ${accent}`,
            opacity: op,
            boxShadow: `0 0 ${8 + rp * 16}px ${accent}${ripple.isMine ? '88' : '44'}`,
          }}/>
        );
      })}
      {/* impact point */}
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
        boxShadow: `0 0 16px ${accent}`,
        opacity: Math.max(0, 1 - t * 2.5),
      }}/>
      {/* message label */}
      <div style={{
        position: 'absolute', top: 14, left: '50%',
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
        opacity: textOp,
        textAlign: 'center',
      }}>
        <div className="mono" style={{fontSize: 9, color: accent, letterSpacing: 0.3, marginBottom: 2,
          textShadow: `0 0 6px ${accent}88`}}>@{ripple.nickname}</div>
        <div className="kor" style={{
          fontSize: ripple.isMine ? 15 : 14, fontWeight: ripple.isMine ? 600 : 500,
          color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)',
          maxWidth: 260, whiteSpace: 'normal', lineHeight: 1.3,
        }}>{ripple.text}</div>
      </div>
    </div>
  );
}

Object.assign(window, { ConceptRipple });
