// Sauna variants — 메시지 휘발 방식 3종, 컨셉 비교용 대안
// 1. SteamRise (기본 - 위로 올라가며 흩어짐)
// 2. SteamFade (제자리에서 페이드)
// 3. SteamScatter (옆으로 흩날리며 사라짐)

const { SAUNA: SAUNA_V } = window;

// ============================================================
// SteamWhisperVariant — 휘발 방식 props로 선택
// ============================================================
function SteamWhisperVariant({ msg, width, isMine, vanishStyle = 'rise', keyboardUp = false }) {
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

  let x, y, opacity, blur, scale, rotate = 0;

  if (vanishStyle === 'rise') {
    const yStart = keyboardUp ? 340 : 500;
    const yEnd   = keyboardUp ? 20  : 20;
    y = yStart + (yEnd - yStart) * t;
    x = msg.x * width + Math.sin(t * 3.2) * (keyboardUp ? 8 : 12);
    opacity = t < 0.10 ? t / 0.10 : t > 0.72 ? (1 - t) / 0.28 : 1;
    blur = t > 0.62 ? (t - 0.62) * 12 : 0;
    scale = 0.9 + t * 0.15;
  } else if (vanishStyle === 'fade') {
    // 제자리에서 fade-out (편안)
    const yMid = keyboardUp ? 200 : 280;
    y = yMid + (msg.x - 0.5) * 200; // x로 y흩뜨림
    x = msg.x * width;
    opacity = t < 0.12 ? t / 0.12 : t > 0.5 ? (1 - t) / 0.5 : 1;
    blur = t > 0.5 ? (t - 0.5) * 8 : 0;
    scale = 0.95 + t * 0.05;
  } else {
    // scatter — 옆으로 날아가며 사라짐
    const baseY = keyboardUp ? 220 : 320;
    y = baseY + Math.sin(t * 2) * 30 - t * 60;
    const drift = (msg.x > 0.5 ? 1 : -1) * t * 100;
    x = msg.x * width + drift;
    opacity = t < 0.15 ? t / 0.15 : t > 0.55 ? (1 - t) / 0.45 : 1;
    blur = t > 0.5 ? (t - 0.5) * 14 : 0;
    scale = 1 - t * 0.1;
    rotate = (msg.x > 0.5 ? 1 : -1) * t * 8;
  }

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`,
      opacity, filter: blur ? `blur(${blur}px)` : 'none',
      pointerEvents: 'none', willChange: 'transform, opacity',
      textAlign: 'center',
    }}>
      <div style={{
        display: 'inline-block',
        padding: keyboardUp ? '6px 12px' : '8px 14px',
        borderRadius: keyboardUp ? 12 : 14,
        background: isMine
          ? 'linear-gradient(180deg, rgba(255,220,150,0.5), rgba(255,180,100,0.38))'
          : 'linear-gradient(180deg, rgba(255,230,190,0.32), rgba(255,210,160,0.2))',
        backdropFilter: 'blur(4px)',
        border: isMine
          ? '1.5px solid rgba(255,210,120,0.8)'
          : '1px solid rgba(255,220,180,0.35)',
        boxShadow: isMine
          ? '0 0 22px rgba(255,180,80,0.45), 0 2px 6px rgba(0,0,0,0.3)'
          : '0 0 14px rgba(255,200,140,0.25), 0 2px 4px rgba(0,0,0,0.3)',
        maxWidth: keyboardUp ? 240 : 280,
      }}>
        <div className="mono" style={{
          fontSize: 9, color: isMine ? '#FFE09A' : '#FFD4A0',
          letterSpacing: 0.3, marginBottom: 2, fontWeight: 700, opacity: 0.95,
        }}>{msg.nickname}</div>
        <div style={{
          fontSize: keyboardUp ? 12 : 13, fontWeight: 500, color: '#fff8ec',
          lineHeight: 1.4, textShadow: '0 1px 3px rgba(50,15,0,0.9)',
          wordBreak: 'keep-all', textWrap: 'pretty',
        }}>{msg.text}</div>
      </div>
    </div>
  );
}

// ============================================================
// RoomVariant — 휘발 방식과 인원수, 시간대 모두 props 노출
// ============================================================
function RoomVariant({
  roomId = 'daily',
  crowd = 'medium',
  vanishStyle = 'rise',
  width = 393, height = 852,
  keyboardUp = false,
}) {
  const { SAUNA, IcArrowLeft, IcArrowUpRight,
    IcDaily, IcStock, IcJob } = window;

  const rooms = {
    daily: { name: '일상 사우나', tag: 'DAILY', sub: '오늘 하루 흘려보내기' },
    job:   { name: '취준 사우나', tag: 'JOB',   sub: '면접 뒤끝 · 막막함 전부' },
    stock: { name: '주식 사우나', tag: 'STOCK', sub: '열받은 장에서 잠깐' },
  };
  const config = rooms[roomId] || rooms.daily;
  const accent = (SAUNA.room[roomId] || {}).accent || SAUNA.heat[400];

  const density = {
    lonely: { spawnMs: 8000, maxMsgs: 2, mineChance: 0.08, lifeMs: 12000,
              headCount: { daily: 2, job: 3, stock: 1 }[roomId] || 2 },
    medium: { spawnMs: 1300, maxMsgs: 6, mineChance: 0.30, lifeMs: 8500,
              headCount: { daily: 12, job: 14, stock: 11 }[roomId] || 12 },
    packed: { spawnMs: 550, maxMsgs: 12, mineChance: 0.22, lifeMs: 6000,
              headCount: { daily: 142, job: 188, stock: 312 }[roomId] || 142 },
  }[crowd] || { spawnMs: 1300, maxMsgs: 6, mineChance: 0.3, lifeMs: 8500, headCount: 12 };

  const [msgs, setMsgs] = React.useState([]);
  const idRef = React.useRef(0);
  const MY_ID = 'me-self';

  const BANK = {
    daily: [
      { text: '하… 여기 앉으니까 어깨가 녹는다', nickname: '녹아내리는수달' },
      { text: '하루가 땀으로 빠져나가는 느낌', nickname: '뽀송한너구리' },
      { text: '눈 감고 있으면 시간 멈춰', nickname: '쉬는고양이' },
      { text: '오늘 진짜 힘들었다…', nickname: '지친여우' },
      { text: '말 없이 같이 땀 흘리는 것도 좋네', nickname: '조용한두루미' },
      { text: '여기 나오면 잘 잘 수 있어', nickname: '꿀잠기원' },
    ],
    job: [
      { text: '면접 끝나고 바로 여기 들어옴', nickname: '식은땀토끼' },
      { text: '오늘도 서류 광탈…', nickname: '털린북극곰' },
      { text: '내일 발표 난다 심장 터질 듯', nickname: '두근두근' },
      { text: '같이 뜨겁게 버텨요 우리', nickname: '버티는사슴' },
      { text: '우리 다 된다 진짜', nickname: '긍정여우' },
    ],
    stock: [
      { text: '장 열리자마자 -5% 찍음', nickname: '불타는개미' },
      { text: '존버가 답이다', nickname: '존버왕' },
      { text: 'VI 걸렸다 심박수 미침', nickname: '심장터짐' },
      { text: '오히려 좋아 더 담자', nickname: '용감한거북' },
      { text: '여기 앉으니 마음이 좀 진정됨', nickname: '숨고르는' },
    ],
  };

  React.useEffect(() => {
    const bank = BANK[roomId] || BANK.daily;
    let cancelled = false;
    const spawn = (isMine = false) => {
      const m = bank[Math.floor(Math.random() * bank.length)];
      if (!m) return;
      const id = ++idRef.current;
      const x = 0.15 + Math.random() * 0.7;
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
    const init = crowd === 'packed' ? 8 : crowd === 'medium' ? 4 : 1;
    const k = [];
    for (let j = 0; j < init; j++) k.push(setTimeout(spawn, j * 200));
    return () => { cancelled = true; clearInterval(i); clearInterval(mine); k.forEach(clearTimeout); };
  }, [roomId, crowd, vanishStyle]);

  const plankBg = `
    linear-gradient(180deg, rgba(50,25,10,0.35) 0%, transparent 14%, transparent 86%, rgba(30,14,4,0.45) 100%),
    repeating-linear-gradient(90deg,
      #C08A55 0px, #C89362 8px, #B47A47 9px, #B47A47 10px,
      #C89362 11px, #BE8858 24px, #A87140 25px, #A87140 26px,
      #BE8858 27px, #C08A55 40px)`;

  return (
    <div style={{
      position: 'relative', width, height, overflow: 'hidden',
      fontFamily: "'Noto Sans KR', -apple-system, sans-serif",
      background: plankBg, backgroundSize: '40px 100%, 40px 100%',
      color: '#FFE8C8',
    }}>
      <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:2,
        background:`radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,180,90,0.28), transparent 70%)`}}/>

      {/* Header */}
      <div style={{position:'absolute', top:0, left:0, right:0, zIndex:15,
        padding:'54px 16px 10px'}}>
        <div style={{display:'flex', alignItems:'flex-start', gap:10}}>
          <button style={{width:36,height:36,borderRadius:10,border:'none',
            background:'rgba(20,8,2,0.7)', outline:'1px solid rgba(255,200,140,0.3)',
            outlineOffset:-1, color:'#FFD490', cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center'}}>
            <IcArrowLeft size={20} color="currentColor"/>
          </button>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:5,
              padding:'3px 8px', borderRadius:4,
              background:'rgba(20,8,2,0.55)',
              border:'1px solid rgba(255,200,140,0.25)'}}>
              <span style={{width:5,height:5,borderRadius:'50%',
                background:'#FF8A3B',boxShadow:'0 0 6px #FF8A3B'}}/>
              <span className="mono" style={{fontSize:9,color:'#FFD4A0',
                letterSpacing:2.5,fontWeight:600}}>SAUNA · {config.tag}</span>
            </div>
            <div style={{marginTop:6,fontSize:22,fontWeight:700,
              color:'#FFE8C8',letterSpacing:-0.6,
              textShadow:'0 2px 6px rgba(100,40,10,0.8)'}}>{config.name}</div>
            <div style={{fontSize:11,color:'rgba(255,220,180,0.65)',marginTop:1}}>
              {config.sub} · 지금 {density.headCount.toLocaleString()}명
            </div>
          </div>
          <div style={{padding:'6px 10px',borderRadius:10,
            background:'linear-gradient(180deg,rgba(40,20,8,0.8),rgba(20,8,2,0.9))',
            border:'1px solid rgba(255,170,100,0.25)',textAlign:'center',minWidth:52}}>
            <div className="mono" style={{fontSize:7.5,color:'#FF9A55',
              letterSpacing:1.6,fontWeight:600,marginBottom:2}}>LIVE</div>
            <div style={{fontSize:16,fontWeight:700,color:'#FFC975',
              fontFamily:"'JetBrains Mono', monospace"}}>
              {density.headCount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* vanish style indicator (디버깅용) */}
        <div style={{marginTop:10}}>
          <div className="mono" style={{fontSize:8.5,
            color:'rgba(255,220,180,0.45)',letterSpacing:1.5}}>
            VANISH · {vanishStyle.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Stage */}
      <div style={{position:'absolute', top:180, left:0, right:0,
        bottom: keyboardUp ? 352 : 96, overflow:'hidden', zIndex:8}}>
        {msgs.map(m => (
          <SteamWhisperVariant
            key={m.id} msg={m} width={width}
            isMine={m.senderId === MY_ID}
            vanishStyle={vanishStyle}
            keyboardUp={keyboardUp}
          />
        ))}
      </div>

      {/* Input */}
      <div style={{position:'absolute', bottom: keyboardUp?301:28,
        left:14, right:14, zIndex:52, height:48, borderRadius:14,
        background:'linear-gradient(180deg, rgba(60,30,12,0.75), rgba(30,14,4,0.85))',
        border:'1px solid rgba(255,190,120,0.35)',
        display:'flex',alignItems:'center',padding:'0 6px 0 16px'}}>
        <div style={{fontSize:14,color:'rgba(255,220,180,0.55)',flex:1}}>
          천천히 뱉어봐…
        </div>
        <button style={{width:36,height:36,borderRadius:10,border:'none',
          background:'linear-gradient(180deg,#FFB060,#E87020)',color:'#2a1000',
          display:'flex',alignItems:'center',justifyContent:'center'}}>
          <IcArrowUpRight size={18} color="currentColor"/>
        </button>
      </div>

      {/* Floor */}
      {!keyboardUp && <div style={{position:'absolute',bottom:0,left:0,right:0,height:96,zIndex:4,
        background: `linear-gradient(180deg, rgba(40,18,5,0) 0%, rgba(40,18,5,0.55) 100%)`,
        boxShadow:'inset 0 6px 14px rgba(0,0,0,0.55)'}}/>}
    </div>
  );
}

