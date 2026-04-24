// ConceptPager — 삐삐/호출기 시안
// 90년대 아날로그 호출기. 방 = 채널 번호. 숫자 코드 + 짧은 메시지 조합.
// 메시지는 삐삐 소리와 함께 도트 LCD에 찍히듯 나타남.
// 8282(빨리빨리) 486(사랑해) 같은 밀레니얼 디지털 문화 오마주.
// 확장: 야구 = "KBO", 월드컵 = "WCP".

function ConceptPager({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                       keyboardUp = false }) {
  const config = {
    daily: { channel: '*012', name: 'DAILY.CH', accent: '#2E7D4B', lcdBg: '#B8C8A0',
             lcdFg: '#1a2a1a', shellFg: 'rgba(240,245,230,0.95)' },
    stock: { channel: '*827', name: 'STOCK.CH', accent: '#8B5E00', lcdBg: '#D4C080',
             lcdFg: '#2a1f00', shellFg: 'rgba(255,245,220,0.95)' },
    job:   { channel: '*119', name: 'JOB.CH',   accent: '#2E5080', lcdBg: '#A8B8D0',
             lcdFg: '#0a1830', shellFg: 'rgba(230,240,255,0.95)' },
  }[roomId];

  const [msgs, setMsgs] = React.useState([]);
  const idRef = React.useRef(0);

  const codes = {
    daily: ['8282', '1004', '0486', '2828', '5882', '7942'],
    stock: ['9393', '4989', '2424', '9999', '0404', '1111'],
    job:   ['7942', '1111', '0815', '3939', '0143', '9988'],
  };

  React.useEffect(() => {
    if (reduceMotion) return;
    const bank = (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
    const codeList = codes[roomId];
    let cancelled = false;
    const spawn = () => {
      const m = bank[Math.floor(Math.random() * bank.length)];
      if (!m) return;
      const id = ++idRef.current;
      const code = codeList[Math.floor(Math.random() * codeList.length)];
      const ts = new Date();
      const tStr = `${String(ts.getHours()).padStart(2,'0')}:${String(ts.getMinutes()).padStart(2,'0')}`;
      setMsgs(prev => [...prev, { id, ...m, code, t: tStr,
        spawnAt: performance.now() }].slice(-5));
    };
    const i = setInterval(spawn, 2000);
    const k = [];
    for (let j = 0; j < 3; j++) k.push(setTimeout(spawn, j * 500));
    return () => { cancelled = true; clearInterval(i); k.forEach(clearTimeout); };
  }, [roomId, reduceMotion]);

  const lcdFont = `'VT323', 'Courier New', monospace`;

  return (
    <div className="pod-app" style={{
      width, height,
      background: `radial-gradient(ellipse at top, #2a2825 0%, #0a0907 100%)`,
      position: 'relative', overflow: 'hidden',
      color: '#fff',
    }}>
      <div style={{height: 54}}/>

      {/* title bar */}
      <div style={{padding: '6px 22px 8px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline'}}>
        <div>
          <div className="mono" style={{fontSize: 10, color: 'rgba(255,255,255,0.45)',
            letterSpacing: 2.5}}>PAGE-R · MOTOROLA LX-2</div>
          <div style={{fontSize: 26, fontWeight: 800, color: '#fff',
            letterSpacing: 1, lineHeight: 1,
            fontFamily: "'JetBrains Mono', monospace"}}>
            {config.name}
          </div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div className="mono" style={{fontSize: 10, color: config.accent,
            letterSpacing: 1.5, opacity: 0.8}}>CHANNEL</div>
          <div style={{fontSize: 22, color: config.accent, fontWeight: 700,
            fontFamily: lcdFont, letterSpacing: 2,
            textShadow: `0 0 6px ${config.accent}66`}}>{config.channel}</div>
        </div>
      </div>

      {/* channel chips */}
      <div style={{padding: '4px 22px 10px', display: 'flex', gap: 6, flexWrap: 'wrap'}}>
        {[
          {id:'daily',  ch:'*012', n:'DAILY'},
          {id:'stock',  ch:'*827', n:'STOCK'},
          {id:'job',    ch:'*119', n:'JOB'},
          {id:'baseball', ch:'*KBO', n:'BASEBALL', soon:true},
          {id:'worldcup', ch:'*FIFA', n:'WORLDCUP', soon:true},
        ].map(r => {
          const on = r.id === roomId;
          return (
            <div key={r.id} style={{
              padding: '4px 9px',
              fontSize: 10, fontWeight: 600, letterSpacing: 1,
              fontFamily: "'JetBrains Mono', monospace",
              background: on ? config.accent : 'rgba(255,255,255,0.05)',
              color: on ? '#000' : 'rgba(255,255,255,0.5)',
              borderRadius: 3, opacity: r.soon ? 0.4 : 1,
            }}>{r.ch} {r.n}</div>
          );
        })}
      </div>

      {/* pager device */}
      <div style={{margin: '4px 14px 0', padding: 16,
        background: `linear-gradient(180deg, #4a4640 0%, #2a2826 100%)`,
        borderRadius: 18,
        boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.08), 0 10px 30px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.6)',
      }}>
        {/* speaker grill */}
        <div style={{display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 10}}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{width: 4, height: 4, borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)'}}/>
          ))}
        </div>

        {/* LCD screen */}
        <div style={{
          background: config.lcdBg,
          borderRadius: 4,
          padding: '14px 14px 12px',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.25), 0 0 0 2px rgba(0,0,0,0.4)',
          fontFamily: lcdFont,
          color: config.lcdFg,
          minHeight: 400,
          position: 'relative',
        }}>
          {/* LCD scan pattern */}
          <div style={{position: 'absolute', inset: 0,
            backgroundImage: `repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 3px)`,
            pointerEvents: 'none', borderRadius: 4}}/>

          {/* header row */}
          <div style={{display: 'flex', justifyContent: 'space-between',
            fontSize: 14, letterSpacing: 1,
            borderBottom: '1px dashed rgba(0,0,0,0.2)',
            paddingBottom: 6, marginBottom: 8,
            position: 'relative', zIndex: 2,
          }}>
            <span>▶ INBOX · {String(msgs.length).padStart(2,'0')}/99</span>
            <span style={{display: 'flex', alignItems: 'center', gap: 4}}>
              <span style={{animation: reduceMotion ? 'none' : 'counter-dot 1s steps(2) infinite'}}>●</span>
              SIGNAL
            </span>
          </div>

          {/* messages — newest top */}
          <div style={{position: 'relative', zIndex: 2}}>
            {msgs.slice().reverse().map((m, i) => {
              const nickShort = m.nickname.replace(/#\d+$/, '').slice(0, 6).toUpperCase();
              return (
                <div key={m.id} style={{
                  marginBottom: 10,
                  animation: i === 0 && !reduceMotion
                    ? 'pager-beep 400ms steps(3)' : 'none',
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between',
                    fontSize: 14, letterSpacing: 1.5, opacity: 0.75}}>
                    <span>FROM: {nickShort}</span>
                    <span>{m.t}</span>
                  </div>
                  <div style={{fontSize: 28, letterSpacing: 4, fontWeight: 700,
                    lineHeight: 1.1, marginTop: 1}}>
                    {m.code}
                  </div>
                  <div className="kor" style={{
                    fontFamily: "'Noto Sans KR', sans-serif",
                    fontSize: 13, fontWeight: 500,
                    lineHeight: 1.35, marginTop: 2,
                    textWrap: 'pretty',
                  }}>
                    └ {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* empty slots */}
          {msgs.length === 0 && (
            <div style={{fontSize: 16, opacity: 0.4, letterSpacing: 1,
              position: 'relative', zIndex: 2}}>
              WAITING FOR PAGE...
              <div style={{marginTop: 6, fontSize: 13}}>&gt;_</div>
            </div>
          )}
        </div>

        {/* buttons */}
        <div style={{display: 'flex', gap: 8, marginTop: 12, justifyContent: 'center'}}>
          {['READ','SAVE','MENU'].map(b => (
            <div key={b} style={{
              padding: '6px 14px', fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
              fontFamily: "'JetBrains Mono', monospace",
              background: 'linear-gradient(180deg, #6a645c, #3a3632)',
              color: 'rgba(255,255,255,0.7)',
              borderRadius: 4,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 4px rgba(0,0,0,0.5)',
            }}>{b}</div>
          ))}
        </div>
      </div>

      {/* input — "send a page" */}
      <div style={{
        position: 'absolute', bottom: keyboardUp ? 301 : 34,
        left: 14, right: 14, zIndex: 10, height: 50, borderRadius: 8,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${config.accent}55`,
        display: 'flex', alignItems: 'center', padding: '0 6px 0 14px',
      }}>
        <span className="mono" style={{fontSize: 11, color: config.accent,
          letterSpacing: 1.5, marginRight: 10}}>▶ SEND PAGE</span>
        <div className="kor" style={{flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.4)'}}>
          숫자 또는 한마디...
        </div>
        <button style={{
          height: 38, padding: '0 14px', borderRadius: 4, border: 'none',
          background: config.accent, color: '#fff', cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, fontWeight: 700, letterSpacing: 1,
        }}>PAGE</button>
      </div>

      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(255,255,255,0.45)'}}/>
      </div>
    </div>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('pager-kf')) {
  const s = document.createElement('style');
  s.id = 'pager-kf';
  s.textContent = `
    @keyframes pager-beep {
      0%   { opacity: 0; filter: brightness(2.5); transform: scale(1.01); }
      60%  { opacity: 1; filter: brightness(1.3); }
      100% { opacity: 1; filter: brightness(1); transform: scale(1); }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { ConceptPager });
