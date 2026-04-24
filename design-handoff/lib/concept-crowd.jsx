// ConceptCrowd — V2 가중 랜덤 군중 시안
// "활발한 방" 전체를 한 화면에 군중처럼 흩어 놓음.
// 각 메시지 = 카드. 가중 랜덤 위치 (마지막 N개와 거리 확보) + 랜덤 각도 + 랜덤 수명.

function ConceptCrowd({ roomId = 'daily', reduceMotion = false, width = 390, height = 844,
                       keyboardUp = false, myEchoText = '' }) {
  const room = TOKENS.rooms[roomId];
  const accent = room.accent;
  const [cards, setCards] = React.useState([]);
  const idRef = React.useRef(0);
  const recent = React.useRef([]);

  React.useEffect(() => {
    if (reduceMotion) return;
    const bank = (window.__MSG_BANK && window.__MSG_BANK[roomId]) || [];
    let cancelled = false;
    const spawn = () => {
      const msg = bank[Math.floor(Math.random() * bank.length)];
      if (!msg) return;
      let x, y, tries = 0;
      // weighted random: bias toward not clumping
      do {
        x = 0.08 + Math.random() * 0.84;
        y = 0.12 + Math.random() * 0.62;
        tries++;
      } while (tries < 10 && recent.current.some(p => Math.hypot(p.x - x, (p.y - y) * 1.4) < 0.28));
      recent.current = [{x, y}, ...recent.current].slice(0, 4);
      const id = ++idRef.current;
      const rot = (Math.random() - 0.5) * 5;
      const size = 0.8 + Math.random() * 0.4;
      const life = 5500 + Math.random() * 2500;
      setCards(prev => [...prev, { id, ...msg, x, y, rot, size,
        spawnAt: performance.now(), life }].slice(-10));
      setTimeout(() => { if (!cancelled) setCards(p => p.filter(c => c.id !== id)); }, life + 500);
    };
    const i = setInterval(spawn, 1100);
    const k = [];
    for (let j = 0; j < 6; j++) k.push(setTimeout(spawn, 100 + j * 280));
    return () => { cancelled = true; clearInterval(i); k.forEach(clearTimeout); };
  }, [roomId, reduceMotion]);

  return (
    <div className="pod-app" style={{
      width, height,
      background: `radial-gradient(ellipse at 50% 30%, ${accent}10 0%, #0a0a0f 60%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{height: 54}}/>
      <CleanTabBar roomId={roomId} accent={accent}/>

      <div style={{
        position: 'absolute', top: 120, left: 0, right: 0,
        bottom: keyboardUp ? 310 : 100, overflow: 'hidden',
      }}>
        {cards.map(c => <CrowdCard key={c.id} card={c} accent={accent}
          width={width} reduceMotion={reduceMotion}/>)}
      </div>

      <CleanInput accent={accent} roomId={roomId}
        bottom={keyboardUp ? 301 : 34} placeholder={room.placeholder}/>
      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',justifyContent:'center',zIndex:100}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(255,255,255,0.45)'}}/>
      </div>
    </div>
  );
}

function CrowdCard({ card, accent, width, reduceMotion }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (reduceMotion) { setT(0.3); return; }
    let raf;
    const tick = (n) => {
      const p = Math.min(1, (n - card.spawnAt) / card.life);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [card.id, card.spawnAt, card.life, reduceMotion]);

  const op = t < 0.1 ? t / 0.1 : t > 0.7 ? (1 - t) / 0.3 : 1;
  const scale = card.size * (t < 0.08 ? 0.85 + (t / 0.08) * 0.15 : 1);

  return (
    <div style={{
      position: 'absolute',
      left: card.x * width, top: card.y * 560,
      transform: `translate(-50%, -50%) rotate(${card.rot}deg) scale(${scale})`,
      opacity: op,
      maxWidth: 230,
    }}>
      <div style={{
        padding: '9px 13px', borderRadius: 14,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${accent}44`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 0 0.5px ${accent}22`,
      }}>
        <div className="mono" style={{fontSize: 8.5, color: accent, marginBottom: 3,
          letterSpacing: 0.3, opacity: 0.85}}>@{card.nickname}</div>
        <div className="kor" style={{fontSize: 13, fontWeight: 500, color: '#fff',
          lineHeight: 1.35, textWrap: 'pretty'}}>{card.text}</div>
      </div>
    </div>
  );
}

Object.assign(window, { ConceptCrowd });
