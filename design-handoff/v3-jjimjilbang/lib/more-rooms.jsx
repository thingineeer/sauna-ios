// MoreRooms — 추가 사우나 컨셉 시안 (한국 찜질방 데이터 기반)
// D · 한국 찜질방 (황토방, 양머리수건, 마룻바닥)
// E · 소금방 (히말라야 핑크 솔트 벽)
// F · 얼음방 (냉탕, 푸른 톤)
// G · 편백나무방 (편백나무 결, 청량 그린)
//
// 모두 동일 채팅 UX (rise vanish), 픽셀 캐릭터(콩이) 배치.

const { ChatRoomCedarGrove: _crv1, RiseMsg: _crv2 } = window; // not used directly
const { PixelMascot } = window;

// 동일한 message bank 사용
const MR_BANK = [
  { text: '하… 여기 앉으니까 어깨가 녹는다', nickname: '녹아내리는수달' },
  { text: '하루가 땀으로 빠져나가는 느낌',   nickname: '뽀송한너구리' },
  { text: '눈 감고 있으면 시간 멈춰',        nickname: '쉬는고양이' },
  { text: '몸이 따뜻해지니까 마음도 말랑해', nickname: '포근한햄스터' },
  { text: '오늘 진짜 힘들었다…',            nickname: '지친여우' },
  { text: '말 없이 같이 땀 흘리는 것도 좋네', nickname: '조용한두루미' },
  { text: '여기 나오면 잘 잘 수 있어',       nickname: '꿀잠기원' },
  { text: '아 이 온기에 중독됐다',          nickname: '노곤한사슴' },
];

// rise message — 변형 공통
function MRMsg({ msg, width, isMine, palette }) {
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

  const y = 500 + (20 - 500) * t;
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
        display: 'inline-block', padding: '8px 14px', borderRadius: 14,
        background: isMine ? palette.bubbleMineBg : palette.bubbleBg,
        backdropFilter: 'blur(5px)',
        border: `${isMine ? 1.5 : 1}px solid ${isMine ? palette.bubbleMineBorder : palette.bubbleBorder}`,
        boxShadow: isMine ? palette.bubbleMineShadow : palette.bubbleShadow,
        maxWidth: 280,
      }}>
        <div className="mono" style={{
          fontSize: 9, color: isMine ? palette.nickMine : palette.nick,
          letterSpacing: 0.3, marginBottom: 2, fontWeight: 700, opacity: 0.95,
        }}>{msg.nickname}</div>
        <div style={{
          fontSize: 13, fontWeight: 500, color: palette.text,
          lineHeight: 1.4, textShadow: palette.textShadow,
          wordBreak: 'keep-all', textWrap: 'pretty',
        }}>{msg.text}</div>
      </div>
    </div>
  );
}

function useMRSim() {
  const [msgs, setMsgs] = React.useState([]);
  const idRef = React.useRef(0);
  const MY_ID = 'me-self';
  React.useEffect(() => {
    let cancelled = false;
    const spawn = (isMine = false) => {
      const m = MR_BANK[Math.floor(Math.random() * MR_BANK.length)];
      const id = ++idRef.current;
      const x = 0.18 + Math.random() * 0.64;
      const life = 8500 + Math.random() * 2500;
      setMsgs(prev => [...prev,
        { id, ...m, x, spawnAt: performance.now(), life,
          senderId: isMine ? MY_ID : 'u' + id,
          nickname: isMine ? '나' : m.nickname }
      ].slice(-6));
      setTimeout(() => { if (!cancelled) setMsgs(p => p.filter(x => x.id !== id)); }, life + 400);
    };
    const i = setInterval(spawn, 1400);
    const mine = setInterval(() => { if (Math.random() < 0.3) spawn(true); }, 4800);
    const k = [];
    for (let j = 0; j < 4; j++) k.push(setTimeout(spawn, j * 220));
    return () => { cancelled = true; clearInterval(i); clearInterval(mine); k.forEach(clearTimeout); };
  }, []);
  return { msgs, MY_ID };
}

