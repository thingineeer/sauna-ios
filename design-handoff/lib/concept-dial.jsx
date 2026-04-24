// ConceptDial — Frequency Dial 시안
// 라디오 주파수 튜닝 메타포. 방 전환 = 다이얼 돌리기.
// 메시지 = 주파수 상 신호로 표시. 세로 다이얼 + 메시지가 현재 주파수에 잠깐 떴다 사라짐.

function ConceptDial({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                      keyboardUp = false, myEchoText = '' }) {
  const room = TOKENS.rooms[roomId];
  const accent = room.accent;

  const [signals, setSignals] = React.useState([]);
  const idRef = React.useRef(0);

  React.useEffect(() => {
    if (reduceMotion) return;
    const bank = (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
    let cancelled = false;
    const spawn = () => {
      const msg = bank[Math.floor(Math.random() * bank.length)];
      if (!msg) return;
      const id = ++idRef.current;
      const y = 0.15 + Math.random() * 0.7; // vertical lane
      const life = 4500 + Math.random() * 1500;
      setSignals(prev => [...prev, { id, ...msg, y, spawnAt: performance.now(), life }]);
      setTimeout(() => { if (!cancelled) setSignals(prev => prev.filter(s => s.id !== id)); }, life + 400);
    };
    const i = setInterval(spawn, 1600);
    const kicks = [];
    for (let i = 0; i < 3; i++) kicks.push(setTimeout(spawn, 200 + i * 600));
    return () => { cancelled = true; clearInterval(i); kicks.forEach(clearTimeout); };
  }, [roomId, reduceMotion]);

  const freq = { daily: '88.3', stock: '104.7', job: '97.1' }[roomId];

  return (
    <div className="pod-app" style={{
      width, height, background: '#0a0a0f',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* scanlines bg */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.015) 3px)`,
        pointerEvents: 'none',
      }}/>
      {/* ambient glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '-20%', width: 400, height: 400,
        borderRadius: '50%', background: `radial-gradient(circle, ${accent}1a 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }}/>

      <div style={{height: 54}}/>

      {/* top: frequency display */}
      <div style={{
        position: 'relative', zIndex: 5,
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '16px 24px 8px',
      }}>
        <div>
          <div className="mono" style={{fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2}}>FREQ · {room.name}</div>
          <div className="mono" style={{fontSize: 42, fontWeight: 500, color: accent, letterSpacing: -1,
            textShadow: `0 0 24px ${accent}88`, lineHeight: 1.1}}>{freq}</div>
        </div>
        <div className="mono" style={{fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'right'}}>
          <div>MHz</div>
          <div style={{marginTop: 6}}>● LIVE · 1.2k</div>
        </div>
      </div>

      {/* tuning dial — horizontal ticks */}
      <DialTicks roomId={roomId} accent={accent}/>

      {/* main signal stage */}
      <div style={{
        position: 'absolute', top: 220, left: 0, right: 0, bottom: keyboardUp ? 310 : 100,
        overflow: 'hidden',
      }}>
        {/* center frequency line */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1,
          background: `linear-gradient(180deg, transparent 0%, ${accent} 50%, transparent 100%)`,
          transform: 'translateX(-0.5px)',
          opacity: 0.4,
        }}/>
        {/* waveform signals */}
        {signals.map(s => <SignalBlip key={s.id} sig={s} accent={accent} reduceMotion={reduceMotion}/>)}
        {/* static noise overlay */}
        {!reduceMotion && <NoiseDots accent={accent}/>}
      </div>

      <CleanInput accent={accent} roomId={roomId}
        bottom={keyboardUp ? 301 : 34} placeholder={room.placeholder}/>

      {/* home indicator */}
      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(255,255,255,0.45)'}}/>
      </div>
    </div>
  );
}

function DialTicks({ roomId, accent }) {
  const rooms = ['daily', 'stock', 'job'];
  const idx = rooms.indexOf(roomId);
  return (
    <div style={{
      position: 'relative', zIndex: 4,
      margin: '8px 0 16px', padding: '0 24px',
    }}>
      <div style={{position: 'relative', height: 44,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)',
        borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden'}}>
        {/* ticks */}
        {[...Array(41)].map((_, i) => {
          const isMajor = i % 10 === 0;
          const isRoom = i === 10 + idx * 8;
          return (
            <div key={i} style={{
              position: 'absolute', left: `${(i / 40) * 100}%`,
              top: isMajor ? 6 : 14, bottom: isMajor ? 6 : 14,
              width: 1,
              background: isRoom ? accent : isMajor ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
              boxShadow: isRoom ? `0 0 8px ${accent}` : 'none',
            }}/>
          );
        })}
        {/* indicator */}
        <div style={{
          position: 'absolute', left: `${((10 + idx * 8) / 40) * 100}%`,
          top: -4, bottom: -4, width: 2, marginLeft: -1,
          background: accent,
          boxShadow: `0 0 12px ${accent}, 0 0 24px ${accent}aa`,
        }}/>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 4,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.35)'}}>
        {rooms.map(id => <span key={id} style={{color: id===roomId ? accent : 'inherit'}}>
          {TOKENS.rooms[id].name}</span>)}
      </div>
    </div>
  );
}

function SignalBlip({ sig, accent, reduceMotion }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (reduceMotion) { setT(0.5); return; }
    let raf;
    const tick = (n) => {
      const p = Math.min(1, (n - sig.spawnAt) / sig.life);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sig.id, sig.spawnAt, sig.life, reduceMotion]);

  // enters from left, peaks at center, fades right
  const x = t; // 0..1 left to right
  const opacity = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;
  const onBeam = Math.abs(x - 0.5) < 0.2;

  return (
    <div style={{
      position: 'absolute',
      left: `${x * 100}%`, top: `${sig.y * 100}%`,
      transform: 'translate(-50%, -50%)',
      opacity, pointerEvents: 'none',
    }}>
      {/* horizontal wave */}
      <svg width="160" height="32" style={{overflow: 'visible'}}>
        <path d={`M0 16 ${[...Array(20)].map((_, i) => {
          const px = (i+1) * 8;
          const py = 16 + Math.sin(i * 0.9 + sig.id) * (onBeam ? 6 : 2);
          return `L${px} ${py}`;
        }).join(' ')}`}
          stroke={accent} strokeWidth="1.2" fill="none" opacity="0.7"
          style={{filter: `drop-shadow(0 0 4px ${accent})`}}/>
      </svg>
      {/* label when near center */}
      {onBeam && (
        <div style={{
          position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)',
          whiteSpace: 'nowrap', padding: '3px 10px', borderRadius: 10,
          background: 'rgba(10,10,15,0.8)',
          border: `1px solid ${accent}66`,
          backdropFilter: 'blur(8px)',
          fontSize: 12, fontWeight: 500, color: '#fff',
          fontFamily: "'Noto Sans KR', sans-serif",
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          boxShadow: `0 0 16px ${accent}44`,
        }}>
          <span className="mono" style={{fontSize: 8.5, color: accent, marginRight: 5}}>@{sig.nickname.slice(0,8)}</span>
          {sig.text.slice(0, 20)}{sig.text.length > 20 ? '…' : ''}
        </div>
      )}
    </div>
  );
}

function NoiseDots({ accent }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 0.5px, transparent 0.7px)`,
      backgroundSize: '4px 4px', opacity: 0.25,
      mixBlendMode: 'screen',
    }}/>
  );
}

Object.assign(window, { ConceptDial });