// ============================================================
// 대안 컨셉 — "Bath House" (목욕탕) 메타포
// 사우나가 너무 좁다면 더 넓은 메타포: 공중목욕탕 = 익명 + 휴식 + 공간 분리
// 메시지가 "수증기" 대신 "물결"로 퍼짐
// ============================================================
function ConceptBathHouse({ roomId = 'daily', width = 393, height = 852 }) {
  const { SAUNA, IcArrowLeft, IcArrowUpRight, IcDaily } = window;

  const accent = '#7BB8C4'; // 욕탕 청록
  const [ripples, setRipples] = React.useState([]);
  const idRef = React.useRef(0);

  const BANK = [
    { text: '물에 몸 담그고 있어요', nickname: '잠긴고양이' },
    { text: '오늘 하루 다 풀어진다', nickname: '풀린수달' },
    { text: '같이 따뜻하게 있자', nickname: '따뜻한곰' },
    { text: '여기 조용해서 좋아', nickname: '말없는학' },
    { text: '하루의 무게가 가볍네', nickname: '가벼워진' },
  ];

  React.useEffect(() => {
    let cancelled = false;
    const spawn = () => {
      const m = BANK[Math.floor(Math.random() * BANK.length)];
      const id = ++idRef.current;
      const x = 0.2 + Math.random() * 0.6;
      const y = 0.3 + Math.random() * 0.4;
      const life = 8000;
      setRipples(prev => [...prev, { id, ...m, x, y, spawnAt: performance.now(), life }].slice(-5));
      setTimeout(() => { if (!cancelled) setRipples(p => p.filter(r => r.id !== id)); }, life + 400);
    };
    const i = setInterval(spawn, 1800);
    spawn();
    return () => { cancelled = true; clearInterval(i); };
  }, []);

  return (
    <div style={{
      position:'relative', width, height, overflow:'hidden',
      fontFamily:"'Noto Sans KR', -apple-system, sans-serif",
      background:`
        radial-gradient(ellipse 100% 60% at 50% 100%, rgba(60,120,140,0.3), transparent),
        linear-gradient(180deg, #0a1820 0%, #0f2530 50%, #0a1820 100%)`,
      color:'#E8F4F8',
    }}>
      {/* water surface */}
      <div style={{position:'absolute',inset:0,
        background:`repeating-linear-gradient(0deg, rgba(123,184,196,0.06) 0px, transparent 2px, transparent 8px)`,
        pointerEvents:'none'}}/>

      {/* tile pattern at top */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:120,
        background:`repeating-linear-gradient(90deg, rgba(120,180,200,0.1) 0 38px, rgba(80,140,160,0.15) 38px 40px)`,
        opacity:0.5}}/>

      {/* Header */}
      <div style={{position:'absolute',top:0,left:0,right:0,zIndex:15,
        padding:'54px 16px 10px'}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
          <button style={{width:36,height:36,borderRadius:10,border:'none',
            background:'rgba(10,30,40,0.7)',outline:'1px solid rgba(150,200,220,0.3)',
            outlineOffset:-1,color:'#A8DCE8',cursor:'pointer',
            display:'flex',alignItems:'center',justifyContent:'center'}}>
            <IcArrowLeft size={20} color="currentColor"/>
          </button>
          <div style={{flex:1}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:5,
              padding:'3px 8px',borderRadius:4,
              background:'rgba(10,30,40,0.55)',
              border:'1px solid rgba(150,200,220,0.25)'}}>
              <span style={{width:5,height:5,borderRadius:'50%',
                background:accent,boxShadow:`0 0 6px ${accent}`}}/>
              <span className="mono" style={{fontSize:9,color:'#A8DCE8',
                letterSpacing:2.5,fontWeight:600}}>BATH · DAILY</span>
            </div>
            <div style={{marginTop:6,fontSize:22,fontWeight:700,
              color:'#E8F4F8',letterSpacing:-0.6}}>일상 욕탕</div>
            <div style={{fontSize:11,color:'rgba(200,230,240,0.65)',marginTop:1}}>
              물에 잠겨 하루를 풀기 · 12명
            </div>
          </div>
        </div>
      </div>

      {/* Ripple messages */}
      <div style={{position:'absolute',top:180,left:0,right:0,bottom:120,
        overflow:'hidden',zIndex:8}}>
        {ripples.map(r => (
          <RippleMessage key={r.id} msg={r} width={width}/>
        ))}
      </div>

      {/* Input */}
      <div style={{position:'absolute',bottom:28,left:14,right:14,zIndex:52,
        height:48,borderRadius:14,
        background:'linear-gradient(180deg,rgba(20,50,65,0.75),rgba(10,25,35,0.85))',
        border:`1px solid rgba(150,200,220,0.35)`,
        display:'flex',alignItems:'center',padding:'0 6px 0 16px'}}>
        <div style={{fontSize:14,color:'rgba(200,230,240,0.55)',flex:1}}>
          물결처럼 천천히…
        </div>
        <button style={{width:36,height:36,borderRadius:10,border:'none',
          background:`linear-gradient(180deg,${accent},#3A6878)`,color:'#0a1820',
          display:'flex',alignItems:'center',justifyContent:'center'}}>
          <IcArrowUpRight size={18} color="currentColor"/>
        </button>
      </div>
    </div>
  );
}

