// ConceptBunker — 지하 벙커 시안
// 외부 소동을 피해 모인 은신처. 어두운 CRT 모니터 + 픽셀 폰트 + 무전기 노이즈.
// 매일 자정 PURGE — 상단에 카운트다운. 메시지 = 무전 송신 로그 라인.
// 방: 워룸(주식) / 자습실(취준) / 라운지(일상)

function ConceptBunker({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                        keyboardUp = false }) {
  const room = TOKENS.rooms[roomId];
  const accent = '#FF4D4D';
  const amber  = '#FFB800';
  const green  = '#3FFF80';
  const roomColor = roomId === 'stock' ? accent : roomId === 'job' ? amber : green;
  const roomName = { daily: '라운지', stock: '워룸', job: '자습실' }[roomId];
  const roomSub  = { daily: '// CIVILIAN LOUNGE', stock: '// WAR ROOM', job: '// STUDY HOLD' }[roomId];

  const [log, setLog] = React.useState([]);
  const idRef = React.useRef(0);
  const [countdown, setCountdown] = React.useState('');

  React.useEffect(() => {
    const tick = () => {
      const now = new Date();
      const mid = new Date(now);
      mid.setHours(24, 0, 0, 0);
      const diff = mid - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  React.useEffect(() => {
    if (reduceMotion) return;
    const bank = (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
    let cancelled = false;
    const spawn = () => {
      const msg = bank[Math.floor(Math.random() * bank.length)];
      if (!msg) return;
      const id = ++idRef.current;
      const ts = new Date();
      const tStr = `${String(ts.getHours()).padStart(2,'0')}:${String(ts.getMinutes()).padStart(2,'0')}:${String(ts.getSeconds()).padStart(2,'0')}`;
      setLog(prev => [...prev, { id, ...msg, t: tStr, sig: Math.random() }].slice(-16));
    };
    const i = setInterval(spawn, 1100);
    const k = [];
    for (let j = 0; j < 5; j++) k.push(setTimeout(spawn, j * 220));
    return () => { cancelled = true; clearInterval(i); k.forEach(clearTimeout); };
  }, [roomId, reduceMotion]);

  const pixelFont = `'VT323', 'Courier New', monospace`;

  return (
    <div className="pod-app" style={{
      width, height,
      background: '#0a0705',
      position: 'relative', overflow: 'hidden',
      fontFamily: pixelFont,
    }}>
      {/* CRT scanlines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.3) 3px)`,
        pointerEvents: 'none', zIndex: 30,
      }}/>
      {/* amber glow vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        boxShadow: `inset 0 0 140px rgba(0,0,0,0.8), inset 0 0 60px ${roomColor}22`,
        pointerEvents: 'none', zIndex: 25,
      }}/>
      {/* static noise */}
      {!reduceMotion && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 0.5px, transparent 0.7px)`,
          backgroundSize: '3px 3px', mixBlendMode: 'screen',
          animation: 'ambient-drift 0.3s steps(3) infinite',
          opacity: 0.5, pointerEvents: 'none', zIndex: 20,
        }}/>
      )}

      <div style={{height: 54}}/>

      {/* HEADER — bunker door */}
      <div style={{
        position: 'relative', zIndex: 10,
        padding: '8px 20px 10px',
        borderBottom: `2px solid ${roomColor}66`,
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
          <div>
            <div style={{fontSize: 11, color: roomColor, letterSpacing: 2, opacity: 0.8, textTransform: 'uppercase'}}>
              ▰▰▰ BUNKER ACCESS GRANTED
            </div>
            <div style={{fontSize: 32, fontWeight: 400, color: '#fff', letterSpacing: 2, lineHeight: 1,
              textShadow: `0 0 8px ${roomColor}, 0 0 2px ${roomColor}`}}>
              {roomName.toUpperCase()}
            </div>
            <div style={{fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 1}}>
              {roomSub} · 077 SOULS INSIDE
            </div>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: 10, color: amber, letterSpacing: 1.5}}>⚠ PURGE IN</div>
            <div style={{fontSize: 22, color: amber, letterSpacing: 2,
              textShadow: `0 0 6px ${amber}`,
              fontVariantNumeric: 'tabular-nums'}}>{countdown}</div>
          </div>
        </div>
      </div>

      {/* room tabs */}
      <div style={{
        position: 'relative', zIndex: 10,
        padding: '8px 20px', display: 'flex', gap: 14,
        borderBottom: `1px dashed ${roomColor}33`,
        fontSize: 14, letterSpacing: 1,
      }}>
        {['daily','stock','job'].map(id => {
          const nm = { daily: 'LOUNGE', stock: 'WARROOM', job: 'STUDY' }[id];
          const c  = id === 'stock' ? accent : id === 'job' ? amber : green;
          const on = id === roomId;
          return (
            <div key={id} style={{
              color: on ? c : 'rgba(255,255,255,0.3)',
              textShadow: on ? `0 0 6px ${c}` : 'none',
            }}>{on ? '> ' : '  '}{nm}</div>
          );
        })}
      </div>

      {/* TRANSMISSION LOG */}
      <div style={{
        position: 'absolute', top: 220, left: 0, right: 0,
        bottom: keyboardUp ? 310 : 100,
        padding: '8px 18px',
        overflow: 'hidden', zIndex: 8,
      }}>
        <div style={{fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginBottom: 8}}>
          ── TRANSMISSION LOG ──
        </div>
        <div style={{display: 'flex', flexDirection: 'column-reverse', gap: 4}}>
          {log.slice().reverse().map((m, i) => {
            const age = i / 16;
            const op = Math.max(0.2, 1 - age * 0.7);
            const glitch = m.sig < 0.08;
            return (
              <div key={m.id} style={{
                fontSize: 16, color: '#fff',
                opacity: op, letterSpacing: 0.3,
                animation: i === 0 ? 'bunker-line-in 0.3s steps(4)' : 'none',
                filter: glitch ? 'hue-rotate(180deg)' : 'none',
              }}>
                <span style={{color: roomColor, opacity: 0.7}}>[{m.t}]</span>{' '}
                <span style={{color: amber, opacity: 0.8}}>@{m.nickname.slice(0,10).toUpperCase()}</span>{' '}
                <span className="kor" style={{fontFamily: "'Noto Sans KR', sans-serif", fontSize: 13}}>
                  {glitch ? m.text.replace(/./g, c => Math.random() < 0.3 ? '█' : c) : m.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* emergency ticker */}
      <div style={{
        position: 'absolute', bottom: keyboardUp ? 365 : 95,
        left: 0, right: 0, zIndex: 9,
        padding: '5px 18px',
        background: `${accent}22`,
        borderTop: `1px solid ${accent}55`, borderBottom: `1px solid ${accent}55`,
        fontSize: 11, color: accent, letterSpacing: 1.5,
        overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        <div style={{animation: reduceMotion ? 'none' : 'shimmer 18s linear infinite'}}>
          ⚠ EMERGENCY BROADCAST · 시장 급락 감지 · 벙커 문 개방 · 안전 위치 확보 요망 · REPEATING ⚠&nbsp;&nbsp;&nbsp;
        </div>
      </div>

      {/* input */}
      <div style={{
        position: 'absolute', bottom: keyboardUp ? 301 : 34, left: 14, right: 14, zIndex: 10,
        height: 48, display: 'flex', alignItems: 'center',
        padding: '0 8px 0 14px',
        background: '#0f0a08',
        border: `1px solid ${roomColor}77`,
        boxShadow: `inset 0 0 12px ${roomColor}22`,
      }}>
        <span style={{color: roomColor, marginRight: 8, fontSize: 15}}>▶</span>
        <div style={{flex: 1, fontSize: 15, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.3}}
          className="kor">TRANSMIT_______________</div>
        <button style={{
          height: 32, padding: '0 12px',
          background: roomColor, color: '#000',
          fontFamily: pixelFont, fontSize: 14, letterSpacing: 1,
          border: 'none', cursor: 'pointer',
        }}>SEND</button>
      </div>

      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(255,255,255,0.45)'}}/>
      </div>
    </div>
  );
}

// load VT323 pixel-ish font
if (typeof document !== 'undefined' && !document.getElementById('bunker-font')) {
  const link = document.createElement('link');
  link.id = 'bunker-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=VT323&display=swap';
  document.head.appendChild(link);
  const s = document.createElement('style');
  s.textContent = `@keyframes bunker-line-in { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }`;
  document.head.appendChild(s);
}

Object.assign(window, { ConceptBunker });
