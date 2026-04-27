// ConceptBubble — Soap Bubble 시안
//
// 메타포: 비눗방울이 바닥에서 떠올라 랜덤 경로로 부유하다가 터진다.
// 휘발성을 "터짐"으로 시각화. 몽글몽글한 정서 + 갑작스러운 소멸.
// 메시지는 방울 내부에 표시되고, 잔광/물결로 터진다.
//
// 가중 랜덤:
//  - 생성 위치: 화면 하단 가로 어디든 (최근 3개 방울과 x축 거리 > 80px)
//  - 상승 속도: ±25% 분산
//  - 경로: 저주파 좌우 sway (wind)
//  - 크기: 메시지 길이에 비례 (짧은 글 = 작은 방울)
//  - 수명: 5~8s 분산 (더 오래 떠 있고, 터짐이 이벤트)

function ConceptBubble({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                        keyboardUp = false, myEchoText = '', intensity = 1 }) {
  const room = TOKENS.rooms[roomId];
  const accent = room.accent;

  const bubbles = useBubbleFeed({ roomId, reduceMotion, intensity, myEchoText });

  return (
    <div className="pod-app" style={{
      width, height,
      background: `radial-gradient(ellipse at 50% 120%, ${accent}15 0%, ${TOKENS.bg.base} 55%)`,
      position: 'relative', overflow: 'hidden',
      fontFamily: "'Space Grotesk', 'Noto Sans KR', sans-serif",
    }}>
      {/* ambient floor glow — like a water surface the bubbles rise from */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 180,
        background: `linear-gradient(180deg, transparent 0%, ${accent}22 60%, ${accent}44 100%)`,
        pointerEvents: 'none',
      }}/>
      {/* floor line with fine ripples */}
      <BubbleFloor accent={accent} reduceMotion={reduceMotion} bottom={keyboardUp ? 310 : 100}/>

      {/* status bar */}
      <div style={{height: 54}}/>

      {/* minimalist tab bar */}
      <CleanTabBar roomId={roomId} accent={accent}/>

      {/* bubble stage */}
      <div style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        {bubbles.map(b => <Bubble key={b.id} bubble={b} accent={accent}
          stageH={keyboardUp ? height - 310 : height - 100}
          reduceMotion={reduceMotion}/>)}
      </div>

      {/* input */}
      <CleanInput accent={accent} roomId={roomId} bottom={keyboardUp ? 301 : 34}
        placeholder={room.placeholder}/>

      {/* home indicator */}
      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(255,255,255,0.45)'}}/>
      </div>
    </div>
  );
}

// ─── Bubble feed — weighted random spawner ───────────────────────
function useBubbleFeed({ roomId, reduceMotion, intensity, myEchoText }) {
  const [bubbles, setBubbles] = React.useState([]);
  const idRef = React.useRef(0);
  const recentX = React.useRef([]); // last N x-percents to avoid clumping

  const bank = getBank(roomId);

  React.useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;
    const spawn = (msg, isMine = false) => {
      const now = performance.now();
      // weighted random x: avoid last 3 x positions (min 15% apart)
      let x;
      let tries = 0;
      do {
        x = 0.12 + Math.random() * 0.76;
        tries++;
      } while (tries < 8 && recentX.current.some(px => Math.abs(px - x) < 0.14));
      recentX.current = [x, ...recentX.current].slice(0, 3);

      const textLen = msg.text.length;
      const size = Math.min(148, 82 + textLen * 2.2 + Math.random() * 18);
      const life = 5400 + Math.random() * 2400;
      const drift = (Math.random() - 0.5) * 0.22; // lateral drift
      const wobble = 0.6 + Math.random() * 0.8;
      const id = ++idRef.current;
      setBubbles(prev => [...prev, {
        id, text: msg.text, nickname: msg.nickname, isMine,
        x, size, life, spawnAt: now, drift, wobble,
        startOffset: Math.random() * Math.PI * 2,
      }]);
      // schedule cleanup
      setTimeout(() => {
        if (!cancelled) setBubbles(prev => prev.filter(b => b.id !== id));
      }, life + 800);
    };

    const tick = () => {
      if (cancelled) return;
      const idx = Math.floor(Math.random() * bank.length);
      spawn(bank[idx]);
    };
    // initial burst — stagger 6 over first 2.4s for "arriving" feel
    const kickoffs = [];
    for (let i = 0; i < 6; i++) {
      kickoffs.push(setTimeout(tick, 200 + i * 380));
    }
    const interval = setInterval(tick, 1300 / intensity);
    return () => {
      cancelled = true;
      kickoffs.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [roomId, reduceMotion, intensity, bank]);

  // Echo of my recent send
  React.useEffect(() => {
    if (!myEchoText || reduceMotion) return;
    const id = ++idRef.current;
    const now = performance.now();
    const size = Math.min(160, 95 + myEchoText.length * 2.4);
    const b = { id, text: myEchoText, nickname: '나', isMine: true,
      x: 0.5, size, life: 6000, spawnAt: now, drift: 0, wobble: 0.5,
      startOffset: 0 };
    setBubbles(prev => [...prev, b]);
    const t = setTimeout(() => setBubbles(prev => prev.filter(x => x.id !== id)), 6800);
    return () => clearTimeout(t);
  }, [myEchoText, reduceMotion]);

  return bubbles;
}