// 공유 헤더 (간단 버전)
function MRHeader({ ambientLabel, sub, head = 12, accentColor, titleColor, subColor, panelBg, panelBorder, dotColor }) {
  return (
    <div style={{position:'absolute', top:0, left:0, right:0, zIndex:15,
      padding:'54px 16px 10px'}}>
      <div style={{display:'flex', alignItems:'flex-start', gap:10}}>
        <button style={{width:36, height:36, borderRadius:10, border:'none',
          background: panelBg, outline:`1px solid ${panelBorder}`, outlineOffset:-1,
          color: titleColor, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          backdropFilter:'blur(6px)', fontSize: 20}}>‹</button>
        <div style={{flex:1, minWidth:0}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:5,
            padding:'3px 8px', borderRadius:4,
            background: panelBg, border:`1px solid ${panelBorder}`,
            backdropFilter:'blur(6px)'}}>
            <span style={{width:5, height:5, borderRadius:'50%',
              background: dotColor, boxShadow:`0 0 6px ${dotColor}`}}/>
            <span className="mono" style={{fontSize:9, color: accentColor,
              letterSpacing:2.5, fontWeight:600}}>SAUNA · DAILY</span>
          </div>
          <div style={{marginTop:6, fontSize:22, fontWeight:700, color: titleColor,
            letterSpacing:-0.6,
            textShadow:'0 2px 6px rgba(0,0,0,0.6)'}}>
            일상 사우나
          </div>
          <div style={{fontSize:11, color: subColor, marginTop:1}}>
            {sub} · 지금 {head}명
          </div>
        </div>
        <div style={{padding:'6px 10px', borderRadius:10,
          background: panelBg, border:`1px solid ${panelBorder}`,
          textAlign:'center', minWidth:52}}>
          <div className="mono" style={{fontSize:7.5, color: dotColor,
            letterSpacing:1.6, fontWeight:600, marginBottom:2}}>LIVE</div>
          <div style={{fontSize:16, fontWeight:700, color: titleColor,
            fontFamily:"'JetBrains Mono', monospace"}}>{head}</div>
        </div>
      </div>
      <div style={{marginTop:10}}>
        <div className="mono" style={{fontSize:8.5, color: subColor,
          letterSpacing:1.8}}>
          AMBIENT · {ambientLabel} · VANISH RISE
        </div>
      </div>
    </div>
  );
}

function MRInput({ bg, border, sendBg, sendIconColor, placeholderColor, placeholder }) {
  return (
    <div style={{position:'absolute', bottom: 28,
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
        boxShadow:'0 2px 8px rgba(0,0,0,0.4)', fontSize: 18, fontWeight: 700}}>↗</button>
    </div>
  );
}

