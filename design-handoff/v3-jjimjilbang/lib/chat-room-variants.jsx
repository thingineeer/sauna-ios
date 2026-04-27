// ChatRoomVariants — 3 premium sauna chat rooms, all using "rise" vanish.
// 변형의 핵심: 같은 채팅 그릭/UX, 완전히 다른 ambient 배경 + 라이팅 + 팔레트.
//   A · Cedar Grove   — 호박색 원목 (사진 1, 러스틱 러시안 사우나)
//   B · Modern Stone  — 옅은 자작 + LED cove (사진 2, 모던 미니멀 사우나)
//   C · Bath Hall     — 대리석 + 녹빛 광천수 (사진 3, 클래식 일본 욕탕 - 사우나 톤으로 재해석)
//
// 메시지 휘발 = rise (위로 올라가며 흩어짐). 변형마다 잔향(증기/빛/물김)만 다름.

const { SAUNA: SAUNA_CRV, IcArrowLeft: IcL_CRV, IcArrowUpRight: IcUR_CRV,
  IcDaily: IcDail_CRV, IcStock: IcStk_CRV, IcJob: IcJob_CRV,
  IcSteam: IcStm_CRV, IcWaves: IcWv_CRV } = window;

// ─────────────────────────────────────────────────────────────
// 메시지 풀 (변형 공통)
// ─────────────────────────────────────────────────────────────
const CRV_BANK = {
  daily: [
    { text: '하… 여기 앉으니까 어깨가 녹는다', nickname: '녹아내리는수달' },
    { text: '하루가 땀으로 빠져나가는 느낌',   nickname: '뽀송한너구리' },
    { text: '눈 감고 있으면 시간 멈춰',        nickname: '쉬는고양이' },
    { text: '몸이 따뜻해지니까 마음도 말랑해', nickname: '포근한햄스터' },
    { text: '오늘 진짜 힘들었다…',            nickname: '지친여우' },
    { text: '말 없이 같이 땀 흘리는 것도 좋네', nickname: '조용한두루미' },
    { text: '숨 들이마시면 나무 향',          nickname: '편백나무좋아' },
    { text: '여기 나오면 잘 잘 수 있어',       nickname: '꿀잠기원' },
    { text: '아 이 온기에 중독됐다',          nickname: '노곤한사슴' },
  ],
};

// ─────────────────────────────────────────────────────────────
// rise 메시지 (variants 별 미세 톤 — text/border 색만 살짝 다르게)
// ─────────────────────────────────────────────────────────────
function RiseMsg({ msg, width, isMine, palette, keyboardUp }) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    let raf;
    const tick = (n) => {
      const p = Math.min(1, (n - msg.spawnAt) / msg.life);
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [msg.id, msg.spawnAt, msg.life]);

  const yStart = keyboardUp ? 340 : 500;
  const yEnd   = keyboardUp ? 20  : 20;
  const y = yStart + (yEnd - yStart) * t;
  const x = msg.x * width + Math.sin(t * 3.2 + msg.id * 0.7) * 12;
  const opacity = t < 0.10 ? t / 0.10 : t > 0.72 ? (1 - t) / 0.28 : 1;
  const blur = t > 0.62 ? (t - 0.62) * 12 : 0;
  const scale = 0.9 + t * 0.15;

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity, filter: blur ? `blur(${blur}px)` : 'none',
      pointerEvents: 'none', willChange: 'transform, opacity',
      textAlign: 'center',
    }}>
      <div style={{
        display: 'inline-block',
        padding: keyboardUp ? '6px 12px' : '8px 14px',
        borderRadius: keyboardUp ? 12 : 14,
        background: isMine ? palette.bubbleMineBg : palette.bubbleBg,
        backdropFilter: 'blur(5px)',
        border: `${isMine ? 1.5 : 1}px solid ${isMine ? palette.bubbleMineBorder : palette.bubbleBorder}`,
        boxShadow: isMine ? palette.bubbleMineShadow : palette.bubbleShadow,
        maxWidth: keyboardUp ? 240 : 280,
      }}>
        <div className="mono" style={{
          fontSize: 9, color: isMine ? palette.nickMine : palette.nick,
          letterSpacing: 0.3, marginBottom: 2, fontWeight: 700, opacity: 0.95,
        }}>{msg.nickname}</div>
        <div style={{
          fontSize: keyboardUp ? 12 : 13, fontWeight: 500, color: palette.text,
          lineHeight: 1.4, textShadow: palette.textShadow,
          wordBreak: 'keep-all', textWrap: 'pretty',
        }}>{msg.text}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 공통 메시지 시뮬 hook
// ─────────────────────────────────────────────────────────────
function useChatSim(roomId, density) {
  const [msgs, setMsgs] = React.useState([]);
  const idRef = React.useRef(0);
  const MY_ID = 'me-self';

  React.useEffect(() => {
    const bank = CRV_BANK[roomId] || CRV_BANK.daily;
    let cancelled = false;
    const spawn = (isMine = false) => {
      const m = bank[Math.floor(Math.random() * bank.length)];
      if (!m) return;
      const id = ++idRef.current;
      const x = 0.18 + Math.random() * 0.64;
      const life = density.lifeMs + Math.random() * (density.lifeMs * 0.3);
      setMsgs(prev => [...prev,
        { id, ...m, x, spawnAt: performance.now(), life,
          senderId: isMine ? MY_ID : 'u' + id,
          nickname: isMine ? '나' : m.nickname }
      ].slice(-density.maxMsgs));
      setTimeout(() => { if (!cancelled) setMsgs(p => p.filter(x => x.id !== id)); }, life + 400);
    };
    const i = setInterval(spawn, density.spawnMs);
    const mine = setInterval(() => { if (Math.random() < density.mineChance) spawn(true); }, 4800);
    const k = [];
    for (let j = 0; j < 4; j++) k.push(setTimeout(spawn, j * 220));
    return () => { cancelled = true; clearInterval(i); clearInterval(mine); k.forEach(clearTimeout); };
  }, [roomId]);

  return { msgs, MY_ID };
}

