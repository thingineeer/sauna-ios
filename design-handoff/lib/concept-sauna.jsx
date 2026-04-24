// ConceptSauna — 사우나 시안
// 냉탕(일상) / 열탕(취준) / 불가마(주식). 수건 양머리 닉네임.
// 메시지는 증기처럼 올라오며 위로 갈수록 흐려지다 증발.
// 체류 시간 제한 (30분) + 비상벨 이벤트.

function ConceptSauna({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                       keyboardUp = false }) {
  const config = {
    daily: { name: '냉탕', sub: '머리 식히는 곳', steam: '#9FD8F0',
             bg: 'linear-gradient(180deg, #2a3f55 0%, #0f1a28 100%)',
             wall: '#3a5068', accent: '#8FCFEA', sign: '♨ 16°C', count: '시원하게 12명',
             emoji: '🧊' },
    stock: { name: '불가마', sub: '계좌 지지러 왔다', steam: '#FF6B3D',
             bg: 'linear-gradient(180deg, #4a1810 0%, #1a0604 100%)',
             wall: '#5a2218', accent: '#FFAA55', sign: '🔥 88°C', count: '지글지글 77명',
             emoji: '🔥' },
    job:   { name: '열탕', sub: '정신 번쩍', steam: '#FFD4A0',
             bg: 'linear-gradient(180deg, #3a2515 0%, #1a0e08 100%)',
             wall: '#4a3020', accent: '#FFC888', sign: '♨ 42°C', count: '몸 담근 45명',
             emoji: '♨' },
  }[roomId];

  const [msgs, setMsgs] = React.useState([]);
  const idRef = React.useRef(0);
  const [sessionLeft, setSessionLeft] = React.useState(28 * 60 + 43);

  React.useEffect(() => {
    const i = setInterval(() => setSessionLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, []);

  React.useEffect(() => {
    if (reduceMotion) return;
    const bank = (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
    let cancelled = false;
    const spawn = () => {
      const m = bank[Math.floor(Math.random() * bank.length)];
      if (!m) return;
      const id = ++idRef.current;
      const x = 0.1 + Math.random() * 0.8;
      const life = 6500 + Math.random() * 2500;
      setMsgs(prev => [...prev, { id, ...m, x, spawnAt: performance.now(), life }].slice(-14));
      setTimeout(() => { if (!cancelled) setMsgs(p => p.filter(x => x.id !== id)); }, life + 400);
    };
    const i = setInterval(spawn, 1200);
    const k = [];
    for (let j = 0; j < 5; j++) k.push(setTimeout(spawn, j * 260));
    return () => { cancelled = true; clearInterval(i); k.forEach(clearTimeout); };
  }, [roomId, reduceMotion]);

  const towelNick = (nick) => '🐏 ' + nick.replace(/#\d+$/, '').slice(0, 6);

  const mm = Math.floor(sessionLeft / 60);
  const ss = sessionLeft % 60;

  return (
    <div className="pod-app" style={{
      width, height,
      background: config.bg,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* wall tiles pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${config.wall}55 1px, transparent 1px), linear-gradient(90deg, ${config.wall}55 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        opacity: 0.3, pointerEvents: 'none',
      }}/>

      {/* ambient steam clouds */}
      {!reduceMotion && [0,1,2].map(i => (
        <div key={i} style={{
          position: 'absolute', left: `${20 + i * 30}%`, bottom: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${config.steam}33 0%, transparent 65%)`,
          filter: 'blur(20px)',
          animation: `sauna-steam ${8 + i * 2}s ease-in-out ${i * 1.5}s infinite`,
          pointerEvents: 'none',
        }}/>
      ))}

      <div style={{height: 54}}/>

      {/* header — wooden sign */}
      <div style={{position: 'relative', zIndex: 10, padding: '6px 20px 10px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
          <div>
            <div className="mono" style={{fontSize: 10, color: config.accent,
              opacity: 0.7, letterSpacing: 2}}>THE SAUNA</div>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
              <span className="kor" style={{fontSize: 32, fontWeight: 700, color: '#fff',
                letterSpacing: -1, textShadow: `0 2px 8px ${config.accent}66`}}>
                {config.name}
              </span>
              <span style={{fontSize: 20}}>{config.emoji}</span>
            </div>
            <div className="kor" style={{fontSize: 12, color: 'rgba(255,255,255,0.6)'}}>
              {config.sub} · {config.count}
            </div>
          </div>
          <div style={{textAlign: 'right',
            padding: '6px 10px', borderRadius: 8,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)',
            border: `1px solid ${config.accent}44`}}>
            <div className="mono" style={{fontSize: 9, color: config.accent,
              letterSpacing: 1.5, opacity: 0.8}}>EXIT IN</div>
            <div className="mono" style={{fontSize: 18, fontWeight: 700, color: '#fff',
              letterSpacing: 1, lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums'}}>
              {String(mm).padStart(2,'0')}:{String(ss).padStart(2,'0')}
            </div>
          </div>
        </div>
      </div>

      {/* tab pool switcher */}
      <div style={{position: 'relative', zIndex: 10, padding: '6px 20px 8px',
        display: 'flex', gap: 8}}>
        {[
          {id:'daily', n:'냉탕', e:'🧊'}, {id:'job', n:'열탕', e:'♨'}, {id:'stock', n:'불가마', e:'🔥'},
        ].map(p => {
          const on = p.id === roomId;
          return (
            <div key={p.id} className="kor" style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: on ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.25)',
              color: on ? '#fff' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${on ? config.accent + '88' : 'transparent'}`,
              backdropFilter: 'blur(10px)',
            }}>{p.e} {p.n}</div>
          );
        })}
      </div>

      {/* steam stage — messages rise like vapor */}
      <div style={{
        position: 'absolute', top: 210, left: 0, right: 0,
        bottom: keyboardUp ? 310 : 100,
        overflow: 'hidden', zIndex: 8,
      }}>
        {msgs.map(m => <SteamMsg key={m.id} msg={m} config={config}
          reduceMotion={reduceMotion} width={width}/>)}

        {/* water line at bottom */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 40,
          background: `linear-gradient(180deg, transparent 0%, ${config.steam}22 60%, ${config.steam}44 100%)`,
          pointerEvents: 'none',
        }}/>
      </div>

      {/* emergency bell badge */}
      <div style={{
        position: 'absolute', top: 176, right: 20, zIndex: 12,
        padding: '4px 10px', borderRadius: 999,
        background: '#FF3355', color: '#fff',
        fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
        boxShadow: '0 2px 10px rgba(255,51,85,0.5)',
        animation: reduceMotion ? 'none' : 'counter-dot 1.4s ease-in-out infinite',
      }}>
        🔔 비상벨 연결됨
      </div>

      {/* input — "한마디 털어놓기" */}
      <div style={{
        position: 'absolute', bottom: keyboardUp ? 301 : 34,
        left: 14, right: 14, zIndex: 10, height: 50, borderRadius: 25,
        background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
        border: `1px solid ${config.accent}44`,
        display: 'flex', alignItems: 'center', padding: '0 6px 0 18px',
      }}>
        <div className="kor" style={{flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.5)'}}>
          속 시원하게 털어놓기...
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: 19, border: 'none',
          background: config.accent, color: '#000', cursor: 'pointer',
          fontSize: 16,
        }}>💬</button>
      </div>

      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(255,255,255,0.45)'}}/>
      </div>
    </div>
  );
}

