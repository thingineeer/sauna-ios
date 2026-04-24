// ConceptSignal — Signal 24 시안
// 24시간 후 폭파되는 비밀 주파수. 녹색 인광 터미널 + 아날로그 파동.
// 메시지는 읽힌 후 60초 카운트로 자동 소멸. '비밀 회담' 느낌.

function ConceptSignal({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                        keyboardUp = false }) {
  const green = '#3FFF6B';
  const dim   = '#1a3a22';
  const roomName = { daily: 'FREE-TALK', stock: 'INSIDERS', job: 'INTEL' }[roomId];
  const freq     = { daily: 'F-7824', stock: 'F-9301', job: 'F-4456' }[roomId];

  const [msgs, setMsgs] = React.useState([]);
  const idRef = React.useRef(0);

  React.useEffect(() => {
    if (reduceMotion) return;
    const bank = (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
    let cancelled = false;
    const spawn = () => {
      const m = bank[Math.floor(Math.random() * bank.length)];
      if (!m) return;
      const id = ++idRef.current;
      setMsgs(prev => [...prev, { id, ...m, spawnAt: performance.now() }].slice(-8));
      setTimeout(() => { if (!cancelled) setMsgs(p => p.filter(x => x.id !== id)); }, 60000);
    };
    const i = setInterval(spawn, 1500);
    const k = [];
    for (let j = 0; j < 4; j++) k.push(setTimeout(spawn, j * 380));
    return () => { cancelled = true; clearInterval(i); k.forEach(clearTimeout); };
  }, [roomId, reduceMotion]);

  // fake waveform — oscillating sine + noise
  const [wavePts, setWavePts] = React.useState([]);
  React.useEffect(() => {
    if (reduceMotion) return;
    let raf;
    const tick = (t) => {
      const pts = [];
      for (let i = 0; i < 80; i++) {
        const x = (i / 79) * 350;
        const y = Math.sin(i * 0.25 + t * 0.003) * 14
                + Math.sin(i * 0.6 + t * 0.005) * 6
                + (Math.random() - 0.5) * 3;
        pts.push(`${x},${y + 30}`);
      }
      setWavePts(pts);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  const fontMono = `'VT323', 'Courier New', monospace`;

  return (
    <div className="pod-app" style={{
      width, height,
      background: '#020603',
      position: 'relative', overflow: 'hidden',
      color: green, fontFamily: fontMono,
    }}>
      {/* phosphor CRT effect */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,80,30,0.16) 3px)`,
        pointerEvents: 'none', zIndex: 25,
      }}/>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        pointerEvents: 'none', zIndex: 26,
      }}/>

      <div style={{height: 54}}/>

      {/* classified header */}
      <div style={{position: 'relative', zIndex: 10, padding: '0 18px 8px'}}>
        <div style={{fontSize: 10, color: green, opacity: 0.6, letterSpacing: 3, marginBottom: 2}}>
          ▶ CLASSIFIED · EYES ONLY ◀
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14}}>
          <span style={{fontSize: 38, color: green, lineHeight: 1, letterSpacing: 2,
            textShadow: `0 0 10px ${green}, 0 0 4px ${green}`}}>{freq}</span>
          <span style={{fontSize: 18, color: green, opacity: 0.7}}>{roomName}</span>
        </div>
        <div style={{fontSize: 13, color: green, opacity: 0.55, marginTop: 2, letterSpacing: 1}}>
          SELF-DESTRUCT T-23:47:12 · 142 AGENTS LISTENING
        </div>
      </div>

      {/* waveform */}
      <div style={{position: 'relative', zIndex: 8, padding: '0 18px', marginTop: 6}}>
        <svg width="100%" height="60" viewBox="0 0 350 60" preserveAspectRatio="none"
          style={{display: 'block'}}>
          <polyline points={wavePts.join(' ')}
            stroke={green} strokeWidth="1.2" fill="none"
            style={{filter: `drop-shadow(0 0 3px ${green})`}}/>
          <line x1="0" y1="30" x2="350" y2="30" stroke={green} strokeWidth="0.2" opacity="0.3"/>
        </svg>
      </div>

      {/* tab freqs */}
      <div style={{position: 'relative', zIndex: 10, padding: '6px 18px',
        borderTop: `1px dashed ${green}33`, borderBottom: `1px dashed ${green}33`,
        display: 'flex', gap: 18, fontSize: 13, letterSpacing: 1}}>
        {['daily','stock','job'].map(id => {
          const on = id === roomId;
          const f = { daily: 'F-7824', stock: 'F-9301', job: 'F-4456' }[id];
          return <span key={id} style={{color: green, opacity: on ? 1 : 0.35,
            textShadow: on ? `0 0 6px ${green}` : 'none'}}>{on && '> '}{f}</span>;
        })}
      </div>

      {/* decoded transmissions */}
      <div style={{position: 'absolute', top: 254, left: 0, right: 0,
        bottom: keyboardUp ? 310 : 100, padding: '10px 18px',
        overflow: 'hidden', zIndex: 8}}>
        <div style={{fontSize: 11, color: green, opacity: 0.5, letterSpacing: 2, marginBottom: 8}}>
          ══ DECODED STREAM ══
        </div>
        {msgs.slice().reverse().map((m, i) => {
          const age = (performance.now() - m.spawnAt) / 60000;
          const ttl = Math.max(0, 60 - Math.floor(age * 60));
          return (
            <div key={m.id} style={{
              marginBottom: 10, opacity: Math.max(0.3, 1 - age * 0.7),
            }}>
              <div style={{fontSize: 11, color: green, opacity: 0.7, letterSpacing: 0.5}}>
                ▷ AGENT_{m.nickname.slice(-4)} · T-{String(ttl).padStart(2,'0')}s
              </div>
              <div className="kor" style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: 14, color: '#c4ffc4', marginTop: 2, lineHeight: 1.4,
                textShadow: `0 0 6px ${green}44`,
              }}>{m.text}</div>
              {/* decoding bar */}
              <div style={{marginTop: 4, height: 2, background: dim, borderRadius: 0}}>
                <div style={{height: '100%', width: `${ttl / 60 * 100}%`, background: green,
                  boxShadow: `0 0 4px ${green}`}}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* input */}
      <div style={{position: 'absolute', bottom: keyboardUp ? 301 : 34,
        left: 14, right: 14, zIndex: 10,
        height: 44, display: 'flex', alignItems: 'center',
        padding: '0 4px 0 12px',
        background: '#020603', border: `1px solid ${green}`,
        boxShadow: `inset 0 0 10px ${green}33, 0 0 10px ${green}22`,
      }}>
        <span style={{color: green, marginRight: 8, fontSize: 14,
          animation: 'counter-dot 0.8s steps(2) infinite'}}>█</span>
        <div className="kor" style={{flex: 1, color: green, opacity: 0.5, fontSize: 14,
          fontFamily: "'Noto Sans KR', sans-serif"}}>ENCRYPT + BROADCAST...</div>
        <button style={{
          height: 30, padding: '0 14px', background: green, color: '#000',
          fontFamily: fontMono, fontSize: 13, letterSpacing: 1.5,
          border: 'none', cursor: 'pointer',
        }}>▶ SEND</button>
      </div>

      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(0,255,100,0.5)'}}/>
      </div>
    </div>
  );
}

Object.assign(window, { ConceptSignal });