// ============================================================
// VARIANT A — Cedar Grove (러스틱 호박 원목 + 천장 thermometer)
// ============================================================
function ChatRoomCedarGrove({ width = 393, height = 852, keyboardUp = false }) {
  const density = { spawnMs: 1300, maxMsgs: 6, mineChance: 0.30, lifeMs: 8500 };
  const { msgs, MY_ID } = useChatSim('daily', density);

  const palette = {
    bubbleBg:        'linear-gradient(180deg, rgba(255,232,196,0.34), rgba(255,210,160,0.22))',
    bubbleMineBg:    'linear-gradient(180deg, rgba(255,220,150,0.55), rgba(255,180,100,0.42))',
    bubbleBorder:    'rgba(255,224,180,0.42)',
    bubbleMineBorder:'rgba(255,210,120,0.85)',
    bubbleShadow:    '0 0 14px rgba(255,200,140,0.28), 0 2px 4px rgba(40,15,0,0.4)',
    bubbleMineShadow:'0 0 24px rgba(255,180,80,0.5), 0 2px 6px rgba(40,15,0,0.4)',
    nick:'#FFD4A0', nickMine:'#FFE5A0',
    text:'#FFF6E6', textShadow:'0 1px 3px rgba(50,15,0,0.95)',
  };

  // 두꺼운 horizontal 원목 plank (사진 1처럼 - 가로결, 세로보단 가로 우세)
  const plankBg = `
    linear-gradient(180deg, rgba(50,22,8,0.5) 0%, transparent 12%, transparent 88%, rgba(30,12,2,0.6) 100%),
    repeating-linear-gradient(0deg,
      #B07A45 0px, #B07A45 38px,
      rgba(80,40,15,0.6) 38px, rgba(80,40,15,0.6) 39px,
      #C89060 40px, #C89060 78px,
      rgba(50,22,8,0.7) 78px, rgba(50,22,8,0.7) 80px),
    repeating-linear-gradient(90deg,
      rgba(0,0,0,0) 0px, rgba(0,0,0,0) 240px,
      rgba(60,28,10,0.5) 240px, rgba(60,28,10,0.5) 242px)`;

  return (
    <div style={{
      position:'relative', width, height, overflow:'hidden',
      fontFamily:"'Noto Sans KR', -apple-system, sans-serif",
      background: plankBg, color:'#FFE8C8',
    }}>
      {/* Wood knots - 결마디 */}
      <svg style={{position:'absolute', inset:0, opacity:0.35,
        pointerEvents:'none', mixBlendMode:'multiply', zIndex:1}}>
        <defs>
          <radialGradient id="knotA1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3a1a08" stopOpacity="0.85"/>
            <stop offset="55%" stopColor="#3a1a08" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#3a1a08" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <ellipse cx="80"  cy="240" rx="14" ry="6"  fill="url(#knotA1)"/>
        <ellipse cx="290" cy="380" rx="11" ry="5"  fill="url(#knotA1)"/>
        <ellipse cx="160" cy="540" rx="16" ry="7"  fill="url(#knotA1)"/>
        <ellipse cx="340" cy="660" rx="9"  ry="4"  fill="url(#knotA1)"/>
      </svg>

      {/* 천장 글로우 + 단일 heat lamp */}
      <div style={{position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
        background:`
          radial-gradient(ellipse 90% 38% at 50% -8%, rgba(255,170,80,0.45), transparent 70%),
          radial-gradient(ellipse 50% 22% at 18% 100%, rgba(255,140,60,0.18), transparent 70%),
          radial-gradient(ellipse 50% 22% at 82% 100%, rgba(255,140,60,0.16), transparent 70%)`}}/>

      {/* Thermometer (사진 1의 작은 디테일 - 재해석) */}
      <div style={{position:'absolute', top: 130, right: 22, zIndex: 3,
        width: 20, height: 100, borderRadius: 10,
        background:'linear-gradient(180deg, #2a1408 0%, #1a0904 100%)',
        border:'1px solid rgba(255,200,140,0.3)',
        boxShadow:'0 2px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,140,0.15)',
        display:'flex', alignItems:'flex-end', justifyContent:'center',
        padding: 3,
      }}>
        <div style={{width: 6, height: 64, borderRadius: 3,
          background:'linear-gradient(180deg, #FF8A3B 0%, #FFC870 100%)',
          boxShadow:'0 0 8px rgba(255,140,60,0.6)'}}/>
        <div style={{position:'absolute', top: 8, left: '50%',
          transform:'translateX(-50%)',
          fontSize: 7, color:'#FFD490', fontFamily:"'JetBrains Mono', monospace",
          letterSpacing: 0.5}}>82°</div>
      </div>

      {/* Header */}
      <CRVHeader roomId="daily" head={12} accent="#8FD19E"
        sub="오늘 하루 흘려보내기"
        ambientLabel="CEDAR GROVE"/>

      {/* Stage */}
      <div style={{position:'absolute', top:180, left:0, right:0,
        bottom: keyboardUp ? 352 : 96, overflow:'hidden', zIndex:8}}>
        {msgs.map(m => (
          <RiseMsg key={m.id} msg={m} width={width}
            isMine={m.senderId === MY_ID} palette={palette}
            keyboardUp={keyboardUp}/>
        ))}
      </div>

      {/* steam 잔향 */}
      <div style={{position:'absolute', bottom: 96, left: '50%',
        transform:'translateX(-50%)', zIndex: 7, opacity: 0.22,
        color:'#FFD4A0', filter:'blur(1px)',
        animation:'crv-steamA 4s ease-in-out infinite'}}>
        <IcStm_CRV size={48} color="currentColor"/>
      </div>

      {/* floor slats */}
      {!keyboardUp && <div style={{position:'absolute', bottom:0, left:0, right:0, height:96, zIndex:4,
        background:`linear-gradient(180deg, rgba(40,18,5,0) 0%, rgba(40,18,5,0.65) 100%),
          repeating-linear-gradient(0deg,
            rgba(60,30,10,0.5) 0px, rgba(80,42,16,0.3) 2px,
            rgba(40,18,5,0.6) 3px, rgba(40,18,5,0.6) 4px)`,
        boxShadow:'inset 0 6px 14px rgba(0,0,0,0.55), 0 -3px 10px rgba(255,140,60,0.1)'}}/>}

      <CRVInput palette={palette} keyboardUp={keyboardUp}
        bg='linear-gradient(180deg, rgba(60,30,12,0.78), rgba(30,14,4,0.88))'
        border='rgba(255,190,120,0.4)'
        sendBg='linear-gradient(180deg, #FFB060, #E87020)'
        sendIconColor='#2a1000'
        placeholderColor='rgba(255,220,180,0.55)'
        placeholder='천천히 뱉어봐…'/>
    </div>
  );
}