// ============================================================
// D · 한국 찜질방 — 황토방 (red clay 벽돌, 마룻바닥, 양머리수건)
// ============================================================
function ChatRoomJjimjilbang({ width = 393, height = 852 }) {
  const { msgs, MY_ID } = useMRSim();
  const palette = {
    bubbleBg:        'linear-gradient(180deg, rgba(255,220,180,0.36), rgba(230,180,130,0.22))',
    bubbleMineBg:    'linear-gradient(180deg, rgba(255,200,130,0.55), rgba(230,150,80,0.42))',
    bubbleBorder:    'rgba(255,210,170,0.42)',
    bubbleMineBorder:'rgba(255,180,100,0.85)',
    bubbleShadow:    '0 0 14px rgba(220,140,80,0.3), 0 2px 4px rgba(40,15,0,0.4)',
    bubbleMineShadow:'0 0 24px rgba(255,160,80,0.5), 0 2px 6px rgba(40,15,0,0.4)',
    nick:'#FFD4A0', nickMine:'#FFE5A0',
    text:'#FFF0D8', textShadow:'0 1px 3px rgba(50,15,0,0.95)',
  };

  // 황토 벽돌 패턴 — 작은 사각 황토 돔 벽
  const clayBg = `
    linear-gradient(180deg, rgba(80,30,12,0.65) 0%, transparent 18%, transparent 65%, rgba(40,18,5,0.6) 100%),
    repeating-linear-gradient(0deg,
      #B86A40 0px, #B86A40 28px,
      #6a3818 28px, #6a3818 30px,
      #C8784a 30px, #C8784a 58px,
      #6a3818 58px, #6a3818 60px),
    repeating-linear-gradient(90deg,
      rgba(0,0,0,0) 0px, rgba(0,0,0,0) 56px,
      rgba(60,28,10,0.7) 56px, rgba(60,28,10,0.7) 58px)`;

  return (
    <div style={{position:'relative', width, height, overflow:'hidden',
      fontFamily:"'Noto Sans KR', sans-serif",
      background: clayBg, color:'#FFE8C8'}}>

      {/* 천장 황토 돔 글로우 */}
      <div style={{position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
        background:`
          radial-gradient(ellipse 90% 35% at 50% -5%, rgba(255,150,80,0.5), transparent 70%),
          radial-gradient(ellipse 100% 40% at 50% 100%, rgba(255,140,60,0.18), transparent 60%)`}}/>

      {/* 마룻바닥 매트 패턴 (사진 1, 한국 찜질방의 특징) */}
      <div style={{position:'absolute', bottom:0, left:0, right:0, height:140, zIndex:3,
        background:`
          linear-gradient(180deg, transparent 0%, rgba(40,18,5,0.4) 70%),
          repeating-linear-gradient(90deg,
            #8c6238 0px, #8c6238 14px,
            #5a3a18 14px, #5a3a18 16px,
            #9c7048 16px, #9c7048 30px,
            #5a3a18 30px, #5a3a18 32px)`,
        boxShadow:'inset 0 8px 16px rgba(0,0,0,0.5)'}}/>

      {/* 황토 가마 디테일 — 좌상단 작은 등 */}
      <div style={{position:'absolute', top: 130, right: 22, zIndex: 3,
        width: 32, height: 38, borderRadius: '50% 50% 8px 8px',
        background:'radial-gradient(ellipse at 50% 70%, #FFD68A 0%, #FF9050 40%, #C95830 80%, #5a2010 100%)',
        boxShadow:'0 0 24px rgba(255,160,80,0.6)',
        border:'1px solid rgba(80,30,10,0.6)'}}/>

      {/* Header */}
      <MRHeader ambientLabel="JJIMJILBANG · 황토방"
        sub="한국 찜질방"
        accentColor="#FFD4A0" titleColor="#FFE8C8"
        subColor="rgba(255,220,180,0.7)"
        panelBg="rgba(40,15,5,0.75)" panelBorder="rgba(255,170,100,0.35)"
        dotColor="#FF8A3B"/>

      {/* 메시지 stage */}
      <div style={{position:'absolute', top:180, left:0, right:0,
        bottom: 96, overflow:'hidden', zIndex:8}}>
        {msgs.map(m => (
          <MRMsg key={m.id} msg={m} width={width}
            isMine={m.senderId === MY_ID} palette={palette}/>
        ))}
      </div>

      {/* 콩이 (양머리수건 + 졸기) - 마룻바닥 위 */}
      <div style={{position:'absolute', bottom: 100, left: 24, zIndex: 9,
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))'}}>
        <PixelMascot pose="doze" tone="warm" size={16} scale={4}/>
      </div>
      {/* 콩이 (식혜) — 우측 */}
      <div style={{position:'absolute', bottom: 110, right: 30, zIndex: 9,
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))'}}>
        <PixelMascot pose="drink" tone="warm" size={16} scale={4}/>
      </div>

      <MRInput bg='linear-gradient(180deg, rgba(60,28,12,0.78), rgba(30,12,4,0.92))'
        border='rgba(255,180,120,0.4)'
        sendBg='linear-gradient(180deg, #FFB060, #C95830)'
        sendIconColor='#2a1000'
        placeholderColor='rgba(255,220,180,0.55)'
        placeholder='땀과 함께 흘려보내…'/>
    </div>
  );
}