function RippleMessage({ msg, width }) {
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
  }, [msg.id]);

  const x = msg.x * width;
  const y = msg.y * 400 + 50;
  const opacity = t < 0.15 ? t / 0.15 : t > 0.6 ? (1 - t) / 0.4 : 1;
  const scale = 1 + t * 0.08;

  return (
    <div style={{position:'absolute',left:x,top:y,
      transform:`translate(-50%,-50%) scale(${scale})`,opacity,
      pointerEvents:'none',textAlign:'center'}}>
      {/* ripple ring */}
      <div style={{position:'absolute',inset:'-20px',
        border:`1px solid rgba(168,220,232,${0.5 - t*0.5})`,
        borderRadius:'50%',transform:`scale(${1 + t*1.5})`,
        pointerEvents:'none'}}/>
      <div style={{display:'inline-block',padding:'8px 14px',borderRadius:14,
        background:'linear-gradient(180deg,rgba(150,210,225,0.25),rgba(80,140,160,0.15))',
        backdropFilter:'blur(6px)',
        border:'1px solid rgba(168,220,232,0.35)',
        boxShadow:'0 0 14px rgba(120,180,200,0.3)',
        maxWidth:280}}>
        <div className="mono" style={{fontSize:9,color:'#A8DCE8',
          letterSpacing:0.3,marginBottom:2,fontWeight:700}}>{msg.nickname}</div>
        <div style={{fontSize:13,fontWeight:500,color:'#F0FAFC',
          lineHeight:1.4,textShadow:'0 1px 3px rgba(0,15,25,0.9)'}}>{msg.text}</div>
      </div>
    </div>
  );
}

Object.assign(window, { SteamWhisperVariant, RoomVariant, ConceptBathHouse });