// ============================================================
// VARIANT B — Modern Stone (옅은 자작 + LED cove + heater rocks)
// ============================================================
function ChatRoomModernStone({ width = 393, height = 852, keyboardUp = false }) {
  const density = { spawnMs: 1500, maxMsgs: 5, mineChance: 0.28, lifeMs: 9500 };
  const { msgs, MY_ID } = useChatSim('daily', density);

  // 더 차분한 톤. cool warm-gray. 메시지가 더 미니멀
  const palette = {
    bubbleBg:        'linear-gradient(180deg, rgba(245,232,210,0.18), rgba(220,200,170,0.10))',
    bubbleMineBg:    'linear-gradient(180deg, rgba(255,225,180,0.42), rgba(240,200,150,0.30))',
    bubbleBorder:    'rgba(245,225,195,0.32)',
    bubbleMineBorder:'rgba(255,210,150,0.7)',
    bubbleShadow:    '0 0 18px rgba(220,200,170,0.18), 0 2px 4px rgba(20,15,10,0.45)',
    bubbleMineShadow:'0 0 26px rgba(255,200,140,0.4), 0 2px 6px rgba(20,15,10,0.45)',
    nick:'#E8D4A8', nickMine:'#FFE0A0',
    text:'#F8F0E2', textShadow:'0 1px 3px rgba(15,10,4,0.95)',
  };

  // 옅은 자작/asparen 세로결 (사진 2처럼)
  const lightWoodBg = `
    linear-gradient(180deg, rgba(40,28,16,0.5) 0%, transparent 14%, transparent 86%, rgba(20,12,4,0.7) 100%),
    repeating-linear-gradient(90deg,
      #C4A57A 0px, #C9AB80 4px, #B89466 5px, #B89466 6px,
      #C4A57A 7px, #BFA078 14px, #A88958 15px, #A88958 16px,
      #BFA078 17px, #C4A57A 22px)`;

  return (
    <div style={{
      position:'relative', width, height, overflow:'hidden',
      fontFamily:"'Noto Sans KR', -apple-system, sans-serif",
      background: lightWoodBg, color:'#F8F0E2',
    }}>
      {/* 천장 grid (사진 2의 ceiling slat 패턴 재해석) */}
      <div style={{position:'absolute', top:0, left:0, right:0, height:88, zIndex:2,
        background:`
          linear-gradient(180deg, rgba(15,8,2,0.95) 0%, rgba(25,15,6,0.7) 75%, transparent 100%),
          repeating-linear-gradient(90deg,
            rgba(0,0,0,0) 0px, rgba(0,0,0,0) 6px,
            rgba(0,0,0,0.5) 6px, rgba(0,0,0,0.5) 7px),
          repeating-linear-gradient(0deg,
            rgba(0,0,0,0) 0px, rgba(0,0,0,0) 6px,
            rgba(0,0,0,0.4) 6px, rgba(0,0,0,0.4) 7px)`,
        }}/>

      {/* LED cove strip — 천장 아래 핵심 라이팅 (사진 2 핵심) */}
      <div style={{position:'absolute', top: 86, left: 0, right: 0, height: 4, zIndex: 3,
        background: 'linear-gradient(90deg, rgba(255,240,210,0) 0%, rgba(255,240,210,0.95) 12%, rgba(255,240,210,0.95) 88%, rgba(255,240,210,0) 100%)',
        boxShadow: '0 8px 28px rgba(255,230,180,0.45), 0 14px 50px rgba(255,210,150,0.3)',
        filter: 'blur(0.4px)',
      }}/>
      {/* cove glow spread */}
      <div style={{position:'absolute', top: 84, left:0, right:0, height: 280, zIndex: 2,
        pointerEvents:'none',
        background:`linear-gradient(180deg, rgba(255,235,190,0.22) 0%, transparent 60%)`,
        animation:'crv-coveB 6s ease-in-out infinite'}}/>

      {/* Heater stones 좌하단 (사진 2의 회색 sauna heater) */}
      <div style={{position:'absolute', bottom: 96, left: 14, zIndex: 5,
        width: 76, height: 92, borderRadius: 6,
        background:'linear-gradient(180deg, #5a544c 0%, #2e2a24 100%)',
        border:'1px solid rgba(0,0,0,0.45)',
        boxShadow:'0 4px 12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)',
        padding: 7, overflow: 'hidden',
      }}>
        {/* rocks grid */}
        <svg width="62" height="78" viewBox="0 0 62 78" style={{display:'block'}}>
          <defs>
            <radialGradient id="rockGlow" cx="50%" cy="55%" r="60%">
              <stop offset="0%" stopColor="#FF9550" stopOpacity="0.55"/>
              <stop offset="100%" stopColor="#FF9550" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="62" height="78" fill="url(#rockGlow)"/>
          {[
            [8,8,12], [26,6,11], [44,9,10],
            [6,28,11], [22,26,13], [42,28,10], [54,28,8],
            [10,46,12], [28,48,11], [46,46,12],
            [16,64,10], [36,66,11], [50,64,9],
          ].map(([x,y,r],i) => (
            <circle key={i} cx={x+r/2} cy={y+r/2} r={r/2}
              fill={i % 4 === 0 ? '#3d3530' : i % 3 === 0 ? '#4a4138' : '#363029'}
              stroke="rgba(0,0,0,0.4)" strokeWidth="0.5"/>
          ))}
        </svg>
        {/* glow halo */}
        <div style={{position:'absolute', inset: -4, borderRadius: 8,
          boxShadow:'0 0 30px rgba(255,140,60,0.25)', pointerEvents:'none'}}/>
      </div>

      {/* Towel roll detail - 사진 2의 흰 수건 (작게) */}
      <div style={{position:'absolute', top: 158, right: 22, zIndex: 3,
        width: 32, height: 14, borderRadius: 7,
        background:'linear-gradient(180deg, #f5ede0 0%, #d8cdb8 100%)',
        border:'1px solid rgba(0,0,0,0.2)',
        boxShadow:'0 2px 4px rgba(0,0,0,0.4)',
      }}>
        <div style={{position:'absolute', inset:'2px 4px',
          borderTop:'1px solid rgba(0,0,0,0.12)',
          borderBottom:'1px solid rgba(0,0,0,0.12)'}}/>
      </div>

      <CRVHeader roomId="daily" head={12} accent="#8FD19E"
        sub="오늘 하루 흘려보내기"
        ambientLabel="MODERN STONE"
        tone="light"/>

      {/* Stage */}
      <div style={{position:'absolute', top:180, left:0, right:0,
        bottom: keyboardUp ? 352 : 96, overflow:'hidden', zIndex:8}}>
        {msgs.map(m => (
          <RiseMsg key={m.id} msg={m} width={width}
            isMine={m.senderId === MY_ID} palette={palette}
            keyboardUp={keyboardUp}/>
        ))}
      </div>

      {/* steam 잔향 - heater 위로 */}
      <div style={{position:'absolute', bottom: 180, left: 38, zIndex: 7,
        opacity: 0.32, color:'#F0E4C8', filter:'blur(0.8px)',
        animation:'crv-steamB 5s ease-in-out infinite'}}>
        <IcStm_CRV size={36} color="currentColor"/>
      </div>

      {/* floor — 사진 2처럼 가는 slat */}
      {!keyboardUp && <div style={{position:'absolute', bottom:0, left:0, right:0, height:96, zIndex:4,
        background:`linear-gradient(180deg, rgba(20,12,4,0) 0%, rgba(20,12,4,0.55) 100%),
          repeating-linear-gradient(90deg,
            rgba(150,120,80,0.35) 0px, rgba(150,120,80,0.35) 5px,
            rgba(20,12,4,0.85) 5px, rgba(20,12,4,0.85) 7px)`,
        boxShadow:'inset 0 6px 14px rgba(0,0,0,0.6)'}}/>}

      <CRVInput palette={palette} keyboardUp={keyboardUp}
        bg='linear-gradient(180deg, rgba(50,38,22,0.78), rgba(20,12,4,0.92))'
        border='rgba(245,225,195,0.32)'
        sendBg='linear-gradient(180deg, #F2D8A8, #C9A878)'
        sendIconColor='#2a1808'
        placeholderColor='rgba(245,232,210,0.5)'
        placeholder='조용히 한마디…'/>
    </div>
  );
}