// ============================================================
// E · 소금방 — 히말라야 핑크 솔트 벽돌
// ============================================================
function ChatRoomSaltRoom({ width = 393, height = 852 }) {
  const { msgs, MY_ID } = useMRSim();
  const palette = {
    bubbleBg:        'linear-gradient(180deg, rgba(255,220,210,0.35), rgba(255,180,170,0.22))',
    bubbleMineBg:    'linear-gradient(180deg, rgba(255,200,180,0.55), rgba(255,150,130,0.42))',
    bubbleBorder:    'rgba(255,225,210,0.45)',
    bubbleMineBorder:'rgba(255,190,160,0.85)',
    bubbleShadow:    '0 0 18px rgba(255,180,160,0.35), 0 2px 4px rgba(60,20,15,0.4)',
    bubbleMineShadow:'0 0 26px rgba(255,160,130,0.5), 0 2px 6px rgba(60,20,15,0.4)',
    nick:'#FFD0C0', nickMine:'#FFE0C0',
    text:'#FFF4EC', textShadow:'0 1px 3px rgba(50,20,15,0.95)',
  };

  // 핑크 솔트 벽돌 — 글로우 받는 핑크 사각형
  const saltBrickBg = `
    linear-gradient(180deg, rgba(120,40,30,0.5) 0%, transparent 14%, transparent 80%, rgba(60,20,15,0.7) 100%),
    repeating-linear-gradient(0deg,
      rgba(0,0,0,0) 0px, rgba(0,0,0,0) 32px,
      rgba(60,20,15,0.6) 32px, rgba(60,20,15,0.6) 34px),
    repeating-linear-gradient(90deg,
      rgba(0,0,0,0) 0px, rgba(0,0,0,0) 38px,
      rgba(60,20,15,0.5) 38px, rgba(60,20,15,0.5) 40px),
    radial-gradient(ellipse at 30% 40%, #FF9C90 0%, #E0786A 35%, #B85440 70%, #6A2818 100%)`;

  return (
    <div style={{position:'relative', width, height, overflow:'hidden',
      fontFamily:"'Noto Sans KR', sans-serif",
      background: saltBrickBg, color:'#FFF4EC'}}>

      {/* 솔트 벽돌 backlight — 각 벽돌이 글로우 (크리스탈 느낌) */}
      <div style={{position:'absolute', inset:0, zIndex:1, pointerEvents:'none',
        opacity: 0.55,
        background:`
          radial-gradient(circle 18px at 60px 80px, rgba(255,200,180,0.6), transparent 70%),
          radial-gradient(circle 14px at 180px 130px, rgba(255,180,160,0.5), transparent 70%),
          radial-gradient(circle 20px at 320px 210px, rgba(255,210,190,0.55), transparent 70%),
          radial-gradient(circle 16px at 100px 260px, rgba(255,190,170,0.5), transparent 70%),
          radial-gradient(circle 18px at 280px 360px, rgba(255,200,180,0.5), transparent 70%),
          radial-gradient(circle 14px at 60px 440px, rgba(255,180,160,0.45), transparent 70%),
          radial-gradient(circle 20px at 220px 520px, rgba(255,210,190,0.5), transparent 70%)`,
        animation: 'mr-saltglow 6s ease-in-out infinite',
      }}/>

      {/* 천장 따뜻한 글로우 */}
      <div style={{position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
        background:`radial-gradient(ellipse 80% 40% at 50% -5%, rgba(255,180,150,0.45), transparent 70%)`}}/>

      {/* 솔트 램프 — 클래식 핑크 솔트 램프 */}
      <div style={{position:'absolute', top: 130, right: 22, zIndex: 3,
        width: 28, height: 34, borderRadius: '50% 50% 35% 35%',
        background:'radial-gradient(ellipse at 50% 60%, #FFC8B0 0%, #FF8A6A 40%, #C85838 80%, #6A2818 100%)',
        boxShadow:'0 0 28px rgba(255,160,120,0.7)',
        border:'1px solid rgba(80,30,15,0.6)'}}/>
      <div style={{position:'absolute', top: 162, right: 30, zIndex: 3,
        width: 12, height: 4, background: '#3a1a0a', borderRadius: 2}}/>

      <MRHeader ambientLabel="SALT ROOM · 핑크 솔트"
        sub="히말라야 솔트 사우나"
        accentColor="#FFC8B0" titleColor="#FFF4EC"
        subColor="rgba(255,225,210,0.7)"
        panelBg="rgba(60,20,15,0.75)" panelBorder="rgba(255,180,150,0.35)"
        dotColor="#FF7A5A"/>

      <div style={{position:'absolute', top:180, left:0, right:0,
        bottom: 96, overflow:'hidden', zIndex:8}}>
        {msgs.map(m => (
          <MRMsg key={m.id} msg={m} width={width}
            isMine={m.senderId === MY_ID} palette={palette}/>
        ))}
      </div>

      {/* 콩이 — sweat */}
      <div style={{position:'absolute', bottom: 110, left: 26, zIndex: 9,
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))'}}>
        <PixelMascot pose="sweat" tone="warm" size={16} scale={4}/>
      </div>
      <div style={{position:'absolute', bottom: 105, right: 30, zIndex: 9,
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))'}}>
        <PixelMascot pose="idle" tone="warm" size={16} scale={4}/>
      </div>

      <MRInput bg='linear-gradient(180deg, rgba(80,28,20,0.78), rgba(40,12,8,0.92))'
        border='rgba(255,200,170,0.4)'
        sendBg='linear-gradient(180deg, #FFA890, #C85838)'
        sendIconColor='#2a0a05'
        placeholderColor='rgba(255,225,210,0.55)'
        placeholder='소금처럼 정갈히…'/>
    </div>
  );
}

