// ConceptBubbleDeep — 비눗방울 v2 (고도화)
// + 탭해서 터뜨리기 (실제 pop + shine burst 파편)
// + 내 방울은 골드 하이라이트 + 중앙에서 출발
// + 방 전환 시 기존 방울 모두 떠올라 사라짐 + 새 방 색수차 막 내려옴
// + 하단 '내가 보낸 방울' 카운터
// + 빈 방 상태 (정적인 bg + "아직 아무도 없어요")

function ConceptBubbleDeep({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                            keyboardUp = false, emptyState = false, showComposer = false }) {
  const config = {
    daily: { name: '오늘의 방울', sub: 'DAILY · 떠 있다 터진다',
             bg1: '#1a2e5a', bg2: '#0a1228', accent: '#7FB8FF', film: 'rgba(127,184,255,0.15)',
             headCount: 142 },
    stock: { name: '주식의 방울', sub: 'STOCK · 장 중엔 많이 올라옴',
             bg1: '#3a2a0a', bg2: '#1a1204', accent: '#F4C947', film: 'rgba(244,201,71,0.15)',
             headCount: 88 },
    job:   { name: '취준의 방울', sub: 'JOB · 합격의 기원',
             bg1: '#0e2a2a', bg2: '#061515', accent: '#5FE6B8', film: 'rgba(95,230,184,0.15)',
             headCount: 56 },
  }[roomId];

  const [bubbles, setBubbles] = React.useState([]);
  const [popping, setPopping] = React.useState([]);
  const idRef = React.useRef(0);
  const [myCount, setMyCount] = React.useState(3);
  const MY_ID = 'me';

  React.useEffect(() => {
    if (reduceMotion || emptyState) return;
    const bank = (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
    let cancelled = false;
    let myTurn = 0;
    const spawn = (isMine = false) => {
      const m = bank[Math.floor(Math.random() * bank.length)];
      if (!m) return;
      const id = ++idRef.current;
      const size = 70 + Math.min(120, m.text.length * 3.5);
      const xRatio = isMine ? 0.5 : 0.12 + Math.random() * 0.76;
      const duration = 10500 + Math.random() * 3500;
      const drift = (Math.random() - 0.5) * 30;
      setBubbles(prev => [...prev, {
        id, ...m, size, xRatio, drift,
        spawnAt: performance.now(), duration,
        senderId: isMine ? MY_ID : 'u' + id,
      }].slice(-11));
      setTimeout(() => {
        if (!cancelled) setBubbles(p => p.filter(b => b.id !== id));
      }, duration + 400);
    };
    const i = setInterval(spawn, 1500);
    const mineTimer = setInterval(() => { if (Math.random() < 0.25) spawn(true); }, 5000);
    const k = [];
    for (let j = 0; j < 4; j++) k.push(setTimeout(spawn, j * 380));
    return () => { cancelled = true; clearInterval(i); clearInterval(mineTimer); k.forEach(clearTimeout); };
  }, [roomId, reduceMotion, emptyState]);

  const popBubble = (b) => {
    if (reduceMotion) return;
    setBubbles(prev => prev.filter(x => x.id !== b.id));
    const now = performance.now();
    setPopping(prev => [...prev, { ...b, poppedAt: now, x: b.xRatio * width }]);
    setTimeout(() => setPopping(p => p.filter(x => x.id !== b.id)), 900);
  };

  return (
    <div className="pod-app" style={{
      width, height,
      background: `radial-gradient(ellipse at 50% 20%, ${config.bg1} 0%, ${config.bg2} 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* chromatic film — soap film at top edge */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 140,
        background: `linear-gradient(180deg, ${config.film} 0%, transparent 100%)`,
        pointerEvents: 'none',
      }}/>

      <div style={{height: 54}}/>

      {/* Header */}
      <div style={{position: 'relative', zIndex: 10, padding: '4px 22px 8px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
        <div>
          <div className="mono" style={{fontSize: 10, color: config.accent,
            letterSpacing: 2, opacity: 0.8}}>{config.sub}</div>
          <div className="kor" style={{fontSize: 28, fontWeight: 700, color: '#fff',
            letterSpacing: -0.5, lineHeight: 1.1}}>{config.name}</div>
          <div className="kor" style={{fontSize: 11, color: 'rgba(255,255,255,0.55)',
            marginTop: 2}}>떠 있는 방울 {bubbles.length}개 · {config.headCount}명 접속</div>
        </div>
        <div style={{
          padding: '5px 10px', borderRadius: 10,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
          border: `1px solid ${config.accent}44`,
          textAlign: 'right',
        }}>
          <div className="mono" style={{fontSize: 9, letterSpacing: 1.5,
            color: config.accent, opacity: 0.8}}>MY BUBBLES</div>
          <div style={{fontSize: 20, fontWeight: 700, color: '#fff',
            fontFamily: "'JetBrains Mono', monospace", lineHeight: 1}}>
            {String(myCount).padStart(2,'0')}
          </div>
        </div>
      </div>

      {/* Room chips */}
      <div style={{position: 'relative', zIndex: 10, padding: '0 22px 8px',
        display: 'flex', gap: 6}}>
        {['daily','stock','job'].map(id => {
          const on = id === roomId;
          const c = id === 'daily' ? '#7FB8FF' : id === 'stock' ? '#F4C947' : '#5FE6B8';
          const n = id === 'daily' ? '오늘의' : id === 'stock' ? '주식의' : '취준의';
          return (
            <div key={id} className="kor" style={{
              padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: on ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.3)',
              color: on ? '#fff' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${on ? c + '88' : 'transparent'}`,
              backdropFilter: 'blur(10px)',
            }}>{n} 방울</div>
          );
        })}
      </div>

      {/* Bubble field */}
      <div style={{position: 'absolute', top: 196, left: 0, right: 0,
        bottom: keyboardUp ? 310 : (showComposer ? 160 : 100),
        overflow: 'hidden', zIndex: 8}}>
        {bubbles.map(b => (
          <BubbleOrb key={b.id} b={b} config={config} width={width}
            reduceMotion={reduceMotion} onPop={popBubble}
            isMine={b.senderId === MY_ID}/>
        ))}
        {popping.map(p => <BubblePop key={p.id} p={p} config={config}/>)}

        {emptyState && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: 10,
            color: 'rgba(255,255,255,0.4)',
          }}>
            <div style={{fontSize: 48, opacity: 0.3}}>🫧</div>
            <div className="kor" style={{fontSize: 14}}>아직 아무 방울도 없어요</div>
            <div className="kor" style={{fontSize: 11, color: 'rgba(255,255,255,0.25)'}}>
              첫 방울을 띄워보세요
            </div>
          </div>
        )}
      </div>

      {/* Composer — inline above input for "showComposer" state */}
      {showComposer && (
        <div style={{
          position: 'absolute', bottom: 96, left: 16, right: 16, zIndex: 12,
          padding: '14px 16px', borderRadius: 20,
          background: `linear-gradient(180deg, rgba(255,255,255,0.1) 0%, ${config.film} 100%)`,
          backdropFilter: 'blur(16px)',
          border: `1.5px solid ${config.accent}66`,
          boxShadow: `0 10px 40px ${config.accent}22`,
        }}>
          <div className="mono" style={{fontSize: 9, color: config.accent,
            letterSpacing: 1.5, marginBottom: 4}}>NEW BUBBLE · 미리보기</div>
          <div className="kor" style={{fontSize: 14, color: '#fff', lineHeight: 1.4}}>
            오늘 저녁 뭐먹지… 치킨 각?
          </div>
          <div style={{marginTop: 8, display: 'flex', gap: 4, alignItems: 'center'}}>
            <div style={{width: 28, height: 28, borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7) 0%, ${config.accent}66 60%, transparent 80%)`,
              boxShadow: `0 0 8px ${config.accent}`,}}/>
            <span className="mono" style={{fontSize: 10, color: 'rgba(255,255,255,0.5)'}}>
              이 방울은 12초 떠 있다 터집니다
            </span>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{
        position: 'absolute', bottom: keyboardUp ? 301 : 34,
        left: 14, right: 14, zIndex: 10, height: 50, borderRadius: 25,
        background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
        border: `1px solid ${config.accent}44`,
        display: 'flex', alignItems: 'center', padding: '0 6px 0 18px',
      }}>
        <div className="kor" style={{flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.5)'}}>
          한 마디 방울 띄우기...
        </div>
        <button style={{
          width: 38, height: 38, borderRadius: 19, border: 'none',
          background: config.accent, color: '#000', cursor: 'pointer', fontSize: 16,
        }}>🫧</button>
      </div>

      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(255,255,255,0.45)'}}/>
      </div>
    </div>
  );
}

function BubbleOrb({ b, config, width, reduceMotion, onPop, isMine }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (reduceMotion) { setT(0.4); return; }
    let raf;
    const tick = (n) => {
      const p = Math.min(1, (n - b.spawnAt) / b.duration);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [b.id, reduceMotion]);

  const yStart = 620, yEnd = 40;
  const y = yStart + (yEnd - yStart) * t;
  const x = b.xRatio * width + Math.sin(t * 3.5) * 16 + b.drift * t;
  const opacity = t < 0.08 ? t / 0.08 : t > 0.9 ? (1 - t) / 0.1 : 1;
  const scale = 0.85 + Math.min(0.3, t * 1.2);

  return (
    <div
      onClick={() => onPop(b)}
      style={{
        position: 'absolute', left: x - b.size/2, top: y - b.size/2,
        width: b.size, height: b.size, borderRadius: '50%',
        transform: `scale(${scale})`,
        opacity, cursor: 'pointer',
        background: isMine
          ? `radial-gradient(circle at 30% 30%,
              rgba(255,255,255,0.75) 0%,
              rgba(255,215,80,0.35) 35%,
              rgba(255,180,40,0.15) 70%,
              transparent 85%)`
          : `radial-gradient(circle at 30% 30%,
              rgba(255,255,255,0.55) 0%,
              ${config.accent}55 40%,
              ${config.accent}22 70%,
              transparent 85%)`,
        boxShadow: isMine
          ? `inset 0 0 20px rgba(255,215,80,0.35), 0 0 24px rgba(255,180,40,0.4)`
          : `inset 0 0 18px ${config.accent}44, 0 0 18px ${config.accent}33`,
        border: isMine ? `1.5px solid rgba(255,215,80,0.7)` : `1px solid ${config.accent}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        willChange: 'transform, opacity, top',
      }}>
      <div className="kor" style={{
        fontSize: Math.min(13, Math.max(10, b.size * 0.14)),
        color: '#fff', fontWeight: 500, textAlign: 'center',
        padding: '0 14%', lineHeight: 1.25,
        textShadow: '0 1px 3px rgba(0,0,0,0.6)',
        pointerEvents: 'none', textWrap: 'pretty', wordBreak: 'keep-all',
      }}>{b.text}</div>
      {/* highlight sheen */}
      <div style={{
        position: 'absolute', top: '10%', left: '18%',
        width: '28%', height: '22%', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.75) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>
    </div>
  );
}

