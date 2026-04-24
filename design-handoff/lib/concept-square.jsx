// ConceptSquare — 광장 시안
// 미니멀하고 깨끗한 흰빛 UI. 사건 발생 시 사이렌 점멸.
// 100명 가득차면 가장 오래된 메시지부터 밀려남.
// 온도계 시스템 — 대화 속도로 방 온도 상승.

function ConceptSquare({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                        keyboardUp = false }) {
  const room = TOKENS.rooms[roomId];
  const accent = room.accent;
  const roomName = { daily: '아무나 광장', stock: '차트 광장', job: '합격 광장' }[roomId];

  const [msgs, setMsgs] = React.useState([]);
  const idRef = React.useRef(0);
  const [temp, setTemp] = React.useState(42);
  const [siren, setSiren] = React.useState(false);

  React.useEffect(() => {
    if (reduceMotion) return;
    const bank = (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
    let cancelled = false;
    const spawn = () => {
      const m = bank[Math.floor(Math.random() * bank.length)];
      if (!m) return;
      const id = ++idRef.current;
      setMsgs(prev => [...prev, { id, ...m, spawnAt: performance.now() }].slice(-18));
      setTemp(t => Math.min(99, t + 0.6 + Math.random() * 0.8));
    };
    const i = setInterval(spawn, 950);
    const cool = setInterval(() => setTemp(t => Math.max(30, t - 0.4)), 500);
    const k = [];
    for (let j = 0; j < 8; j++) k.push(setTimeout(spawn, j * 200));
    return () => { cancelled = true; clearInterval(i); clearInterval(cool); k.forEach(clearTimeout); };
  }, [roomId, reduceMotion]);

  // siren pulse when temp hot
  React.useEffect(() => {
    if (temp > 85 && !siren) setSiren(true);
    else if (temp < 70 && siren) setSiren(false);
  }, [temp, siren]);

  const tempColor = temp > 85 ? '#FF3355' : temp > 65 ? '#FF9933' : accent;

  return (
    <div className="pod-app" style={{
      width, height,
      background: siren && !reduceMotion
        ? `linear-gradient(180deg, #fff0f0 0%, #ffffff 100%)`
        : '#fafafa',
      position: 'relative', overflow: 'hidden',
      color: '#0a0a0f',
      transition: 'background 400ms',
      animation: siren && !reduceMotion ? 'square-siren 1.4s ease-in-out infinite' : 'none',
    }}>
      <div style={{height: 54}}/>

      {/* header */}
      <div style={{
        position: 'relative', zIndex: 10, padding: '8px 22px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{fontSize: 11, color: 'rgba(0,0,0,0.4)', letterSpacing: 1,
            fontFamily: "'JetBrains Mono', monospace", marginBottom: 2}}>THE SQUARE</div>
          <div className="kor" style={{fontSize: 26, fontWeight: 700, color: '#0a0a0f',
            letterSpacing: -0.5, lineHeight: 1}}>{roomName}</div>
          <div style={{fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 3}}>
            지금 <b style={{color: '#0a0a0f'}}>1,247명</b>이 있어요 · 정원 3,000
          </div>
        </div>
        <Thermometer temp={temp} color={tempColor}/>
      </div>

      {/* room chips */}
      <div style={{position: 'relative', zIndex: 10, padding: '0 22px 10px',
        display: 'flex', gap: 8, borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 12}}>
        {['daily','stock','job'].map(id => {
          const nm = { daily: '아무나', stock: '차트', job: '합격' }[id];
          const on = id === roomId;
          const c = TOKENS.rooms[id].accent;
          return (
            <div key={id} className="kor" style={{
              padding: '5px 11px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: on ? '#0a0a0f' : 'transparent',
              color: on ? c : 'rgba(0,0,0,0.4)',
              border: on ? 'none' : '1px solid rgba(0,0,0,0.12)',
            }}>{nm}</div>
          );
        })}
      </div>

      {/* hot badge */}
      {temp > 85 && (
        <div style={{position: 'relative', zIndex: 10, padding: '6px 22px'}}>
          <div style={{
            padding: '5px 11px', borderRadius: 6, background: '#FF3355', color: '#fff',
            fontSize: 11, fontWeight: 700, letterSpacing: 0.3, display: 'inline-block',
          }}>
            🔥 핫플레이스 · 메인 화면 노출 중
          </div>
        </div>
      )}

      {/* message flow — newest top, slides down */}
      <div style={{
        position: 'absolute', top: 210, left: 0, right: 0,
        bottom: keyboardUp ? 310 : 100,
        overflow: 'hidden', zIndex: 8,
        padding: '4px 22px 0',
      }}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          {msgs.slice().reverse().map((m, i) => {
            const age = i / 18;
            const op = Math.max(0.15, 1 - age * 1.1);
            const translateX = Math.pow(age, 2) * -30;
            return (
              <div key={m.id} style={{
                opacity: op, transform: `translateX(${translateX}px)`,
                transition: 'all 500ms cubic-bezier(0.33,1,0.68,1)',
                animation: i === 0 ? 'square-msg-in 400ms cubic-bezier(0.33,1,0.68,1)' : 'none',
                display: 'flex', alignItems: 'baseline', gap: 8,
              }}>
                <span className="mono" style={{fontSize: 10, color: 'rgba(0,0,0,0.35)',
                  flexShrink: 0, minWidth: 72}}>@{m.nickname.slice(0,8)}</span>
                <span className="kor" style={{fontSize: 14, color: '#0a0a0f',
                  fontWeight: 500, lineHeight: 1.4, textWrap: 'pretty'}}>{m.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* input */}
      <div style={{
        position: 'absolute', bottom: keyboardUp ? 301 : 34,
        left: 16, right: 16, zIndex: 10, height: 50, borderRadius: 25,
        background: '#fff', border: '1.5px solid rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', padding: '0 6px 0 20px',
      }}>
        <div className="kor" style={{flex: 1, fontSize: 14, color: 'rgba(0,0,0,0.35)'}}>
          {room.placeholder}
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: 19, border: 'none',
          background: '#0a0a0f', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h12m-5-5l5 5-5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(0,0,0,0.35)'}}/>
      </div>

      {/* status bar recolor overlay */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 150,
        pointerEvents: 'none'}}>
        <style>{`.pod-app svg rect { fill: #0a0a0f !important; }`}</style>
      </div>
    </div>
  );
}

function Thermometer({ temp, color }) {
  const pct = Math.min(100, temp);
  return (
    <div style={{textAlign: 'right'}}>
      <div style={{fontSize: 10, color: 'rgba(0,0,0,0.4)', letterSpacing: 1,
        fontFamily: "'JetBrains Mono', monospace"}}>TEMPERATURE</div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 2, justifyContent: 'flex-end'}}>
        <span className="mono" style={{fontSize: 28, fontWeight: 700, color, lineHeight: 1}}>
          {Math.round(temp)}
        </span>
        <span className="mono" style={{fontSize: 13, color, opacity: 0.7}}>°</span>
      </div>
      <div style={{width: 110, height: 4, background: 'rgba(0,0,0,0.08)',
        borderRadius: 2, marginTop: 4, overflow: 'hidden'}}>
        <div style={{width: `${pct}%`, height: '100%', background: color,
          transition: 'width 300ms', boxShadow: `0 0 6px ${color}`}}/>
      </div>
    </div>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('square-kf')) {
  const s = document.createElement('style');
  s.id = 'square-kf';
  s.textContent = `
    @keyframes square-siren {
      0%, 100% { background: #fafafa; }
      50%      { background: #ffe0e5; }
    }
    @keyframes square-msg-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { ConceptSquare });