// ============================================================
// F · 얼음방 — 냉탕, 푸른 톤
// ============================================================
function ChatRoomIceRoom({ width = 393, height = 852 }) {
  const { msgs, MY_ID } = useMRSim();
  const palette = {
    bubbleBg:        'linear-gradient(180deg, rgba(200,225,240,0.4), rgba(160,200,225,0.25))',
    bubbleMineBg:    'linear-gradient(180deg, rgba(180,220,240,0.6), rgba(130,180,220,0.45))',
    bubbleBorder:    'rgba(220,235,245,0.5)',
    bubbleMineBorder:'rgba(180,220,245,0.85)',
    bubbleShadow:    '0 0 18px rgba(180,220,240,0.45), 0 2px 4px rgba(10,30,50,0.4)',
    bubbleMineShadow:'0 0 26px rgba(150,200,240,0.6), 0 2px 6px rgba(10,30,50,0.4)',
    nick:'#C8E0F0', nickMine:'#E0F0FF',
    text:'#F4FBFF', textShadow:'0 1px 3px rgba(10,30,50,0.95)',
  };

  // 얼음 큐브 텍스처 — 청백 그라디언트
  return (
    <div style={{position:'relative', width, height, overflow:'hidden',
      fontFamily:"'Noto Sans KR', sans-serif",
      color:'#F4FBFF',
      background:`
        linear-gradient(180deg, rgba(200,225,240,0.06) 0%, rgba(20,40,70,0) 100%),
        repeating-linear-gradient(0deg,
          rgba(120,180,220,0.15) 0px, transparent 1px,
          transparent 26px, rgba(120,180,220,0.18) 27px),
        repeating-linear-gradient(90deg,
          rgba(120,180,220,0.12) 0px, transparent 1px,
          transparent 26px, rgba(120,180,220,0.15) 27px),
        linear-gradient(180deg, #5a8aaa 0%, #3a6a8a 30%, #2a5a7a 70%, #1a3a5a 100%)`,
      }}>

      {/* 얼음 큐브 — scattered */}
      <svg style={{position:'absolute', inset:0, width:'100%', height:'100%',
        opacity: 0.45, pointerEvents:'none', zIndex: 1}}>
        <defs>
          <linearGradient id="iceCube" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7"/>
            <stop offset="50%" stopColor="#A8C8E0" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#5a8aaa" stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        <g>
          <rect x="40" y="220" width="22" height="22" fill="url(#iceCube)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" rx="2"/>
          <rect x="280" y="280" width="18" height="18" fill="url(#iceCube)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" rx="2"/>
          <rect x="120" y="380" width="24" height="24" fill="url(#iceCube)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" rx="2"/>
          <rect x="320" y="450" width="20" height="20" fill="url(#iceCube)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" rx="2"/>
          <rect x="60" y="550" width="22" height="22" fill="url(#iceCube)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" rx="2"/>
          <rect x="220" y="600" width="18" height="18" fill="url(#iceCube)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" rx="2"/>
        </g>
      </svg>

      {/* 천장 차가운 글로우 (LED) */}
      <div style={{position:'absolute', top: 86, left: 0, right: 0, height: 4, zIndex: 3,
        background: 'linear-gradient(90deg, rgba(180,225,255,0) 0%, rgba(180,225,255,0.95) 12%, rgba(180,225,255,0.95) 88%, rgba(180,225,255,0) 100%)',
        boxShadow: '0 8px 32px rgba(180,225,255,0.55), 0 14px 50px rgba(150,200,240,0.4)',
      }}/>
      <div style={{position:'absolute', top: 84, left:0, right:0, height: 320, zIndex: 2,
        pointerEvents:'none',
        background:`linear-gradient(180deg, rgba(200,230,250,0.22) 0%, transparent 60%)`}}/>

      {/* 서리/성에 effect — 작은 흰 도트 */}
      <svg style={{position:'absolute', inset:0, width:'100%', height:'100%',
        opacity: 0.6, pointerEvents:'none', zIndex: 4}}>
        {Array.from({length: 30}).map((_, i) => {
          const x = (i * 73) % 393;
          const y = ((i * 137) % 700) + 100;
          return <circle key={i} cx={x} cy={y} r={0.8 + (i % 3) * 0.4} fill="#fff" opacity={0.4 + (i % 4) * 0.15}/>;
        })}
      </svg>

      <MRHeader ambientLabel="ICE ROOM · 얼음방"
        sub="냉탕"
        accentColor="#A8D8E8" titleColor="#F4FBFF"
        subColor="rgba(220,240,250,0.7)"
        panelBg="rgba(20,45,75,0.75)" panelBorder="rgba(180,225,255,0.35)"
        dotColor="#88DDF8"/>

      <div style={{position:'absolute', top:180, left:0, right:0,
        bottom: 96, overflow:'hidden', zIndex:8}}>
        {msgs.map(m => (
          <MRMsg key={m.id} msg={m} width={width}
            isMine={m.senderId === MY_ID} palette={palette}/>
        ))}
      </div>

      {/* 콩이 — 잠김(soak) cool tone */}
      <div style={{position:'absolute', bottom: 100, left: '50%',
        transform: 'translateX(-50%)', zIndex: 9,
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))'}}>
        <PixelMascot pose="soak" tone="cool" size={16} scale={4}/>
      </div>

      <MRInput bg='linear-gradient(180deg, rgba(30,55,85,0.82), rgba(15,30,55,0.92))'
        border='rgba(180,225,255,0.4)'
        sendBg='linear-gradient(180deg, #B8DDF0, #5A98C8)'
        sendIconColor='#0a1a2a'
        placeholderColor='rgba(220,240,250,0.55)'
        placeholder='차갑게 한마디…'/>
    </div>
  );
}

