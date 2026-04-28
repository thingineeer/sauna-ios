// =============================================================
// 황토방 메인 화면들: Home / Enter / Room / Profile / Settings / Notif
// =============================================================

const {
  JJIM, CLAY_BG, FLOOR_BG, ROOM_BG,
  ClayLamp, ClayFloor, ClayWall,
  JjimMonoTag, ClayButton, JjimHeader,
} = window;
const {
  IcSaunaMark: _Mark, IcDaily, IcStock, IcJob, IcWorldCup, IcMedal,
  IcSteam: _S, IcDoor, IcPerson, IcGear,
  IcClock, IcRefresh, IcDice, IcBell, IcMoon, IcVibrate,
  IcContrast, IcMotion, IcType, IcTrash, IcInfo,
  IcArrowLeft, IcChevron, IcHeart,
} = window;
const { PixelMascot: PM } = window;

// =============================================================
// Tab Bar (Home / Me / Settings)
// =============================================================
function JjimTabBar({ active = 'home' }) {
  const items = [
    { id: 'home', label: '방',   Ic: IcDoor },
    { id: 'me',   label: '나',   Ic: IcPerson },
    { id: 'set',  label: '설정', Ic: IcGear },
  ];
  return (
    <div style={{
      position:'absolute', bottom: 0, left: 0, right: 0,
      height: 92, paddingBottom: 32, paddingTop: 10,
      background: 'linear-gradient(180deg, rgba(40,18,8,0.7) 0%, rgba(15,6,2,0.98) 60%)',
      backdropFilter: 'blur(16px)',
      borderTop: `1px solid ${JJIM.surface.hairline}`,
      display:'flex', justifyContent:'space-around', alignItems:'flex-start',
      zIndex: 30,
    }}>
      {items.map(it => {
        const on = it.id === active;
        const col = on ? JJIM.accent.soft : JJIM.text.muted;
        return (
          <div key={it.id} style={{
            display:'flex', flexDirection:'column', alignItems:'center',
            gap: 4, padding:'4px 14px', minWidth: 60, color: col,
          }}>
            <it.Ic size={22} color="currentColor"/>
            <div style={{fontSize: 10, fontWeight: 600,
              letterSpacing: 0.3}}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// 익명 아바타
function JjimAvatar({ size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size/2,
      background: 'linear-gradient(180deg, #FFD68A 0%, #C95830 100%)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 8px rgba(0,0,0,0.35)',
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>
      <svg width={size*0.5} height={size*0.5} viewBox="0 0 24 24">
        <circle cx="12" cy="9" r="3.4" fill="#2a1000"/>
        <path d="M5 19 Q5 14 12 14 Q19 14 19 19" fill="#2a1000"/>
      </svg>
    </div>
  );
}

// =============================================================
// 방 카드 (홈 리스트용)
// =============================================================
function JjimRoomCard({ roomId, label, tag, sub, head, trend, density }) {
  const accents = {
    daily: '#FFB070',
    stock: '#FF8A50',
    job:   '#FFD68A',
  };
  const accent = accents[roomId] || JJIM.accent.warm;
  const Icon = roomId === 'daily' ? IcDaily
    : roomId === 'stock' ? IcStock : IcJob;
  const barW = Math.min(1, head / 300);

  return (
    <div style={{
      padding:'18px 18px 16px', borderRadius: 18,
      background: JJIM.surface.card,
      border: `1px solid ${JJIM.surface.hairlineStrong}`,
      boxShadow: '0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,210,150,0.14)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{position:'absolute', top: 14, right: 14,
        opacity: 0.18, color: accent}}>
        <Icon size={64} color="currentColor"/>
      </div>

      <div style={{display:'inline-flex', alignItems:'center', gap: 5,
        padding:'3px 8px', borderRadius: 5,
        background: `${accent}22`,
        border: `1px solid ${accent}55`}}>
        <span style={{width:5,height:5,borderRadius:'50%',
          background: accent, boxShadow:`0 0 6px ${accent}`}}/>
        <span className="mono" style={{fontSize: 9, color: accent,
          letterSpacing: 2, fontWeight: 700}}>{tag}</span>
      </div>
      <div style={{marginTop: 6, fontSize: 21, fontWeight: 800,
        color: JJIM.text.primary, letterSpacing: -0.4,
        display:'inline-flex', alignItems:'center', gap: 8}}>
        {label}
        <span style={{color: accent, opacity: 0.75, display:'inline-flex'}}>
          <Icon size={16} color="currentColor"/>
        </span>
      </div>
      <div style={{fontSize: 12, color: JJIM.text.tertiary, marginTop: 2}}>
        {sub}
      </div>

      <div style={{marginTop: 14, display:'flex', alignItems:'center', gap: 10}}>
        <div style={{flex: 1, height: 4, borderRadius: 2,
          background: 'rgba(20,8,2,0.6)', overflow:'hidden'}}>
          <div style={{height:'100%', width: `${barW*100}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
            boxShadow: `0 0 8px ${accent}80`}}/>
        </div>
        <div style={{display:'flex', alignItems:'baseline', gap: 4,
          fontFamily: "'JetBrains Mono', monospace"}}>
          <span style={{fontSize: 16, fontWeight: 700, color: accent,
            fontVariantNumeric:'tabular-nums'}}>{head.toLocaleString()}</span>
          <span style={{fontSize: 10, color: JJIM.text.tertiary}}>명</span>
          {trend !== 0 && (
            <span style={{fontSize: 10,
              color: trend>0 ? '#FFB060' : '#9bc',
              marginLeft: 4, display:'inline-flex',
              alignItems:'center', gap: 1}}>
              <svg width="8" height="8" viewBox="0 0 8 8">
                <path d={trend>0 ? 'M4 1L7 6H1z' : 'M4 7L1 2H7z'}
                  fill="currentColor"/>
              </svg>
              {Math.abs(trend)}
            </span>
          )}
        </div>
      </div>
      <div style={{marginTop: 4, fontSize: 10.5,
        color: JJIM.text.tertiary}}>{density}</div>
    </div>
  );
}

// =============================================================
// Home — 3개 방
// =============================================================
function JjimHome({ tod = 'evening' }) {
  const data = {
    morning: { time: '09:41', nick: '상쾌한수달',
      daily: {h: 48, t: 5, d: '한산 · 숨고를만한 리듬'},
      stock: {h: 322, t: 28, d: '장 시작 · 벌써 꽉 참'},
      job:   {h: 12, t: -2, d: '적막 · 혼자 땀 흘리기 좋음'},
    },
    evening: { time: '18:47', nick: '노곤한사슴',
      daily: {h: 142, t: 16, d: '붐빔 · 퇴근 피크'},
      stock: {h: 88, t: -12, d: '장 마감 후 정리'},
      job:   {h: 67, t: 4, d: '편안 · 자소서 얘기 많음'},
    },
    night: { time: '03:28', nick: '깨어있는여우',
      daily: {h: 8, t: -3, d: '적막 · 불면의 밤'},
      stock: {h: 3, t: 0, d: '한두명 · 뉴욕장 구경'},
      job:   {h: 24, t: 2, d: '새벽조 · 발표 대기'},
    },
  }[tod];

  return (
    <ClayWall glowOnly>
      <div style={{position:'absolute', inset:0, zIndex: 1, pointerEvents:'none',
        background:`radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,160,70,0.18), transparent 70%)`}}/>

      <div style={{position:'absolute', top: 60, left: 20, right: 20, zIndex: 5}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <JjimMonoTag>TODAY · {data.time}</JjimMonoTag>
            <div style={{fontSize: 26, fontWeight: 800, marginTop: 4,
              color: JJIM.text.primary, letterSpacing: -0.5}}>
              어느 방에 앉을까?
            </div>
          </div>
          <JjimAvatar size={44}/>
        </div>
        <div style={{marginTop: 8, fontSize: 12, color: JJIM.text.tertiary}}>
          오늘 너는 <b style={{color: JJIM.accent.soft}}>{data.nick}</b>
        </div>
      </div>

      <div style={{position:'absolute', top: 184, left: 20, right: 20,
        display:'flex', flexDirection:'column', gap: 12, zIndex: 5}}>
        <JjimRoomCard roomId="daily" label="일상 황토방" tag="DAILY"
          sub="하루 흘려보내기"
          head={data.daily.h} trend={data.daily.t} density={data.daily.d}/>
        <JjimRoomCard roomId="stock" label="주식 황토방" tag="STOCK"
          sub="열받은 장 식히기"
          head={data.stock.h} trend={data.stock.t} density={data.stock.d}/>
        <JjimRoomCard roomId="job" label="취준 황토방" tag="JOB"
          sub="면접 뒤끝 · 막막함"
          head={data.job.h} trend={data.job.t} density={data.job.d}/>

        <div style={{marginTop: 4, padding:'14px 16px', borderRadius: 14,
          background: JJIM.surface.panelLight,
          border:'1px dashed rgba(255,180,110,0.28)',
          display:'flex', alignItems:'center', gap: 14}}>
          <div style={{display:'flex', gap: 8, opacity: 0.5,
            color: JJIM.text.tertiary}}>
            <IcWorldCup size={22} color="currentColor"/>
            <IcMedal size={22} color="currentColor"/>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 12, color: JJIM.text.tertiary,
              fontWeight: 600}}>시즌 방</div>
            <div style={{fontSize: 10.5, color: JJIM.text.muted,
              marginTop: 1}}>이벤트마다 새 방이 열립니다</div>
          </div>
          <div className="mono" style={{fontSize: 9,
            color: JJIM.text.muted, letterSpacing: 1.5}}>SOON</div>
        </div>
      </div>

      <JjimTabBar active="home"/>
    </ClayWall>
  );
}

// =============================================================
// Enter — 입탕 트랜지션
// =============================================================
function JjimEnter() {
  return (
    <ClayWall>
      <div style={{position:'absolute', inset:0, zIndex: 2,
        background:`radial-gradient(ellipse 50% 30% at 50% 50%, rgba(255,170,80,0.4), transparent 70%)`}}/>

      <div style={{position:'absolute', inset:0, zIndex: 5,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap: 22}}>
        <div style={{
          width: 100, height: 100, borderRadius: '50% 50% 18px 18px',
          background:'radial-gradient(ellipse at 50% 65%, #FFD68A 0%, #FF9050 35%, #C95830 75%, #5a2010 100%)',
          boxShadow:'0 0 36px rgba(255,150,70,0.5)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <IcDoor size={56} color="#FFC870"/>
        </div>
        <JjimMonoTag color={JJIM.accent.primary}>ENTERING DAILY</JjimMonoTag>
        <div style={{fontSize: 22, fontWeight: 700, color: JJIM.text.primary,
          letterSpacing: -0.3, textAlign:'center'}}>
          황토 문을 엽니다…
        </div>
        <div style={{width: 140, height: 3, borderRadius: 2,
          background:'rgba(255,180,110,0.18)', overflow:'hidden', marginTop: 4}}>
          <div style={{width:'65%', height:'100%',
            background:'linear-gradient(90deg, #FFB060, #C95830)',
            boxShadow:'0 0 10px rgba(255,150,70,0.7)'}}/>
        </div>
        <div style={{fontSize: 11, color: JJIM.text.tertiary, marginTop: 2}}>
          따뜻한 황토 열기가 얼굴에 닿아요
        </div>
      </div>
    </ClayWall>
  );
}

// =============================================================
// Room — 방 안 (메시지 rise + 콩이)
// =============================================================
const ROOM_BANK = [
  { text: '하 여기 앉으니까 어깨가 녹는다', nickname: '녹아내리는수달' },
  { text: '하루가 땀으로 빠져나가는 느낌',  nickname: '뽀송한너구리' },
  { text: '눈 감고 있으면 시간 멈춰',       nickname: '쉬는고양이' },
  { text: '몸이 따뜻해지니까 마음도 말랑해',nickname: '포근한햄스터' },
  { text: '오늘 진짜 힘들었다…',           nickname: '지친여우' },
  { text: '말 없이 같이 땀 흘리는 것도 좋네',nickname: '조용한두루미' },
  { text: '여기 나오면 잘 잘 수 있어',      nickname: '꿀잠기원' },
  { text: '아 이 온기에 중독됐다',         nickname: '노곤한사슴' },
];

function RiseMsg({ msg, width, isMine }) {
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
      position:'absolute', left: x, top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity, filter: blur ? `blur(${blur}px)` : 'none',
      pointerEvents:'none', willChange:'transform, opacity',
      textAlign:'center',
    }}>
      <div style={{
        display:'inline-block', padding:'8px 14px', borderRadius: 14,
        background: isMine
          ? 'linear-gradient(180deg, rgba(255,200,130,0.55), rgba(230,150,80,0.42))'
          : 'linear-gradient(180deg, rgba(255,220,180,0.36), rgba(230,180,130,0.22))',
        backdropFilter:'blur(5px)',
        border: `${isMine ? 1.5 : 1}px solid ${isMine ? 'rgba(255,180,100,0.85)' : 'rgba(255,210,170,0.42)'}`,
        boxShadow: isMine
          ? '0 0 24px rgba(255,160,80,0.5), 0 2px 6px rgba(40,15,0,0.4)'
          : '0 0 14px rgba(220,140,80,0.3), 0 2px 4px rgba(40,15,0,0.4)',
        maxWidth: 280,
      }}>
        <div className="mono" style={{
          fontSize: 9, color: isMine ? '#FFE5A0' : '#FFD4A0',
          letterSpacing: 0.3, marginBottom: 2, fontWeight: 700,
        }}>{msg.nickname}</div>
        <div style={{fontSize: 13, fontWeight: 500, color: '#FFF0D8',
          lineHeight: 1.4,
          textShadow:'0 1px 3px rgba(50,15,0,0.95)',
          wordBreak:'keep-all', textWrap:'pretty'}}>{msg.text}</div>
      </div>
    </div>
  );
}

function useRoomSim(crowd) {
  const [msgs, setMsgs] = React.useState([]);
  const idRef = React.useRef(0);
  const interval = crowd === 'packed' ? 700 : crowd === 'lonely' ? 3200 : 1400;
  React.useEffect(() => {
    let cancelled = false;
    const spawn = (isMine = false) => {
      const m = ROOM_BANK[Math.floor(Math.random() * ROOM_BANK.length)];
      const id = ++idRef.current;
      const x = 0.18 + Math.random() * 0.64;
      const life = 8500 + Math.random() * 2500;
      setMsgs(prev => [...prev,
        { id, ...m, x, spawnAt: performance.now(), life,
          senderId: isMine ? 'me' : 'u'+id,
          nickname: isMine ? '나' : m.nickname }
      ].slice(-8));
      setTimeout(() => { if (!cancelled) setMsgs(p => p.filter(x => x.id !== id)); }, life + 400);
    };
    const i = setInterval(spawn, interval);
    const mine = setInterval(() => { if (Math.random() < 0.3) spawn(true); }, 4800);
    const k = [];
    for (let j = 0; j < 3; j++) k.push(setTimeout(spawn, j * 220));
    return () => { cancelled = true; clearInterval(i); clearInterval(mine); k.forEach(clearTimeout); };
  }, [interval]);
  return msgs;
}

function JjimRoom({ roomId = 'daily', crowd = 'medium',
                    width = 393, height = 852, keyboardUp = false }) {
  const msgs = useRoomSim(crowd);

  const meta = {
    daily: { tag: 'SAUNA · DAILY', label: '일상 황토방', sub: '하루 흘려보내기' },
    stock: { tag: 'SAUNA · STOCK', label: '주식 황토방', sub: '장 식히기' },
    job:   { tag: 'SAUNA · JOB',   label: '취준 황토방', sub: '잠시 숨고르기' },
  }[roomId];
  const head = crowd === 'packed' ? 312 : crowd === 'lonely' ? 8 : 142;
  const dotColor = crowd === 'packed' ? '#FF6A2A' :
                    crowd === 'lonely' ? '#9bc' : '#FF9050';

  return (
    <div style={{position:'relative', width, height, overflow:'hidden',
      fontFamily:"'Noto Sans KR', sans-serif",
      background: CLAY_BG, color: JJIM.text.primary}}>

      {/* 천장/바닥 글로우 */}
      <div style={{position:'absolute', inset:0, zIndex: 1, pointerEvents:'none',
        background:`
          radial-gradient(ellipse 90% 35% at 50% -5%, rgba(255,150,80,0.5), transparent 70%),
          radial-gradient(ellipse 100% 40% at 50% 100%, rgba(255,140,60,0.18), transparent 60%)`}}/>

      {/* 마룻바닥 */}
      <ClayFloor height={140} zIndex={3}/>

      {/* 황토 가마 등 */}
      <ClayLamp top={130} right={22}/>

      {/* Header */}
      <div style={{position:'absolute', top: 0, left: 0, right: 0, zIndex: 15,
        padding:'54px 16px 10px'}}>
        <div style={{display:'flex', alignItems:'flex-start', gap: 10}}>
          <button style={{width: 36, height: 36, borderRadius: 10, border:'none',
            background: JJIM.surface.panel,
            outline:`1px solid ${JJIM.surface.hairline}`, outlineOffset: -1,
            color: JJIM.text.primary, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            backdropFilter:'blur(6px)', fontSize: 20, paddingBottom: 2}}>‹</button>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{display:'inline-flex', alignItems:'center', gap:5,
              padding:'3px 8px', borderRadius: 4,
              background: JJIM.surface.panel,
              border:`1px solid ${JJIM.surface.hairline}`,
              backdropFilter:'blur(6px)'}}>
              <span style={{width:5, height:5, borderRadius:'50%',
                background: dotColor, boxShadow:`0 0 6px ${dotColor}`}}/>
              <span className="mono" style={{fontSize: 9, color: JJIM.accent.soft,
                letterSpacing: 2.5, fontWeight: 700}}>{meta.tag}</span>
            </div>
            <div style={{marginTop: 6, fontSize: 22, fontWeight: 700,
              color: JJIM.text.primary, letterSpacing: -0.6,
              textShadow:'0 2px 6px rgba(0,0,0,0.6)'}}>
              {meta.label}
            </div>
            <div style={{fontSize: 11, color: JJIM.text.tertiary, marginTop: 1}}>
              {meta.sub} · 지금 {head}명
            </div>
          </div>
          <div style={{padding:'6px 10px', borderRadius: 10,
            background: JJIM.surface.panel,
            border:`1px solid ${JJIM.surface.hairline}`,
            textAlign:'center', minWidth: 52}}>
            <div className="mono" style={{fontSize: 7.5, color: dotColor,
              letterSpacing: 1.6, fontWeight: 700, marginBottom: 2}}>LIVE</div>
            <div style={{fontSize: 16, fontWeight: 700,
              color: JJIM.text.primary,
              fontFamily:"'JetBrains Mono', monospace"}}>{head}</div>
          </div>
        </div>
      </div>

      {/* 메시지 stage */}
      <div style={{position:'absolute', top: 180, left: 0, right: 0,
        bottom: keyboardUp ? 360 : 96, overflow:'hidden', zIndex: 8}}>
        {msgs.map(m => (
          <RiseMsg key={m.id} msg={m} width={width} isMine={m.senderId === 'me'}/>
        ))}
      </div>

      {/* 콩이 — 마룻바닥 위 */}
      <div style={{position:'absolute', bottom: 100, left: 24, zIndex: 9,
        imageRendering:'pixelated',
        filter:'drop-shadow(0 3px 6px rgba(0,0,0,0.6))'}}>
        <PM pose={crowd === 'lonely' ? 'doze' : 'idle'} tone="warm" size={16} scale={4}/>
      </div>
      <div style={{position:'absolute', bottom: 110, right: 30, zIndex: 9,
        imageRendering:'pixelated',
        filter:'drop-shadow(0 3px 6px rgba(0,0,0,0.6))'}}>
        <PM pose={crowd === 'packed' ? 'sweat' : 'drink'} tone="warm" size={16} scale={4}/>
      </div>

      {/* Input */}
      {!keyboardUp && (
        <div style={{position:'absolute', bottom: 28, left: 14, right: 14,
          zIndex: 52, height: 48, borderRadius: 14,
          background:'linear-gradient(180deg, rgba(60,28,12,0.78), rgba(30,12,4,0.92))',
          backdropFilter:'blur(14px)',
          border:`1px solid ${JJIM.surface.hairlineStrong}`,
          boxShadow:'0 4px 16px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
          display:'flex', alignItems:'center', padding:'0 6px 0 16px'}}>
          <div style={{fontSize: 14, color: JJIM.text.tertiary, flex: 1}}>
            땀과 함께 흘려보내…
          </div>
          <button style={{width: 36, height: 36, borderRadius: 10, border:'none',
            background:'linear-gradient(180deg, #FFB060, #C95830)',
            color: '#2a1000', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 8px rgba(0,0,0,0.4)',
            fontSize: 18, fontWeight: 700}}>↗</button>
        </div>
      )}

      {/* 키보드 */}
      {keyboardUp && (
        <>
          <div style={{position:'absolute', bottom: 290, left: 14, right: 14,
            zIndex: 52, height: 48, borderRadius: 14,
            background:'linear-gradient(180deg, rgba(60,28,12,0.92), rgba(30,12,4,0.96))',
            backdropFilter:'blur(14px)',
            border:`1.5px solid ${JJIM.accent.warm}88`,
            boxShadow:'0 4px 16px rgba(0,0,0,0.55), 0 0 0 4px rgba(255,160,80,0.12)',
            display:'flex', alignItems:'center', padding:'0 6px 0 16px'}}>
            <div style={{fontSize: 14, color: JJIM.text.primary, flex: 1}}>
              여기 진짜 따뜻하다<span style={{
                opacity: 0.8, color: JJIM.accent.warm,
                animation: 'jjblink 1s steps(2) infinite'}}>|</span>
            </div>
            <button style={{width: 36, height: 36, borderRadius: 10, border:'none',
              background:'linear-gradient(180deg, #FFB060, #C95830)',
              color: '#2a1000', cursor:'pointer', fontSize: 18, fontWeight: 700,
              boxShadow:'0 2px 8px rgba(0,0,0,0.4)'}}>↗</button>
          </div>
          <div style={{position:'absolute', bottom: 0, left: 0, right: 0,
            height: 280, zIndex: 51,
            background:'linear-gradient(180deg, #2a1808 0%, #1a0e04 100%)',
            borderTop:`1px solid ${JJIM.surface.hairline}`,
            padding: '12px 6px',
            boxShadow:'0 -8px 30px rgba(0,0,0,0.5)'}}>
            {[
              ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'],
              ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
              ['⇧','ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ','⌫'],
              ['123','🌐','space','enter'],
            ].map((row, ri) => (
              <div key={ri} style={{display:'flex', gap: 4,
                justifyContent:'center', marginTop: ri === 0 ? 0 : 6}}>
                {row.map((k, ki) => {
                  const isSpace = k === 'space';
                  const isEnter = k === 'enter';
                  return (
                    <div key={ki} style={{
                      flex: isSpace ? 4 : isEnter ? 2 : 1,
                      maxWidth: isSpace ? 'none' : 38,
                      height: 40, borderRadius: 6,
                      background: isEnter
                        ? 'linear-gradient(180deg, #FFB060, #C95830)'
                        : 'rgba(80,42,18,0.85)',
                      border:`1px solid rgba(255,180,110,0.18)`,
                      color: isEnter ? '#2a1000' : JJIM.text.primary,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize: isSpace || isEnter ? 12 : 14,
                      fontWeight: 600,
                      boxShadow:'0 1px 0 rgba(0,0,0,0.6)',
                    }}>{isSpace ? '띄어쓰기' : k}</div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// =============================================================
// Profile (Me)
// =============================================================
function StatCell({ label, value, Ic }) {
  return (
    <div style={{padding:'14px 16px', borderRadius: 12,
      background: JJIM.surface.panel,
      border: `1px solid ${JJIM.surface.hairline}`}}>
      <div style={{fontSize: 11, color: JJIM.text.tertiary}}>{label}</div>
      <div style={{fontSize: 18, fontWeight: 800, color: JJIM.text.primary,
        marginTop: 4, letterSpacing: -0.3,
        display:'inline-flex', alignItems:'center', gap: 6}}>
        {value}
        {Ic && <span style={{color: JJIM.accent.soft}}>
          <Ic size={16} color="currentColor"/></span>}
      </div>
    </div>
  );
}

function JjimProfile() {
  return (
    <ClayWall glowOnly>
      <div style={{position:'absolute', top: 60, left: 20, right: 20, zIndex: 5}}>
        <JjimMonoTag>MY SAUNA</JjimMonoTag>
        <div style={{fontSize: 26, fontWeight: 800, marginTop: 4,
          color: JJIM.text.primary, letterSpacing: -0.5}}>나</div>

        <div style={{marginTop: 18, padding:'20px 18px', borderRadius: 16,
          background: JJIM.surface.card,
          border: `1px solid ${JJIM.surface.hairlineStrong}`,
          display:'flex', alignItems:'center', gap: 16}}>
          <div style={{imageRendering:'pixelated',
            filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.6))'}}>
            <PM pose="idle" tone="warm" size={32} scale={2.4}/>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 18, fontWeight: 800, color: JJIM.accent.soft,
              letterSpacing: -0.3}}>노곤한사슴</div>
            <div className="mono" style={{fontSize: 10,
              color: JJIM.text.tertiary, letterSpacing: 1.5,
              marginTop: 2}}>TODAY · #4F29</div>
          </div>
          <div style={{fontSize: 11, color: JJIM.text.tertiary,
            textAlign:'right', lineHeight: 1.45}}>
            내일 자정<br/>새 이름
          </div>
        </div>

        <div style={{marginTop: 14,
          display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10}}>
          <StatCell label="오늘 세션" value="2회"/>
          <StatCell label="오늘 앉은 시간" value="47분"/>
          <StatCell label="이번 주 세션" value="9회"/>
          <StatCell label="단골 방" value="일상" Ic={IcDaily}/>
        </div>

        <div style={{marginTop: 14, padding:'14px 16px', borderRadius: 12,
          background: JJIM.surface.panel,
          border: `1px solid ${JJIM.surface.hairline}`,
          fontSize: 12, color: JJIM.text.secondary, lineHeight: 1.6}}>
          <div style={{fontSize: 11, fontWeight: 700, color: JJIM.accent.warm,
            marginBottom: 4, letterSpacing: 1}}>※ 기록은 남지 않아요</div>
          뱉은 말도, 읽은 말도 저장하지 않습니다. 위 숫자는 "얼마나 앉아있었는지"만.
        </div>
      </div>

      <JjimTabBar active="me"/>
    </ClayWall>
  );
}

// =============================================================
// Settings
// =============================================================
function SettingGroup({ title, children }) {
  return (
    <div style={{marginTop: 22}}>
      <div className="mono" style={{fontSize: 10, color: JJIM.accent.warm,
        letterSpacing: 2, fontWeight: 700, marginBottom: 8, paddingLeft: 4}}>
        {title.toUpperCase()}
      </div>
      <div style={{borderRadius: 14, overflow:'hidden',
        background: JJIM.surface.panel,
        border: `1px solid ${JJIM.surface.hairline}`}}>
        {children}
      </div>
    </div>
  );
}

function SettingRow({ Ic, label, value, toggle, muted, last }) {
  return (
    <div style={{display:'flex', alignItems:'center',
      padding:'13px 14px', gap: 12,
      borderBottom: last ? 'none' : '1px solid rgba(255,180,110,0.08)'}}>
      <div style={{width: 22, display:'flex', justifyContent:'center',
        color: JJIM.accent.soft}}>
        {Ic && <Ic size={18} color="currentColor"/>}
      </div>
      <div style={{flex: 1, fontSize: 14, color: JJIM.text.primary}}>{label}</div>
      {toggle !== undefined && (
        <div style={{width: 44, height: 26, borderRadius: 13,
          background: toggle ? 'linear-gradient(180deg, #FFB060, #C95830)' : 'rgba(60,40,20,0.6)',
          position:'relative',
          boxShadow: toggle ? '0 0 10px rgba(255,150,70,0.4)' : 'none'}}>
          <div style={{position:'absolute', top: 2,
            left: toggle ? 20 : 2,
            width: 22, height: 22, borderRadius: 11, background:'#fff',
            transition:'left .2s', boxShadow:'0 2px 4px rgba(0,0,0,0.3)'}}/>
        </div>
      )}
      {value !== undefined && (
        <div style={{fontSize: 12,
          color: muted ? JJIM.text.muted : JJIM.text.secondary,
          display:'inline-flex', alignItems:'center', gap: 4}}>
          {value}
          <IcChevron size={14} color="currentColor"/>
        </div>
      )}
    </div>
  );
}

function JjimSettings() {
  return (
    <ClayWall glowOnly>
      <div style={{position:'absolute', top: 60, left: 20, right: 20, zIndex: 5,
        bottom: 100, overflow:'hidden'}}>
        <JjimMonoTag>PREFERENCES</JjimMonoTag>
        <div style={{fontSize: 26, fontWeight: 800, marginTop: 4,
          color: JJIM.text.primary, letterSpacing: -0.5}}>설정</div>

        <SettingGroup title="알림">
          <SettingRow Ic={IcBell} label="방 피크 알림" toggle={true}/>
          <SettingRow Ic={IcMoon} label="야간 모드" value="22:00 ~ 07:00"/>
          <SettingRow Ic={IcVibrate} label="진동" toggle={true} last/>
        </SettingGroup>

        <SettingGroup title="경험">
          <SettingRow Ic={IcContrast} label="다크 모드" value="항상 켜짐"/>
          <SettingRow Ic={IcMotion} label="모션 줄이기" toggle={false}/>
          <SettingRow Ic={IcType} label="폰트 크기" value="중간" last/>
        </SettingGroup>

        <SettingGroup title="계정">
          <SettingRow Ic={IcTrash} label="데이터 삭제" value="기록 없음" muted/>
          <SettingRow Ic={IcInfo} label="Sauna란?" value="v 0.1" last/>
        </SettingGroup>
      </div>

      <JjimTabBar active="set"/>
    </ClayWall>
  );
}

// =============================================================
// Notif Prefs
// =============================================================
function JjimNotifPrefs() {
  return (
    <ClayWall glowOnly>
      <div style={{position:'absolute', top: 60, left: 20, right: 20, zIndex: 5,
        bottom: 100, overflow:'hidden'}}>
        <button style={{background:'transparent', border:'none',
          color: JJIM.accent.warm, fontSize: 13, padding: 0,
          cursor:'pointer', fontFamily:'inherit',
          display:'inline-flex', alignItems:'center', gap: 4}}>
          ‹ 설정
        </button>
        <div style={{fontSize: 26, fontWeight: 800, marginTop: 8,
          color: JJIM.text.primary, letterSpacing: -0.5}}>알림</div>
        <div style={{fontSize: 12, color: JJIM.text.tertiary,
          marginTop: 4, lineHeight: 1.55}}>
          방이 붐비는 순간 짧게 알려줍니다. 너무 자주 오지 않도록 조정.
        </div>

        <div style={{marginTop: 22}}>
          <div className="mono" style={{fontSize: 10, color: JJIM.accent.warm,
            letterSpacing: 2, marginBottom: 8, paddingLeft: 4,
            fontWeight: 700}}>PREVIEW</div>
          <div style={{padding:'12px 14px', borderRadius: 14,
            background:'rgba(255,255,255,0.08)',
            backdropFilter:'blur(20px)',
            border:'1px solid rgba(255,255,255,0.12)',
            display:'flex', gap: 12, alignItems:'flex-start'}}>
            <div style={{width: 36, height: 36, borderRadius: 9,
              background:'linear-gradient(180deg, #FFB060, #C95830)',
              display:'flex', alignItems:'center', justifyContent:'center'}}>
              <_Mark size={22} color="#2a1000"/>
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display:'flex', justifyContent:'space-between',
                alignItems:'baseline'}}>
                <div style={{fontSize: 13, fontWeight: 700,
                  color: JJIM.text.primary}}>Sauna</div>
                <div style={{fontSize: 10, color: JJIM.text.tertiary}}>지금</div>
              </div>
              <div style={{fontSize: 12.5, color:'rgba(255,230,200,0.92)',
                marginTop: 2, lineHeight: 1.45,
                display:'inline-flex', alignItems:'center', gap: 5,
                flexWrap:'wrap'}}>
                <span style={{color:'#FF8A50', display:'inline-flex'}}>
                  <IcStock size={13} color="currentColor"/>
                </span>
                주식방이 꽉 차 있어 (312명). 잠깐 앉았다 갈래?
              </div>
            </div>
          </div>
        </div>

        <SettingGroup title="방별 알림">
          <SettingRow Ic={IcDaily} label="일상 방 피크" toggle={true}/>
          <SettingRow Ic={IcStock} label="주식 방 피크" toggle={true}/>
          <SettingRow Ic={IcJob} label="취준 방 피크" toggle={false} last/>
        </SettingGroup>

        <SettingGroup title="빈도">
          <SettingRow Ic={IcClock} label="쿨다운" value="최소 2시간"/>
          <SettingRow Ic={IcMoon} label="야간 방해금지" value="22:00 ~ 07:00" last/>
        </SettingGroup>
      </div>

      <JjimTabBar active="set"/>
    </ClayWall>
  );
}

// keyframes
if (typeof document !== 'undefined' && !document.getElementById('jjim-kf')) {
  const s = document.createElement('style');
  s.id = 'jjim-kf';
  s.textContent = `@keyframes jjblink { 50% { opacity: 0; } }`;
  document.head.appendChild(s);
}

Object.assign(window, {
  JjimTabBar, JjimAvatar, JjimRoomCard,
  JjimHome, JjimEnter, JjimRoom,
  JjimProfile, JjimSettings, JjimNotifPrefs,
});