function BubblePop({ p, config }) {
  return (
    <div style={{
      position: 'absolute', left: p.x, top: '40%',
      width: p.size, height: p.size,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      animation: 'bubble-pop-burst 0.9s ease-out forwards',
    }}>
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <div key={i} style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 5, height: 5, borderRadius: '50%',
            background: '#fff',
            boxShadow: `0 0 6px ${config.accent}`,
            transform: `translate(-50%, -50%) rotate(${angle}rad) translateY(-${p.size * 0.45}px)`,
            animation: `bubble-shard-${i} 0.8s ease-out forwards`,
          }}/>
        );
      })}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: `2px solid ${config.accent}`,
        animation: 'bubble-ring-expand 0.9s ease-out forwards',
      }}/>
    </div>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('bubble-deep-kf')) {
  const s = document.createElement('style');
  s.id = 'bubble-deep-kf';
  let shards = '';
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const dx = Math.cos(ang) * 60, dy = Math.sin(ang) * 60;
    shards += `@keyframes bubble-shard-${i} {
      from { transform: translate(-50%, -50%) rotate(${ang}rad) translateY(-40px); opacity: 1; }
      to   { transform: translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${ang}rad) translateY(-0px); opacity: 0; }
    }`;
  }
  s.textContent = shards + `
    @keyframes bubble-pop-burst {
      0% { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes bubble-ring-expand {
      from { transform: scale(0.3); opacity: 1; border-width: 3px; }
      to   { transform: scale(1.8); opacity: 0; border-width: 0.5px; }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { ConceptBubbleDeep });