// ============================================================
// VARIANT C — Bath Hall (대리석 + 광천수 + 아치 등 + 타일 wainscot)
// ============================================================
function ChatRoomBathHall({ width = 393, height = 852, keyboardUp = false }) {
  const density = { spawnMs: 1400, maxMsgs: 6, mineChance: 0.30, lifeMs: 9000 };
  const { msgs, MY_ID } = useChatSim('daily', density);

  const palette = {
    bubbleBg:        'linear-gradient(180deg, rgba(220,235,225,0.32), rgba(180,210,200,0.20))',
    bubbleMineBg:    'linear-gradient(180deg, rgba(255,235,200,0.55), rgba(230,200,160,0.42))',
    bubbleBorder:    'rgba(235,245,238,0.45)',
    bubbleMineBorder:'rgba(255,220,170,0.85)',
    bubbleShadow:    '0 0 16px rgba(180,220,200,0.30), 0 2px 4px rgba(20,40,35,0.5)',
    bubbleMineShadow:'0 0 26px rgba(255,200,140,0.5), 0 2px 6px rgba(20,30,30,0.5)',
    nick:'#D8E8DC', nickMine:'#FFE5B0',
    text:'#F4FBF6', textShadow:'0 1px 3px rgba(10,20,18,0.95)',
  };

  return (
    <div style={{
      position:'relative', width, height, overflow:'hidden',
      fontFamily:"'Noto Sans KR', -apple-system, sans-serif",
      color:'#F4FBF6',
      background:`
        linear-gradient(180deg, rgba(245,238,225,0.04) 0%, rgba(40,55,50,0) 100%),
        linear-gradient(180deg, #c9b89c 0%, #a89a7a 24%, #5a6862 24.3%, #3a4a48 56%, #2a3a3a 100%)`,
    }}>
      {/* 상단 크림 대리석 panel — 타일 wainscot 위 (사진 3 상부) */}
      <svg style={{position:'absolute', top:0, left:0, right:0, height:200, width:'100%',
        opacity: 0.35, mixBlendMode:'multiply', pointerEvents:'none', zIndex:1}}>
        <defs>
          <linearGradient id="bhVein1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7a6850" stopOpacity="0"/>
            <stop offset="50%" stopColor="#5a4838" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#7a6850" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d="M-10 60 Q 80 30, 160 80 T 410 90" stroke="url(#bhVein1)" strokeWidth="1.5" fill="none"/>
        <path d="M-10 130 Q 100 110, 180 150 T 410 140" stroke="url(#bhVein1)" strokeWidth="1" fill="none"/>
        <path d="M-10 30 Q 200 50, 410 25" stroke="url(#bhVein1)" strokeWidth="0.8" fill="none"/>
      </svg>

      {/* 타일 wainscot — 작은 정사각 타일 그리드 (사진 3 벽) */}
      <div style={{position:'absolute', top: 200, left: 0, right: 0, height: 6, zIndex: 2,
        background:'linear-gradient(180deg, #6a4838 0%, #4a3020 100%)',
        boxShadow:'0 1px 0 rgba(0,0,0,0.4)'}}/>
      <div style={{position:'absolute', top: 0, left: 0, right: 0, height: 200, zIndex: 1,
        pointerEvents:'none',
        background:`
          repeating-linear-gradient(90deg,
            rgba(0,0,0,0) 0px, rgba(0,0,0,0) 28px,
            rgba(70,50,30,0.3) 28px, rgba(70,50,30,0.3) 30px),
          repeating-linear-gradient(0deg,
            rgba(0,0,0,0) 0px, rgba(0,0,0,0) 56px,
            rgba(70,50,30,0.25) 56px, rgba(70,50,30,0.25) 58px)`,
        opacity: 0.5,
      }}/>

      {/* 작은 다이아몬드 액센트 타일 (사진 3) */}
      {[80, 200, 320].map((x, i) => (
        <div key={i} style={{position:'absolute', top: 142, left: x, zIndex: 2,
          width: 12, height: 12, transform:'rotate(45deg)',
          background:'linear-gradient(135deg, #6ba8c0, #2a6878)',
          border:'1px solid rgba(40,80,90,0.7)',
          boxShadow:'0 1px 2px rgba(0,0,0,0.4)'}}/>
      ))}

      {/* 아치 등 — 좌상단 */}
      <div style={{position:'absolute', top: 60, right: 22, zIndex: 3,
        width: 38, height: 46,
        borderTopLeftRadius: 19, borderTopRightRadius: 19,
        background:'radial-gradient(ellipse at 50% 80%, #FFD68A 0%, #FFA858 35%, #C97030 75%, #5a3010 100%)',
        boxShadow:'0 0 28px rgba(255,180,90,0.5), 0 4px 8px rgba(0,0,0,0.4)',
        border:'1px solid rgba(80,40,15,0.6)',
      }}/>

      {/* 광천수 풀 — 화면 하단 60%, 녹빛 / 사진 3의 미네랄 청록 */}
      <div style={{position:'absolute', top: 350, left:0, right:0, bottom: 0, zIndex: 3,
        background:`
          radial-gradient(ellipse 80% 100% at 50% 70%, rgba(120,180,160,0.38) 0%, rgba(40,80,72,0.15) 60%, transparent 100%),
          linear-gradient(180deg,
            #4f7a6e 0%,
            #3e6a5c 20%,
            #305a4e 50%,
            #234438 80%,
            #1a2e26 100%)`,
        boxShadow:'inset 0 3px 0 rgba(255,255,255,0.06), inset 0 -10px 30px rgba(0,0,0,0.4)',
      }}>
        {/* 수면 caustics */}
        <svg style={{position:'absolute', inset:0, width:'100%', height:'100%',
          mixBlendMode:'screen', opacity: 0.4}}>
          <defs>
            <filter id="bhBlur"><feGaussianBlur stdDeviation="2.5"/></filter>
          </defs>
          <g filter="url(#bhBlur)">
            <ellipse cx="80"  cy="60"  rx="34" ry="3" fill="rgba(180,220,200,0.6)"/>
            <ellipse cx="240" cy="120" rx="46" ry="4" fill="rgba(180,220,200,0.45)"/>
            <ellipse cx="150" cy="200" rx="38" ry="3" fill="rgba(180,220,200,0.55)"/>
            <ellipse cx="320" cy="260" rx="30" ry="3" fill="rgba(180,220,200,0.5)"/>
            <ellipse cx="100" cy="340" rx="42" ry="4" fill="rgba(180,220,200,0.4)"/>
          </g>
        </svg>
        {/* 잔물결 라인 */}
        <div style={{position:'absolute', inset: 0,
          background:`repeating-linear-gradient(0deg, rgba(180,220,200,0.06) 0px, transparent 2px, transparent 9px)`,
          animation:'crv-waterC 8s linear infinite'}}/>
      </div>

      {/* 풀 가장자리 — 갈색 대리석 (사진 3) */}
      <div style={{position:'absolute', top: 348, left: 0, right: 0, height: 8, zIndex: 4,
        background:'linear-gradient(180deg, #8a6a48 0%, #6a4a30 50%, #4a3020 100%)',
        boxShadow:'0 2px 6px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,220,180,0.18)'}}/>

      {/* Header */}
      <CRVHeader roomId="daily" head={12} accent="#8FD19E"
        sub="물과 증기 사이"
        ambientLabel="BATH HALL"
        tone="cool"/>

      {/* Stage */}
      <div style={{position:'absolute', top:180, left:0, right:0,
        bottom: keyboardUp ? 352 : 96, overflow:'hidden', zIndex:8}}>
        {msgs.map(m => (
          <RiseMsg key={m.id} msg={m} width={width}
            isMine={m.senderId === MY_ID} palette={palette}
            keyboardUp={keyboardUp}/>
        ))}
      </div>

      {/* 수면 위 김 (rise 잔향) */}
      <div style={{position:'absolute', bottom: 180, left: '20%', zIndex: 7,
        opacity: 0.25, color:'#D8EDE0', filter:'blur(1.2px)',
        animation:'crv-steamC1 5s ease-in-out infinite'}}>
        <IcStm_CRV size={32} color="currentColor"/>
      </div>
      <div style={{position:'absolute', bottom: 200, right: '18%', zIndex: 7,
        opacity: 0.22, color:'#D8EDE0', filter:'blur(1.4px)',
        animation:'crv-steamC2 6s ease-in-out infinite'}}>
        <IcStm_CRV size={40} color="currentColor"/>
      </div>

      <CRVInput palette={palette} keyboardUp={keyboardUp}
        bg='linear-gradient(180deg, rgba(35,55,52,0.85), rgba(15,30,28,0.92))'
        border='rgba(180,220,200,0.4)'
        sendBg='linear-gradient(180deg, #FFC870, #C97030)'
        sendIconColor='#2a1808'
        placeholderColor='rgba(220,235,225,0.5)'
        placeholder='수면처럼 잔잔히…'/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 공유 헤더
// ─────────────────────────────────────────────────────────────
function CRVHeader({ roomId, head, sub, ambientLabel, tone = 'warm' }) {
  const isLight = tone === 'light';
  const isCool  = tone === 'cool';
  const dotColor = isCool ? '#8FD19E' : isLight ? '#FFD8A0' : '#FF8A3B';
  const tagColor = isCool ? '#D8E8DC' : isLight ? '#F0E0B8' : '#FFD4A0';
  const titleColor = isCool ? '#F4FBF6' : isLight ? '#F8F0E2' : '#FFE8C8';
  const subColor = isCool ? 'rgba(220,235,225,0.7)' : isLight ? 'rgba(245,232,210,0.7)' : 'rgba(255,220,180,0.65)';
  const buttonBg = isCool ? 'rgba(15,30,28,0.7)' : isLight ? 'rgba(20,12,4,0.7)' : 'rgba(20,8,2,0.7)';
  const buttonOutline = isCool ? 'rgba(180,220,200,0.3)' : isLight ? 'rgba(245,225,195,0.3)' : 'rgba(255,200,140,0.3)';
  const buttonColor = isCool ? '#D8E8DC' : isLight ? '#F0E0B8' : '#FFD490';
  const livePanelBg = isCool
    ? 'linear-gradient(180deg, rgba(35,55,52,0.85), rgba(15,30,28,0.92))'
    : isLight
    ? 'linear-gradient(180deg, rgba(50,38,22,0.85), rgba(20,12,4,0.92))'
    : 'linear-gradient(180deg, rgba(40,20,8,0.85), rgba(20,8,2,0.92))';
  const livePanelBorder = isCool ? 'rgba(180,220,200,0.3)' : isLight ? 'rgba(245,225,195,0.3)' : 'rgba(255,170,100,0.3)';
  const liveDotColor = isCool ? '#8FD19E' : isLight ? '#FFD68A' : '#FF9A55';
  const liveNumColor = isCool ? '#E0F0E5' : isLight ? '#FFE5B0' : '#FFC975';

  return (
    <div style={{position:'absolute', top:0, left:0, right:0, zIndex:15,
      padding:'54px 16px 10px'}}>
      <div style={{display:'flex', alignItems:'flex-start', gap:10}}>
        <button style={{width:36, height:36, borderRadius:10, border:'none',
          background: buttonBg, outline:`1px solid ${buttonOutline}`, outlineOffset:-1,
          color: buttonColor, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          backdropFilter:'blur(6px)'}}>
          <IcL_CRV size={20} color="currentColor"/>
        </button>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:5,
            padding:'3px 8px', borderRadius:4,
            background: buttonBg, border:`1px solid ${buttonOutline}`,
            backdropFilter:'blur(6px)'}}>
            <span style={{width:5, height:5, borderRadius:'50%',
              background: dotColor, boxShadow:`0 0 6px ${dotColor}`}}/>
            <span className="mono" style={{fontSize:9, color: tagColor,
              letterSpacing:2.5, fontWeight:600}}>SAUNA · DAILY</span>
          </div>
          <div style={{marginTop:6, display:'flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:22, fontWeight:700, color: titleColor,
              letterSpacing:-0.6,
              textShadow: isCool
                ? '0 2px 6px rgba(10,30,25,0.85)'
                : isLight
                ? '0 2px 6px rgba(20,15,4,0.85)'
                : '0 2px 6px rgba(100,40,10,0.8)'}}>
              일상 사우나
            </span>
            <span style={{color: dotColor, opacity:0.85, display:'inline-flex'}}>
              <IcDail_CRV size={16} color="currentColor"/>
            </span>
          </div>
          <div style={{fontSize:11, color: subColor, marginTop:1,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            {sub} · 지금 {head}명
          </div>
        </div>

        <div style={{padding:'6px 10px', borderRadius:10,
          background: livePanelBg, border:`1px solid ${livePanelBorder}`,
          boxShadow:'0 3px 10px rgba(0,0,0,0.5)',
          textAlign:'center', minWidth:52}}>
          <div className="mono" style={{fontSize:7.5, color: liveDotColor,
            letterSpacing:1.6, fontWeight:600, marginBottom:2}}>LIVE</div>
          <div style={{fontSize:16, fontWeight:700, color: liveNumColor,
            fontFamily:"'JetBrains Mono', monospace",
            fontVariantNumeric:'tabular-nums'}}>{head}</div>
        </div>
      </div>

      {/* ambient label */}
      <div style={{marginTop:10}}>
        <div className="mono" style={{fontSize:8.5,
          color: isCool ? 'rgba(220,235,225,0.4)' : isLight ? 'rgba(245,232,210,0.4)' : 'rgba(255,220,180,0.4)',
          letterSpacing:1.8}}>
          AMBIENT · {ambientLabel} · VANISH RISE
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 공유 입력바
// ─────────────────────────────────────────────────────────────
function CRVInput({ keyboardUp, bg, border, sendBg, sendIconColor, placeholderColor, placeholder }) {
  return (
    <div style={{position:'absolute', bottom: keyboardUp ? 301 : 28,
      left:14, right:14, zIndex:52, height:48, borderRadius:14,
      background: bg, backdropFilter:'blur(14px)',
      border:`1px solid ${border}`,
      boxShadow:'0 4px 16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
      display:'flex', alignItems:'center', padding:'0 6px 0 16px'}}>
      <div style={{fontSize:14, color: placeholderColor, flex:1}}>
        {placeholder}
      </div>
      <button style={{width:36, height:36, borderRadius:10, border:'none',
        background: sendBg, color: sendIconColor, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)'}}>
        <IcUR_CRV size={18} color="currentColor"/>
      </button>
    </div>
  );
}

// keyframes
if (typeof document !== 'undefined' && !document.getElementById('crv-kf')) {
  const s = document.createElement('style');
  s.id = 'crv-kf';
  s.textContent = `
    @keyframes crv-steamA {
      0%,100% { transform: translateX(-50%) translateY(0); opacity: 0.18; }
      50%     { transform: translateX(-50%) translateY(-10px); opacity: 0.32; }
    }
    @keyframes crv-steamB {
      0%,100% { transform: translateY(0); opacity: 0.22; }
      50%     { transform: translateY(-12px); opacity: 0.42; }
    }
    @keyframes crv-coveB {
      0%,100% { opacity: 0.85; }
      50%     { opacity: 1; }
    }
    @keyframes crv-steamC1 {
      0%,100% { transform: translateY(0); opacity: 0.18; }
      50%     { transform: translateY(-8px); opacity: 0.36; }
    }
    @keyframes crv-steamC2 {
      0%,100% { transform: translateY(0); opacity: 0.16; }
      50%     { transform: translateY(-14px); opacity: 0.32; }
    }
    @keyframes crv-waterC {
      from { background-position-y: 0; }
      to   { background-position-y: 36px; }
    }
  `;
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────────────────────
// SaunaTable — 사우나 사이드 테이블 (식혜 + 맥반석 계란)
// 변형 위에 absolute로 얹는 데코레이션. variant prop으로 톤 매칭.
// ─────────────────────────────────────────────────────────────
function SaunaTable({ tone = 'warm', side = 'right', bottom = 110 }) {
  // tone: 'warm' (cedar) | 'light' (modern) | 'cool' (bath hall)
  const tableTop = tone === 'cool'
    ? 'linear-gradient(180deg, #8a6a48 0%, #6a4a30 100%)'
    : tone === 'light'
    ? 'linear-gradient(180deg, #6a543a 0%, #3a2a1a 100%)'
    : 'linear-gradient(180deg, #7a4e26 0%, #4a2c12 100%)';
  const tableEdge = tone === 'cool' ? 'rgba(255,220,180,0.18)'
    : tone === 'light' ? 'rgba(245,225,195,0.2)'
    : 'rgba(255,200,140,0.25)';

  const W_TBL = 132;
  const H_TBL = 8;
  const xStyle = side === 'right'
    ? { right: 14 }
    : { left: 14 };

  return (
    <div style={{position:'absolute', bottom, ...xStyle, zIndex: 6,
      width: W_TBL, height: 64, pointerEvents: 'none',
      filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.55))'}}>

      {/* Sikhye glass — 살얼음 식혜 */}
      <div style={{position:'absolute', left: 8, bottom: H_TBL,
        width: 26, height: 38}}>
        {/* glass body */}
        <div style={{position:'absolute', inset:0, borderRadius: '4px 4px 7px 7px',
          background:`
            linear-gradient(180deg,
              rgba(255,240,200,0.35) 0%,
              rgba(225,180,110,0.78) 22%,
              rgba(200,150,80,0.92) 100%)`,
          border: '1px solid rgba(255,235,200,0.55)',
          boxShadow:`
            inset -3px 0 6px rgba(120,70,20,0.45),
            inset 3px 0 4px rgba(255,240,200,0.35),
            0 2px 4px rgba(0,0,0,0.4)`,
          backdropFilter: 'blur(2px)',
        }}/>
        {/* 살얼음 + 잣 */}
        <div style={{position:'absolute', top: 4, left: 3, right: 3, height: 8,
          borderRadius: 2,
          background:`
            linear-gradient(180deg, rgba(255,250,235,0.7), rgba(255,240,210,0.4))`,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
        }}>
          <div style={{position:'absolute', top: 2, left: 5, width: 2, height: 2,
            borderRadius: '50%', background: '#E8C880'}}/>
          <div style={{position:'absolute', top: 3, left: 12, width: 2, height: 2,
            borderRadius: '50%', background: '#D8B870'}}/>
          <div style={{position:'absolute', top: 1, left: 18, width: 1.5, height: 1.5,
            borderRadius: '50%', background: '#E8C880'}}/>
        </div>
        {/* highlight */}
        <div style={{position:'absolute', top: 14, left: 4, width: 3, height: 18,
          borderRadius: 2,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0))',
        }}/>
      </div>

      {/* 맥반석 계란 — 갈색 구운 계란 2개 + 작은 trivet */}
      <div style={{position:'absolute', right: 6, bottom: H_TBL,
        width: 56, height: 28}}>
        {/* 작은 회색 stone tray */}
        <div style={{position:'absolute', bottom: 0, left: 0, right: 0, height: 8,
          borderRadius: 3,
          background:'linear-gradient(180deg, #6a635a 0%, #3e3830 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 3px rgba(0,0,0,0.45)',
        }}/>
        {/* egg 1 — 뒤 */}
        <div style={{position:'absolute', bottom: 5, left: 6,
          width: 18, height: 22, borderRadius: '50% 50% 48% 48%',
          background:`
            radial-gradient(ellipse at 35% 30%, #E8C9A0 0%, #C4956A 35%, #8a5a30 80%, #5a3a18 100%)`,
          boxShadow:`
            inset -2px -3px 4px rgba(60,28,8,0.6),
            inset 2px 2px 3px rgba(255,235,200,0.35),
            0 1px 2px rgba(0,0,0,0.4)`,
        }}/>
        {/* egg 2 — 앞 */}
        <div style={{position:'absolute', bottom: 4, right: 4,
          width: 19, height: 23, borderRadius: '50% 50% 48% 48%',
          background:`
            radial-gradient(ellipse at 35% 28%, #ECCEA5 0%, #C89870 35%, #8e5e34 80%, #5a3a18 100%)`,
          boxShadow:`
            inset -2px -3px 4px rgba(60,28,8,0.6),
            inset 2px 2px 3px rgba(255,235,200,0.35),
            0 1px 2px rgba(0,0,0,0.4)`,
        }}/>
        {/* 살짝 김 */}
        <div style={{position:'absolute', top: -8, left: 18,
          width: 14, height: 14, opacity: 0.45,
          background:`radial-gradient(circle at 50% 60%, rgba(255,240,220,0.7), transparent 65%)`,
          filter: 'blur(2px)',
          animation: 'crv-eggsteam 4s ease-in-out infinite',
        }}/>
      </div>

      {/* 테이블 상판 */}
      <div style={{position:'absolute', bottom: 0, left: 0, right: 0, height: H_TBL,
        borderRadius: 2,
        background: tableTop,
        border: `1px solid ${tableEdge}`,
        boxShadow: `inset 0 1px 0 ${tableEdge}, 0 1px 2px rgba(0,0,0,0.5)`,
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 변형에 사이드 테이블 얹은 wrapper들
// ─────────────────────────────────────────────────────────────
function ChatRoomCedarGroveWithTable(props) {
  return (
    <div style={{position:'relative', width: props.width || 393, height: props.height || 852}}>
      <ChatRoomCedarGrove {...props}/>
      <SaunaTable tone="warm" side="right" bottom={104}/>
    </div>
  );
}
function ChatRoomModernStoneWithTable(props) {
  return (
    <div style={{position:'relative', width: props.width || 393, height: props.height || 852}}>
      <ChatRoomModernStone {...props}/>
      <SaunaTable tone="light" side="right" bottom={108}/>
    </div>
  );
}
function ChatRoomBathHallWithTable(props) {
  return (
    <div style={{position:'relative', width: props.width || 393, height: props.height || 852}}>
      <ChatRoomBathHall {...props}/>
      <SaunaTable tone="cool" side="right" bottom={108}/>
    </div>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('crv-egg-kf')) {
  const s = document.createElement('style');
  s.id = 'crv-egg-kf';
  s.textContent = `
    @keyframes crv-eggsteam {
      0%,100% { transform: translateY(0) scale(0.9); opacity: 0.25; }
      50%     { transform: translateY(-6px) scale(1.1); opacity: 0.5; }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, {
  ChatRoomCedarGrove,
  ChatRoomModernStone,
  ChatRoomBathHall,
  SaunaTable,
  ChatRoomCedarGroveWithTable,
  ChatRoomModernStoneWithTable,
  ChatRoomBathHallWithTable,
});