// ─── Single bubble — rises + sways + pops ─────────────────────────
function Bubble({ bubble, accent, stageH, reduceMotion }) {
  const [t, setT] = React.useState(0); // 0..1 lifecycle
  const rafRef = React.useRef();

  React.useEffect(() => {
    if (reduceMotion) { setT(0.5); return; }
    const tick = (now) => {
      const p = Math.min(1, (now - bubble.spawnAt) / bubble.life);
      setT(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [bubble.id, bubble.spawnAt, bubble.life, reduceMotion]);

  const { x, size, drift, wobble, startOffset, text, nickname, isMine } = bubble;

  // ease for rise: slow at top (deceleration)
  const riseEase = 1 - Math.pow(1 - t, 2.2);
  const yStart = stageH * 0.92;
  const yEnd = 110;
  const y = yStart + (yEnd - yStart) * riseEase;
  // sway: long-wave sin, drifts slightly laterally over life
  const swayX = Math.sin(t * Math.PI * 2.4 * wobble + startOffset) * 16;
  const driftX = drift * t * 140;
  const cx = x * 390 + swayX + driftX;

  // scale: birth pop (0→1 in first 6%), stable, death pop
  const popIn = t < 0.06 ? t / 0.06 : 1;
  const popOut = t > 0.92 ? (1 - t) / 0.08 : 1;
  const scale = popIn * popOut * (0.97 + Math.sin(t * Math.PI * 6 * wobble) * 0.012);

  const isPopping = t > 0.92;
  const popProgress = isPopping ? (t - 0.92) / 0.08 : 0;

  return (
    <div style={{
      position: 'absolute',
      left: cx, top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      width: size, height: size,
      pointerEvents: 'none',
      willChange: 'transform, opacity',
    }}>
      {/* pop particles */}
      {isPopping && !reduceMotion && [...Array(8)].map((_, i) => {
        const ang = (i / 8) * Math.PI * 2;
        const d = popProgress * size * 0.7;
        return (
          <div key={i} style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 3 + popProgress * 2, height: 3 + popProgress * 2,
            borderRadius: '50%',
            background: isMine ? accent : 'rgba(255,255,255,0.8)',
            transform: `translate(calc(-50% + ${Math.cos(ang) * d}px), calc(-50% + ${Math.sin(ang) * d}px))`,
            opacity: 1 - popProgress,
            boxShadow: `0 0 8px ${accent}`,
            filter: 'blur(0.4px)',
          }}/>
        );
      })}

      {/* soap bubble body */}
      <div style={{
        width: '100%', height: '100%',
        borderRadius: '50%',
        background: isMine
          ? `radial-gradient(circle at 30% 25%, ${accent}55 0%, ${accent}22 35%, rgba(10,10,15,0.1) 80%)`
          : `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 40%, rgba(10,10,15,0.08) 80%)`,
        boxShadow: isMine
          ? `inset 0 0 0 1.2px ${accent}99, 0 0 30px ${accent}44, inset -8px -12px 24px rgba(0,0,0,0.3), inset 6px 8px 18px rgba(255,255,255,0.15)`
          : `inset 0 0 0 1px rgba(255,255,255,0.22), 0 0 24px rgba(255,255,255,0.06), inset -6px -10px 20px rgba(0,0,0,0.25), inset 5px 6px 14px rgba(255,255,255,0.12)`,
        opacity: 1 - popProgress * 0.9,
        filter: isPopping ? `blur(${popProgress * 2}px)` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* rainbow film shimmer on rim */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: `conic-gradient(from ${startOffset}rad, transparent 0deg, ${accent}33 40deg, transparent 80deg, rgba(255,100,200,0.15) 160deg, transparent 210deg, rgba(100,200,255,0.12) 290deg, transparent 330deg)`,
          mixBlendMode: 'screen',
          opacity: 0.7,
        }}/>
        {/* top specular highlight */}
        <div style={{
          position: 'absolute',
          top: '10%', left: '22%',
          width: '42%', height: '22%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, transparent 70%)',
          filter: 'blur(1px)',
        }}/>
        {/* content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: size * 0.14,
          textAlign: 'center',
          opacity: 1 - popProgress,
        }}>
          <div className="kor" style={{
            fontSize: Math.max(10.5, size * 0.11),
            fontWeight: 600,
            color: isMine ? '#fff' : 'rgba(255,255,255,0.95)',
            lineHeight: 1.25,
            letterSpacing: -0.1,
            textShadow: '0 1px 4px rgba(0,0,0,0.7)',
            maxHeight: size * 0.52,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            textWrap: 'pretty',
            wordBreak: 'keep-all',
          }}>{text}</div>
          <div className="mono" style={{
            fontSize: 8.5, fontWeight: 500,
            color: isMine ? accent : 'rgba(255,255,255,0.55)',
            marginTop: 4, letterSpacing: 0.3,
          }}>@{nickname}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Floor — the surface bubbles rise from ────────────────────────
function BubbleFloor({ accent, reduceMotion, bottom }) {
  return (
    <div style={{
      position: 'absolute',
      bottom, left: 0, right: 0,
      height: 3, pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(90deg, transparent 0%, ${accent}55 15%, ${accent}aa 50%, ${accent}55 85%, transparent 100%)`,
        boxShadow: `0 0 16px ${accent}88, 0 0 32px ${accent}44`,
      }}/>
      {/* occasional "spawn" spots */}
      {!reduceMotion && [0.2, 0.5, 0.8].map((px, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${px * 100}%`, bottom: -2,
          width: 8, height: 8, borderRadius: '50%',
          background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
          filter: 'blur(2px)',
          animation: `ambient-drift ${3 + i}s ease-in-out ${i * 0.7}s infinite`,
        }}/>
      ))}
    </div>
  );
}

// ─── Shared: clean tab bar (no pod chrome) ────────────────────────
function CleanTabBar({ roomId, accent }) {
  return (
    <div style={{
      position: 'relative', zIndex: 5,
      display: 'flex', alignItems: 'center',
      padding: '6px 20px 0',
      justifyContent: 'space-between',
    }}>
      <div style={{display: 'flex', gap: 22}}>
        {ROOM_IDS.map(id => {
          const selected = id === roomId;
          const room = TOKENS.rooms[id];
          return (
            <div key={id} style={{
              position: 'relative',
              padding: '10px 2px',
              fontSize: 15, fontWeight: selected ? 600 : 500,
              fontFamily: "'Noto Sans KR', sans-serif",
              color: selected ? '#fff' : 'rgba(255,255,255,0.4)',
              letterSpacing: 0.2,
            }}>
              {room.name}
              {selected && (
                <div style={{
                  position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: '50%',
                  background: accent,
                  boxShadow: `0 0 8px ${accent}`,
                }}/>
              )}
            </div>
          );
        })}
      </div>
      <div className="mono" style={{
        fontSize: 11, color: 'rgba(255,255,255,0.6)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{
          width: 5, height: 5, borderRadius: '50%',
          background: accent, boxShadow: `0 0 6px ${accent}`,
          animation: 'counter-dot 1.6s ease-in-out infinite',
        }}/>
        LIVE · 1.2k
      </div>
    </div>
  );
}

// ─── Shared: clean input ──────────────────────────────────────────
function CleanInput({ accent, roomId, bottom, placeholder }) {
  return (
    <div style={{
      position: 'absolute', bottom, left: 16, right: 16, zIndex: 8,
      height: 52, borderRadius: 26,
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center',
      padding: '0 8px 0 20px',
    }}>
      <div className="kor" style={{
        flex: 1, fontSize: 15, color: 'rgba(255,255,255,0.35)',
      }}>{placeholder}</div>
      <button style={{
        width: 38, height: 38, borderRadius: 19, border: 'none',
        background: `linear-gradient(135deg, ${accent} 0%, ${accent}aa 100%)`,
        boxShadow: `0 0 16px ${accent}66`,
        color: '#0a0a0f', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8h12m-5-5l5 5-5 5" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Shared message banks (imported from global) ──────────────────
function getBank(roomId) {
  return (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
}

Object.assign(window, { ConceptBubble, BubbleFloor, CleanTabBar, CleanInput });
