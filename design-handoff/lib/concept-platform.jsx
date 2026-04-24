// ConceptPlatform — 지하철 전광판 시안
// 플랫폼 LED 사인. 방 = 노선. 메시지는 도트매트릭스로 왼쪽으로 흐름.
// "다음 열차 진입" → 새 메시지 배치 등장. 확장: 야구장/공항 전광판.

function ConceptPlatform({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                           keyboardUp = false }) {
  const config = {
    daily: { line: '2호선', lineColor: '#3FC13F', name: '일상행', dest: '퇴근',
             eta: '2분', sub: '순환선', code: 'L2' },
    stock: { line: '9호선', lineColor: '#D4AA00', name: '주식행', dest: '불타는코스피',
             eta: '지연', sub: '급행', code: 'L9' },
    job:   { line: '분당선', lineColor: '#FFB44F', name: '취준행', dest: '대기실',
             eta: '4분', sub: '일반', code: 'LB' },
  }[roomId];

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
      setMsgs(prev => [...prev, { id, ...m, spawnAt: performance.now() }].slice(-6));
      setTimeout(() => { if (!cancelled) setMsgs(p => p.filter(x => x.id !== id)); }, 12000);
    };
    const i = setInterval(spawn, 1700);
    const k = [];
    for (let j = 0; j < 3; j++) k.push(setTimeout(spawn, j * 500));
    return () => { cancelled = true; clearInterval(i); k.forEach(clearTimeout); };
  }, [roomId, reduceMotion]);

  return (
    <div className="pod-app" style={{
      width, height,
      background: '#0f1015',
      position: 'relative', overflow: 'hidden',
      color: '#fff',
    }}>
      <div style={{height: 54}}/>

      {/* line badge + station header */}
      <div style={{padding: '4px 20px 0'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6}}>
          <div style={{
            width: 46, height: 46, borderRadius: '50%',
            background: config.lineColor, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 20,
            fontFamily: '-apple-system, sans-serif',
            letterSpacing: -0.5,
            boxShadow: `0 0 18px ${config.lineColor}55`,
          }}>{config.code.slice(1)}</div>
          <div>
            <div className="mono" style={{fontSize: 10, color: 'rgba(255,255,255,0.4)',
              letterSpacing: 1.5}}>PLATFORM {config.code}</div>
            <div className="kor" style={{fontSize: 22, fontWeight: 700,
              letterSpacing: -0.3, lineHeight: 1.15}}>
              {config.line} · <span style={{color: config.lineColor}}>{config.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* NEXT TRAIN sign — big orange dot-matrix */}
      <div style={{margin: '8px 14px 0', padding: '14px 18px',
        background: '#050508',
        border: '1px solid rgba(255,136,0,0.25)',
        borderRadius: 8,
        boxShadow: 'inset 0 0 30px rgba(255,136,0,0.1)',
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
          <div className="mono" style={{fontSize: 10, color: 'rgba(255,136,0,0.65)',
            letterSpacing: 1.5}}>▶ NEXT TRAIN</div>
          <div className="mono" style={{fontSize: 10, color: 'rgba(255,136,0,0.65)',
            letterSpacing: 1.5}}>도착 ETA</div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginTop: 4}}>
          <div className="kor" style={{fontSize: 26, fontWeight: 700, color: '#FF8800',
            letterSpacing: 0.5, lineHeight: 1,
            textShadow: '0 0 8px rgba(255,136,0,0.7)',
          }}>
            {config.dest}行
          </div>
          <div className="mono" style={{fontSize: 32, fontWeight: 700, color: '#FF8800',
            letterSpacing: 1, lineHeight: 1,
            textShadow: '0 0 8px rgba(255,136,0,0.7)',
          }}>{config.eta}</div>
        </div>
        <div style={{marginTop: 8, fontSize: 10, color: 'rgba(255,136,0,0.4)',
          letterSpacing: 1, fontFamily: "'JetBrains Mono', monospace"}}>
          {config.sub} · 승강장 안전문 작동 중
        </div>
      </div>

      {/* route — other lines as chips */}
      <div style={{padding: '10px 18px 4px', display: 'flex', gap: 6, alignItems: 'center',
        overflowX: 'auto'}}>
        {[
          {id:'daily', code:'2', n:'일상', c:'#3FC13F'},
          {id:'stock', code:'9', n:'주식', c:'#D4AA00'},
          {id:'job',   code:'B', n:'취준', c:'#FFB44F'},
          {id:'baseball', code:'KBO', n:'야구', c:'#FF3333', soon:true},
          {id:'worldcup', code:'★',   n:'월드컵', c:'#6C5CE7', soon:true},
        ].map(r => {
          const on = r.id === roomId;
          return (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 9px', borderRadius: 999,
              background: on ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: `1px solid ${on ? r.c + '88' : 'rgba(255,255,255,0.08)'}`,
              fontSize: 11, flexShrink: 0,
              opacity: r.soon ? 0.45 : 1,
            }}>
              <span style={{
                width: 16, height: 16, borderRadius: '50%',
                background: r.c, color: '#fff', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 800,
              }}>{r.code}</span>
              <span className="kor" style={{color: on ? '#fff' : 'rgba(255,255,255,0.5)'}}>
                {r.n}{r.soon && ' SOON'}
              </span>
            </div>
          );
        })}
      </div>

      {/* ANNOUNCEMENTS — scrolling LED board */}
      <div style={{margin: '10px 14px 0', padding: '12px 0',
        background: '#050508', border: '1px solid rgba(255,180,0,0.15)',
        borderRadius: 4,
      }}>
        <div style={{padding: '0 14px 8px', fontSize: 10, color: 'rgba(255,180,0,0.5)',
          letterSpacing: 1.5, fontFamily: "'JetBrains Mono', monospace",
          display: 'flex', justifyContent: 'space-between'}}>
          <span>■ 공지 · 승객 안내</span>
          <span>{msgs.length.toString().padStart(2,'0')}건</span>
        </div>
        <div style={{height: 360, overflow: 'hidden', position: 'relative'}}>
          {msgs.slice().reverse().map((m, i) => (
            <DotMatrixLine key={m.id} msg={m} index={i} color="#FFAA00"
              reduceMotion={reduceMotion}/>
          ))}
        </div>
      </div>

      {/* input */}
      <div style={{
        position: 'absolute', bottom: keyboardUp ? 301 : 34,
        left: 14, right: 14, zIndex: 10, height: 50, borderRadius: 8,
        background: '#1a1a22', border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', padding: '0 6px 0 14px',
      }}>
        <span className="mono" style={{fontSize: 11, color: config.lineColor,
          letterSpacing: 1, marginRight: 8}}>▶ ANNOUNCE</span>
        <div className="kor" style={{flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.4)'}}>
          승객분들께 알릴 내용...
        </div>
        <button style={{
          height: 38, padding: '0 14px', borderRadius: 4, border: 'none',
          background: config.lineColor, color: '#000', cursor: 'pointer',
          fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
        }}>송출</button>
      </div>

      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(255,255,255,0.45)'}}/>
      </div>
    </div>
  );
}