// ============================================================
// G · 편백나무방 — 청량 그린 + 편백나무 결
// ============================================================
function ChatRoomCypressRoom({ width = 393, height = 852 }) {
  const { msgs, MY_ID } = useMRSim();
  const palette = {
    bubbleBg:        'linear-gradient(180deg, rgba(220,235,200,0.38), rgba(180,210,160,0.22))',
    bubbleMineBg:    'linear-gradient(180deg, rgba(200,225,160,0.55), rgba(160,195,110,0.42))',
    bubbleBorder:    'rgba(225,238,205,0.45)',
    bubbleMineBorder:'rgba(180,210,140,0.85)',
    bubbleShadow:    '0 0 16px rgba(180,210,140,0.35), 0 2px 4px rgba(20,40,15,0.4)',
    bubbleMineShadow:'0 0 26px rgba(160,200,110,0.55), 0 2px 6px rgba(20,40,15,0.4)',
    nick:'#D4E8B8', nickMine:'#E8F0C0',
    text:'#F4FBE8', textShadow:'0 1px 3px rgba(15,30,10,0.95)',
  };

  // 편백나무 — 옅은 황녹빛 세로결
  const cypressBg = `
    linear-gradient(180deg, rgba(40,50,20,0.55) 0%, transparent 14%, transparent 84%, rgba(20,30,10,0.7) 100%),
    repeating-linear-gradient(90deg,
      #C8C088 0px, #BFB880 4px, #A8A068 5px, #A8A068 6px,
      #C0B880 7px, #B8B078 14px, #989068 15px, #989068 16px,
      #B8B078 17px, #C8C088 22px)`;

  return (
    <div style={{position:'relative', width, height, overflow:'hidden',
      fontFamily:"'Noto Sans KR', sans-serif",
      background: cypressBg, color:'#F4FBE8'}}>

      {/* 편백 잎 패턴 — 작은 잎사귀들 */}
      <svg style={{position:'absolute', inset:0, width:'100%', height:'100%',
        opacity: 0.18, pointerEvents:'none', zIndex: 1, mixBlendMode: 'multiply'}}>
        {[
          [60,180], [280,220], [180,300], [340,380], [80,440], [220,520], [320,580], [120,640]
        ].map(([x,y], i) => (
          <g key={i} transform={`translate(${x},${y}) rotate(${(i*37) % 90})`}>
            <ellipse cx="0" cy="0" rx="14" ry="3" fill="#3a5020"/>
            <ellipse cx="-8" cy="2" rx="10" ry="2.5" fill="#3a5020"/>
            <ellipse cx="8" cy="-2" rx="10" ry="2.5" fill="#3a5020"/>
          </g>
        ))}
      </svg>

      {/* 천장 자연광 — 그린 톤 */}
      <div style={{position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
        background:`
          radial-gradient(ellipse 90% 35% at 50% -5%, rgba(220,240,180,0.45), transparent 70%),
          radial-gradient(ellipse 100% 40% at 50% 100%, rgba(150,180,80,0.18), transparent 60%)`}}/>

      {/* 편백 잎 디스플레이 — 우상단 작은 식물 */}
      <div style={{position:'absolute', top: 130, right: 22, zIndex: 3,
        width: 36, height: 50}}>
        <svg width="36" height="50" viewBox="0 0 36 50">
          {/* pot */}
          <rect x="10" y="36" width="16" height="12" rx="2" fill="#5a3818"/>
          <ellipse cx="18" cy="36" rx="8" ry="2" fill="#3a2410"/>
          {/* leaves */}
          <ellipse cx="18" cy="20" rx="3" ry="14" fill="#4a7028"/>
          <ellipse cx="11" cy="22" rx="3" ry="12" fill="#5a8030" transform="rotate(-25 11 22)"/>
          <ellipse cx="25" cy="22" rx="3" ry="12" fill="#5a8030" transform="rotate(25 25 22)"/>
          <ellipse cx="14" cy="14" rx="2" ry="9" fill="#6a9038" transform="rotate(-15 14 14)"/>
          <ellipse cx="22" cy="14" rx="2" ry="9" fill="#6a9038" transform="rotate(15 22 14)"/>
        </svg>
      </div>

      <MRHeader ambientLabel="CYPRESS · 편백나무"
        sub="피톤치드 가득"
        accentColor="#C8E0A0" titleColor="#F4FBE8"
        subColor="rgba(220,235,200,0.7)"
        panelBg="rgba(30,40,18,0.78)" panelBorder="rgba(180,210,140,0.35)"
        dotColor="#A8D070"/>

      <div style={{position:'absolute', top:180, left:0, right:0,
        bottom: 96, overflow:'hidden', zIndex:8}}>
        {msgs.map(m => (
          <MRMsg key={m.id} msg={m} width={width}
            isMine={m.senderId === MY_ID} palette={palette}/>
        ))}
      </div>

      {/* 콩이 — 명상(doze) */}
      <div style={{position:'absolute', bottom: 110, left: 26, zIndex: 9,
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))'}}>
        <PixelMascot pose="doze" tone="warm" size={16} scale={4}/>
      </div>
      {/* 콩이 — 계란 먹기 우측 */}
      <div style={{position:'absolute', bottom: 105, right: 30, zIndex: 9,
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))'}}>
        <PixelMascot pose="eat" tone="warm" size={16} scale={4}/>
      </div>

      {/* floor — 옅은 wood */}
      <div style={{position:'absolute', bottom:0, left:0, right:0, height:96, zIndex:4,
        background:`linear-gradient(180deg, rgba(20,30,10,0) 0%, rgba(20,30,10,0.55) 100%),
          repeating-linear-gradient(90deg,
            rgba(150,140,90,0.35) 0px, rgba(150,140,90,0.35) 5px,
            rgba(20,30,10,0.85) 5px, rgba(20,30,10,0.85) 7px)`,
        boxShadow:'inset 0 6px 14px rgba(0,0,0,0.5)'}}/>

      <MRInput bg='linear-gradient(180deg, rgba(40,55,20,0.78), rgba(20,30,10,0.92))'
        border='rgba(220,235,180,0.35)'
        sendBg='linear-gradient(180deg, #C8E08A, #6a9038)'
        sendIconColor='#1a2810'
        placeholderColor='rgba(220,235,200,0.55)'
        placeholder='나무 향과 함께…'/>
    </div>
  );
}

// keyframes
if (typeof document !== 'undefined' && !document.getElementById('mr-kf')) {
  const s = document.createElement('style');
  s.id = 'mr-kf';
  s.textContent = `
    @keyframes mr-saltglow {
      0%,100% { opacity: 0.45; }
      50%     { opacity: 0.7; }
    }
  `;
  document.head.appendChild(s);
}

Object.assign(window, {
  ChatRoomJjimjilbang,
  ChatRoomSaltRoom,
  ChatRoomIceRoom,
  ChatRoomCypressRoom,
});
