// ConceptPulse — 심장박동 / 실시간성 시안
// 방 전체가 하나의 생명체처럼 박동. 각 메시지 = 심박의 한 비트.
// 중앙에 ECG-style 라인이 실시간으로 흘러가고,
// 박동마다 파동이 상하좌우로 퍼지며 메시지를 노출.
// "지금 이 순간"을 가장 강렬하게 보여주는 시안.

function ConceptPulse({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                       keyboardUp = false, myEchoText = '' }) {
  const room = TOKENS.rooms[roomId];
  const accent = room.accent;
  const [beats, setBeats] = React.useState([]); // active beat overlays
  const [trace, setTrace] = React.useState([]); // ecg points
  const idRef = React.useRef(0);
  const traceRef = React.useRef([]);

  // ECG trace — continuous scroll
  React.useEffect(() => {
    if (reduceMotion) return;
    let raf;
    const W = 2; // step per frame
    let x = 0;
    const tick = () => {
      x += W;
      // quiet baseline with occasional spike
      traceRef.current = [...traceRef.current, { x, y: 0 }].slice(-200);
      setTrace([...traceRef.current]);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  // Beats driven by messages
  React.useEffect(() => {
    if (reduceMotion) return;
    const bank = (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
    let cancelled = false;
    const spawn = () => {
      const msg = bank[Math.floor(Math.random() * bank.length)];
      if (!msg) return;
      const id = ++idRef.current;
      // inject spike into trace
      const base = traceRef.current;
      if (base.length > 0) {
        const lastX = base[base.length - 1].x;
        traceRef.current = [...base,
          { x: lastX + 2, y: -4 }, { x: lastX + 4, y: -22 },
          { x: lastX + 6, y: 38 }, { x: lastX + 8, y: -8 },
          { x: lastX + 10, y: 2 }, { x: lastX + 12, y: 0 }
        ].slice(-200);
      }
      // place beat overlay near spike entry (right side)
      const side = Math.random() < 0.5 ? 'top' : 'bottom';
      setBeats(prev => [...prev, { id, ...msg, side,
        xOffset: (Math.random() - 0.5) * 160,
        spawnAt: performance.now() }]);
      setTimeout(() => { if (!cancelled) setBeats(p => p.filter(b => b.id !== id)); }, 3200);
    };
    const i = setInterval(spawn, 1200);
    const k = [];
    for (let j = 0; j < 3; j++) k.push(setTimeout(spawn, 400 + j * 400));
    return () => { cancelled = true; clearInterval(i); k.forEach(clearTimeout); };
  }, [roomId, reduceMotion]);

  const centerY = 0.5;

  return (
    <div className="pod-app" style={{
      width, height,
      background: `radial-gradient(ellipse at 50% 50%, ${accent}10 0%, #05050a 50%, #000 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* grid bg (hospital monitor feel) */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${accent}0a 1px, transparent 1px), linear-gradient(90deg, ${accent}0a 1px, transparent 1px)`,
        backgroundSize: '20px 20px', pointerEvents: 'none',
      }}/>

      <div style={{height: 54}}/>

      {/* live header — BPM style */}
      <div style={{
        position: 'relative', zIndex: 5,
        padding: '12px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div className="mono" style={{fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 2}}>
            {room.name.toUpperCase()} · BPM
          </div>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 4}}>
            <BPMCounter accent={accent} reduceMotion={reduceMotion}/>
            <div className="mono" style={{fontSize: 11, color: accent, marginLeft: 4}}>LIVE</div>
          </div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div className="mono" style={{fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 2}}>ACTIVE</div>
          <div className="mono" style={{fontSize: 20, fontWeight: 500, color: '#fff', lineHeight: 1}}>1,247</div>
        </div>
      </div>

      <CleanTabBar roomId={roomId} accent={accent}/>

      {/* ECG strip (center band) */}
      <div style={{
        position: 'absolute', top: centerY * height - 60, left: 0, right: 0,
        height: 120, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <EcgTrace trace={trace} accent={accent}/>
      </div>

      {/* beats — floating messages */}
      <div style={{
        position: 'absolute', top: 200, left: 0, right: 0,
        bottom: keyboardUp ? 310 : 100, pointerEvents: 'none', overflow: 'hidden',
      }}>
        {beats.map(b => <PulseBeat key={b.id} beat={b} accent={accent}
          centerY={centerY * height - 200} width={width} reduceMotion={reduceMotion}/>)}
      </div>

      <CleanInput accent={accent} roomId={roomId}
        bottom={keyboardUp ? 301 : 34} placeholder={room.placeholder}/>
      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(255,255,255,0.45)'}}/>
      </div>
    </div>
  );
}

function BPMCounter({ accent, reduceMotion }) {
  const [bpm, setBpm] = React.useState(72);
  React.useEffect(() => {
    if (reduceMotion) return;
    const i = setInterval(() => setBpm(60 + Math.floor(Math.random() * 40)), 1500);
    return () => clearInterval(i);
  }, [reduceMotion]);
  return (
    <div className="mono" style={{
      fontSize: 42, fontWeight: 500, color: accent,
      letterSpacing: -1, lineHeight: 1,
      textShadow: `0 0 16px ${accent}88`,
    }}>{bpm}</div>
  );
}

function EcgTrace({ trace, accent }) {
  if (trace.length === 0) return null;
  const minX = trace[0].x;
  const maxX = trace[trace.length - 1].x;
  const range = Math.max(400, maxX - minX);
  const pts = trace.map(p => `${((p.x - minX) / range) * 390},${60 + p.y}`).join(' ');
  return (
    <svg width="100%" height="120" viewBox="0 0 390 120" preserveAspectRatio="none"
      style={{overflow: 'visible'}}>
      {/* baseline */}
      <line x1="0" y1="60" x2="390" y2="60" stroke={accent} strokeWidth="0.3" opacity="0.3"/>
      {/* trace */}
      <polyline points={pts} stroke={accent} strokeWidth="1.4" fill="none"
        strokeLinejoin="round" strokeLinecap="round"
        style={{filter: `drop-shadow(0 0 6px ${accent}) drop-shadow(0 0 12px ${accent}66)`}}/>
      {/* leading dot */}
      {trace.length > 0 && (() => {
        const last = trace[trace.length - 1];
        const lx = ((last.x - minX) / range) * 390;
        return <circle cx={lx} cy={60 + last.y} r="3" fill={accent}
          style={{filter: `drop-shadow(0 0 6px ${accent})`}}/>;
      })()}
    </svg>
  );
}

function PulseBeat({ beat, accent, centerY, width, reduceMotion }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (reduceMotion) { setT(0.5); return; }
    let raf;
    const tick = (n) => {
      const p = Math.min(1, (n - beat.spawnAt) / 3000);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [beat.id, beat.spawnAt, reduceMotion]);

  const dirMult = beat.side === 'top' ? -1 : 1;
  const y = centerY + dirMult * (30 + t * 100);
  const x = width / 2 + beat.xOffset;
  const op = t < 0.08 ? t / 0.08 : t > 0.7 ? (1 - t) / 0.3 : 1;

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: 'translate(-50%, -50%)',
      opacity: op, pointerEvents: 'none',
      whiteSpace: 'nowrap',
      textAlign: 'center',
    }}>
      <div style={{
        display: 'inline-block', padding: '6px 12px', borderRadius: 14,
        background: 'rgba(10,10,15,0.6)', backdropFilter: 'blur(10px)',
        border: `1px solid ${accent}66`,
      }}>
        <div className="mono" style={{fontSize: 8.5, color: accent, marginBottom: 2, letterSpacing: 0.3}}>@{beat.nickname}</div>
        <div className="kor" style={{fontSize: 13, fontWeight: 500, color: '#fff',
          maxWidth: 220, whiteSpace: 'normal', lineHeight: 1.3,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{beat.text}</div>
      </div>
      {/* connector line toward ECG */}
      <div style={{
        position: 'absolute', left: '50%',
        [beat.side === 'top' ? 'bottom' : 'top']: '100%',
        width: 1, height: 20, marginLeft: -0.5,
        background: `linear-gradient(${beat.side === 'top' ? '180deg' : '0deg'}, transparent 0%, ${accent} 100%)`,
      }}/>
    </div>
  );
}

Object.assign(window, { ConceptPulse });