function SteamMsg({ msg, config, reduceMotion, width }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (reduceMotion) { setT(0.4); return; }
    let raf;
    const tick = (n) => {
      const p = Math.min(1, (n - msg.spawnAt) / msg.life);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [msg.id, msg.spawnAt, msg.life, reduceMotion]);

  const yStart = 520;
  const yEnd = 60;
  const y = yStart + (yEnd - yStart) * t;
  const x = msg.x * width + Math.sin(t * 4) * 14;

  const opacity = t < 0.12 ? t / 0.12 : t > 0.65 ? (1 - t) / 0.35 : 1;
  const blur = t > 0.55 ? (t - 0.55) * 14 : 0;
  const scale = 0.92 + t * 0.15;

  const towelNick = '🐏 ' + msg.nickname.replace(/#\d+$/, '').slice(0, 6);

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity, filter: blur ? `blur(${blur}px)` : 'none',
      pointerEvents: 'none', willChange: 'transform, opacity',
      textAlign: 'center',
    }}>
      <div style={{
        display: 'inline-block', padding: '6px 12px',
        borderRadius: 18,
        background: `${config.steam}33`,
        backdropFilter: 'blur(4px)',
        border: `1px solid ${config.steam}55`,
        boxShadow: `0 0 18px ${config.steam}44`,
        maxWidth: 260,
      }}>
        <div className="mono" style={{fontSize: 9.5, color: config.steam,
          letterSpacing: 0.3, marginBottom: 2, opacity: 0.9}}>
          {towelNick}
        </div>
        <div className="kor" style={{fontSize: 13, fontWeight: 500, color: '#fff',
          lineHeight: 1.35, textShadow: '0 1px 3px rgba(0,0,0,0.7)',
          whiteSpace: 'normal', wordBreak: 'keep-all', textWrap: 'pretty'}}>
          {msg.text}
        </div>
      </div>
    </div>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('sauna-kf')) {
  const s = document.createElement('style');
  s.id = 'sauna-kf';
  s.textContent = `
    @keyframes sauna-steam {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
      50%      { transform: translate(20px, -40px) scale(1.3); opacity: 0.7; }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { ConceptSauna });