function DotMatrixLine({ msg, index, color, reduceMotion }) {
  const op = Math.max(0.25, 1 - index * 0.18);
  const nickShort = msg.nickname.replace(/#\d+$/, '').slice(0, 8);
  return (
    <div style={{
      padding: '5px 14px',
      opacity: op,
      animation: index === 0 && !reduceMotion
        ? 'platform-row-in 420ms cubic-bezier(0.2,0.9,0.3,1)' : 'none',
      display: 'flex', alignItems: 'baseline', gap: 10,
      borderBottom: '1px dashed rgba(255,180,0,0.08)',
    }}>
      <span className="mono" style={{fontSize: 10, color: color, opacity: 0.55,
        letterSpacing: 0.5, flexShrink: 0}}>
        {String(msg.id).padStart(3,'0')}
      </span>
      <span className="mono" style={{fontSize: 10.5, color: color, opacity: 0.85,
        letterSpacing: 1, flexShrink: 0, minWidth: 68,
        textShadow: `0 0 3px ${color}66`}}>
        @{nickShort}
      </span>
      <span className="kor" style={{fontSize: 13, color: '#fff',
        lineHeight: 1.3, textWrap: 'pretty',
        textShadow: `0 0 4px ${color}33`}}>
        {msg.text}
      </span>
    </div>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('platform-kf')) {
  const s = document.createElement('style');
  s.id = 'platform-kf';
  s.textContent = `
    @keyframes platform-row-in {
      0%   { opacity: 0; transform: translateX(10px); filter: brightness(2); }
      60%  { opacity: 1; filter: brightness(1.4); }
      100% { opacity: 1; transform: translateX(0); filter: brightness(1); }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { ConceptPlatform });
