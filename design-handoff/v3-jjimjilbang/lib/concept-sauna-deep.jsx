// ConceptSaunaDeep — 사우나 · 힐링 단일 테마 · 휘발성 증기 말풍선
// · 방 3개 고정 (일상 · 취준 · 주식) — 시즌마다 개발자가 방 추가
// · 시간 제한 없음. 언제든지 ← 로 나갈 수 있음.
// · 모든 아이콘은 SVG (sauna-ds.jsx) — 이모지 없음

function ConceptSaunaDeep({
  roomId = 'daily',
  crowd = 'medium',        // 'lonely' | 'medium' | 'packed'
  reduceMotion = false,
  width = 390, height = 844,
  keyboardUp = false,
}) {
  const {
    SAUNA, IcArrowLeft, IcArrowUpRight,
    IcDaily, IcStock, IcJob, IcWorldCup, IcMedal,
    IcSteam,
  } = window;

  // --- 방 3개 고정 (+ SOON 시즌 방) ---
  const rooms = {
    daily: { name: '일상 사우나', tag: 'DAILY', sub: '오늘 하루 흘려보내기' },
    job:   { name: '취준 사우나', tag: 'JOB',   sub: '면접 뒤끝 · 합격 발표 · 막막함 전부' },
    stock: { name: '주식 사우나', tag: 'STOCK', sub: '열받은 장에서 잠깐 앉았다 가' },
  };
  const config = rooms[roomId] || rooms.daily;
  const accent = (SAUNA.room[roomId] || {}).accent || SAUNA.heat[400];

  // --- 인원수 케이스 ---
  const density = {
    lonely: { spawnMs: 10000, maxMsgs: 2,  mineChance: 0.08, lifeMs: 12000,
              headCount: {daily: 2, job: 3, stock: 1}[roomId] || 2 },
    medium: { spawnMs: 1300,  maxMsgs: 6,  mineChance: 0.30, lifeMs:  8500,
              headCount: {daily: 12, job: 14, stock: 11}[roomId] || 12 },
    packed: { spawnMs: 550,   maxMsgs: 14, mineChance: 0.22, lifeMs:  6000,
              headCount: {daily: 142, job: 188, stock: 312}[roomId] || 142 },
  }[crowd] || { spawnMs: 1300, maxMsgs: 6, mineChance: 0.30, lifeMs: 8500, headCount: 12 };

  const [msgs, setMsgs] = React.useState([]);
  const idRef = React.useRef(0);
  const MY_ID = 'me-self';

  // --- 방별 메시지 풀 ---
  const BANK = {
    daily: [
      { text: '하… 여기 앉으니까 어깨가 녹는다', nickname: '녹아내리는수달' },
      { text: '하루가 땀으로 빠져나가는 느낌',   nickname: '뽀송한너구리' },
      { text: '눈 감고 있으면 시간 멈춰',        nickname: '쉬는고양이' },
      { text: '몸이 따뜻해지니까 마음도 말랑해', nickname: '포근한햄스터' },
      { text: '오늘 진짜 힘들었다…',            nickname: '지친여우' },
      { text: '말 없이 같이 땀 흘리는 것도 좋네', nickname: '조용한두루미' },
      { text: '숨 들이마시면 나무 향',          nickname: '편백나무좋아' },
      { text: '여기 나오면 잘 잘 수 있어',       nickname: '꿀잠기원' },
      { text: '수건 찜질하면 개이득',            nickname: '땀뻘뻘토끼' },
      { text: '5분만 더 있다 나가야지',          nickname: '미루는펭귄' },
      { text: '아 이 온기에 중독됐다',          nickname: '노곤한사슴' },
    ],
    job: [
      { text: '면접 끝나고 바로 여기 들어옴',    nickname: '식은땀토끼' },
      { text: '오늘도 서류 광탈…',              nickname: '털린북극곰' },
      { text: '내일 발표 난다 심장 터질 듯',    nickname: '두근두근' },
      { text: '코테 한 문제 남았는데 모르겠음',  nickname: '굳어버린손' },
      { text: '같이 뜨겁게 버텨요 우리',        nickname: '버티는사슴' },
      { text: '면접관님 왜 그 질문을요',        nickname: '말잃은두루미' },
      { text: '합격 문자 오면 울 것 같음',      nickname: '눈물참는' },
      { text: '오늘 자소서 세 개 썼다',         nickname: '지친연필' },
      { text: '우리 다 된다 진짜',              nickname: '긍정여우' },
      { text: '포폴 다듬다가 밤새 ㅠㅠ',        nickname: '새벽펭귄' },
      { text: '최종면접 드가자',                nickname: '두근거림' },
      { text: '같이 땀 흘리면 덜 외롭네',       nickname: '동기사자' },
    ],
    stock: [
      { text: '장 열리자마자 -5% 찍음',        nickname: '불타는개미' },
      { text: '존버가 답이다',                  nickname: '존버왕' },
      { text: 'VI 걸렸다 심박수 미침',         nickname: '심장터짐' },
      { text: '물타다 더 물렸어요',             nickname: '물먹은하마' },
      { text: '손절 타이밍 놓친 듯',            nickname: '미련곰탱' },
      { text: '오히려 좋아 더 담자',           nickname: '용감한거북' },
      { text: '공포에 사서 탐욕에 팔자…',       nickname: '현인거북' },
      { text: '주가 그래프 보면 속이 뒤집힘',    nickname: '속쓰린' },
      { text: '여기 앉으니 마음이 좀 진정됨',   nickname: '숨고르는' },
      { text: '내 계좌만 파란불',               nickname: '파란하늘' },
      { text: '차트 그만 봐야지…',              nickname: '눈감은오소리' },
      { text: '다음주엔 오르겠지',              nickname: '희망사자' },
    ],
  };

  React.useEffect(() => {
    if (reduceMotion) return;
    const bank = BANK[roomId] || BANK.daily;
    let cancelled = false;
    const spawn = (isMine = false) => {
      const m = bank[Math.floor(Math.random() * bank.length)];
      if (!m) return;
      const id = ++idRef.current;
      const x = 0.12 + Math.random() * 0.76;
      const life = density.lifeMs + Math.random() * (density.lifeMs * 0.35);
      setMsgs(prev => [...prev,
        { id, ...m, x, spawnAt: performance.now(), life,
          senderId: isMine ? MY_ID : 'u' + id,
          nickname: isMine ? '나' : m.nickname }
      ].slice(-density.maxMsgs));
      setTimeout(() => { if (!cancelled) setMsgs(p => p.filter(x => x.id !== id)); }, life + 400);
    };
    const i = setInterval(spawn, density.spawnMs);
    const mine = setInterval(() => { if (Math.random() < density.mineChance) spawn(true); }, 4800);
    const initialCount = crowd === 'packed' ? 8 : crowd === 'medium' ? 4 : 1;
    const k = [];
    for (let j = 0; j < initialCount; j++) k.push(setTimeout(spawn, j * 200));
    return () => { cancelled = true; clearInterval(i); clearInterval(mine); k.forEach(clearTimeout); };
  }, [roomId, crowd, reduceMotion]);

  const plankBg = `
    linear-gradient(180deg, rgba(50,25,10,0.35) 0%, transparent 14%, transparent 86%, rgba(30,14,4,0.45) 100%),
    repeating-linear-gradient(90deg,
      #C08A55 0px, #C89362 8px, #B47A47 9px, #B47A47 10px,
      #C89362 11px, #BE8858 24px, #A87140 25px, #A87140 26px,
      #BE8858 27px, #C08A55 40px)`;

  const roomChips = [
    { id:'daily', n:'일상',   Ic: IcDaily },
    { id:'job',   n:'취준',   Ic: IcJob },
    { id:'stock', n:'주식',   Ic: IcStock },
    { id:'_wc',   n:'월드컵', Ic: IcWorldCup, soon: true },
    { id:'_oly',  n:'올림픽', Ic: IcMedal,    soon: true },
  ];

  return (
    <div style={{
      position: 'relative', width, height, overflow: 'hidden',
      fontFamily: "'Noto Sans KR', -apple-system, sans-serif",
      background: plankBg, backgroundSize: '40px 100%, 40px 100%',
      color: '#FFE8C8',
    }}>
      {/* warm glow */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:2,
        background:`radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,180,90,0.28), transparent 70%),
                    radial-gradient(ellipse 50% 30% at 20% 100%, rgba(255,140,60,0.18), transparent 70%),
                    radial-gradient(ellipse 50% 30% at 80% 100%, rgba(255,140,60,0.16), transparent 70%)`}}/>

      {/* ceiling downlights */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:120,zIndex:3,pointerEvents:'none',
        display:'flex', justifyContent:'space-around', padding:'0 16px'}}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{
            width: 28, height: 22, marginTop: -2,
            background: `radial-gradient(ellipse at 50% 0%, rgba(255,200,120,0.95) 0%, rgba(255,160,70,0.5) 40%, transparent 70%)`,
            filter: 'blur(2px)',
            animation: reduceMotion ? 'none' : `sauna-heat-${i%3} ${3 + (i%3)*0.6}s ease-in-out infinite`,
          }}/>
        ))}
      </div>

      {/* floor slats */}
      {!keyboardUp && <div style={{position:'absolute', bottom: 0, left:0, right:0, height: 96, zIndex: 4,
        background: `linear-gradient(180deg, rgba(40,18,5,0.0) 0%, rgba(40,18,5,0.35) 12%, rgba(40,18,5,0.55) 100%),
          repeating-linear-gradient(0deg,
            rgba(60,30,10,0.5) 0px, rgba(80,42,16,0.3) 2px, rgba(40,18,5,0.6) 3px, rgba(40,18,5,0.6) 4px)`,
        boxShadow:'inset 0 6px 14px rgba(0,0,0,0.55), 0 -3px 10px rgba(255,140,60,0.1)'}}/>}

      {/* soft haze */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:240,zIndex:6,pointerEvents:'none',
        background:'linear-gradient(0deg, rgba(255,180,100,0.18), transparent 80%)',
        animation: reduceMotion ? 'none' : 'sauna-shimmer 6s ease-in-out infinite'}}/>

      {/* ========== HEADER ========== */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, zIndex: 15,
        padding: '54px 16px 10px'}}>
        <div style={{display:'flex', alignItems:'flex-start',
          justifyContent:'space-between', gap: 10}}>
          <div style={{minWidth: 0, flex: 1, display:'flex', gap: 10}}>
            {/* back button — "언제든지 ←" */}
            <button style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background:'rgba(20,8,2,0.7)',
              border_: '1px solid rgba(255,200,140,0.3)',
              outline: '1px solid rgba(255,200,140,0.3)',
              outlineOffset: -1,
              color: '#FFD490', cursor: 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink: 0, backdropFilter:'blur(6px)',
            }}>
              <IcArrowLeft size={20} color="currentColor"/>
            </button>

            <div style={{minWidth: 0, flex: 1}}>
              <div style={{
                display:'inline-flex', alignItems:'center', gap: 5,
                padding:'3px 8px', borderRadius: 4,
                background:'rgba(20,8,2,0.55)',
                border:'1px solid rgba(255,200,140,0.25)',
                backdropFilter:'blur(6px)',
              }}>
                <span style={{width:5,height:5,borderRadius:'50%',
                  background:'#FF8A3B',boxShadow:'0 0 6px #FF8A3B'}}/>
                <span className="mono" style={{fontSize:9, color:'#FFD4A0',
                  letterSpacing: 2.5, fontWeight: 600}}>SAUNA · {config.tag}</span>
              </div>
              <div style={{marginTop: 6, display:'flex', alignItems:'center', gap: 8}}>
                <span style={{fontSize: 22, fontWeight: 700, color:'#FFE8C8',
                  letterSpacing: -0.6, textShadow:'0 2px 6px rgba(100,40,10,0.8), 0 0 14px rgba(255,200,130,0.2)'}}>
                  {config.name}
                </span>
                <span style={{color: accent, display:'inline-flex', opacity: 0.85}}>
                  <IcDaily size={16} color="currentColor"/>
                  {roomId === 'stock' && <IcStock size={16} color="currentColor"/>}
                  {roomId === 'job' && <IcJob size={16} color="currentColor"/>}
                </span>
              </div>
              <div style={{fontSize: 11, color:'rgba(255,220,180,0.65)', marginTop: 1,
                textShadow:'0 1px 2px rgba(0,0,0,0.6)',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                {config.sub} · 지금 {density.headCount.toLocaleString()}명
              </div>
            </div>
          </div>

          {/* head count display — replaces countdown */}
          <div style={{
            padding: '6px 10px', borderRadius: 10,
            background:'linear-gradient(180deg, rgba(40,20,8,0.8), rgba(20,8,2,0.9))',
            border:'1px solid rgba(255,170,100,0.25)',
            boxShadow:'0 3px 10px rgba(0,0,0,0.5)',
            textAlign:'center', minWidth: 52,
          }}>
            <div className="mono" style={{fontSize: 7.5, color:'#FF9A55',
              letterSpacing: 1.6, fontWeight: 600, marginBottom: 2}}>LIVE</div>
            <div style={{fontSize: 16, fontWeight: 700, color:'#FFC975',
              fontFamily:"'JetBrains Mono', monospace",
              fontVariantNumeric:'tabular-nums',
              textShadow:'0 0 8px rgba(255,140,50,0.5)'}}>
              {density.headCount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* room chips — horizontal scroll */}
        <div style={{
          marginTop: 10, display:'flex', gap: 5,
          overflowX:'auto', paddingBottom: 2,
          scrollbarWidth: 'none',
          WebkitMaskImage: 'linear-gradient(90deg, #000 0%, #000 92%, transparent 100%)',
          maskImage: 'linear-gradient(90deg, #000 0%, #000 92%, transparent 100%)',
        }}>
          {roomChips.map(p => {
            const on = p.id === roomId;
            return (
              <div key={p.id} style={{
                flexShrink: 0,
                padding: p.soon ? '5px 9px' : '5px 11px', borderRadius: 999,
                fontSize: 11.5, fontWeight: 600,
                background: on ? 'rgba(255,220,160,0.28)'
                  : p.soon ? 'rgba(20,8,2,0.4)' : 'rgba(20,8,2,0.55)',
                color: on ? '#FFE8C8'
                  : p.soon ? 'rgba(255,220,180,0.3)' : 'rgba(255,220,180,0.72)',
                border: `1px solid ${on ? 'rgba(255,200,130,0.7)'
                  : p.soon ? 'rgba(255,180,110,0.12)' : 'rgba(255,180,110,0.25)'}`,
                backdropFilter:'blur(6px)',
                display:'inline-flex', alignItems:'center', gap: 5,
              }}>
                <p.Ic size={12} color="currentColor"/>
                <span>{p.n}</span>
                {p.soon && <span style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background:'rgba(255,220,180,0.35)',
                  marginLeft: 2,
                }}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== STAGE ========== */}
      <div style={{
        position:'absolute',
        top: 180,
        left: 0, right: 0,
        bottom: keyboardUp ? 352 : 96,
        overflow:'hidden', zIndex: 8,
      }}>
        {msgs.map(m => (
          <SteamWhisper
            key={m.id} msg={m} width={width}
            reduceMotion={reduceMotion}
            isMine={m.senderId === MY_ID}
            keyboardUp={keyboardUp}
          />
        ))}

        {/* lonely hint */}
        {crowd === 'lonely' && msgs.length === 0 && (
          <div style={{
            position:'absolute', top:'45%', left: 0, right: 0,
            textAlign:'center', color:'rgba(255,220,180,0.4)',
            fontSize: 12, lineHeight: 1.6,
          }}>
            <div style={{display:'flex', justifyContent:'center', opacity: 0.55}}>
              <IcSteam size={36} color="currentColor"/>
            </div>
            <div style={{marginTop: 8}}>지금 혼자 앉아있어요.</div>
            <div style={{fontSize: 10.5, opacity: 0.8, marginTop: 2}}>증기를 먼저 뱉어볼까요?</div>
          </div>
        )}
      </div>

      {/* ========== INPUT ========== */}
      <div style={{
        position:'absolute', bottom: keyboardUp ? 301 : 28,
        left: 14, right: 14, zIndex: 52, height: 48, borderRadius: 14,
        background:'linear-gradient(180deg, rgba(60,30,12,0.75) 0%, rgba(30,14,4,0.85) 100%)',
        backdropFilter:'blur(14px)',
        border:'1px solid rgba(255,190,120,0.35)',
        boxShadow:'0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,210,150,0.12)',
        display:'flex', alignItems:'center', padding:'0 6px 0 16px',
      }}>
        <div style={{fontSize: 14, color:'rgba(255,220,180,0.55)', flex: 1}}>
          천천히 뱉어봐…
        </div>
        <button style={{
          width: 36, height: 36, borderRadius: 10, border:'none',
          background:'linear-gradient(180deg, #FFB060 0%, #E87020 100%)',
          color:'#2a1000', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 2px 8px rgba(255,120,40,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>
          <IcArrowUpRight size={18} color="currentColor"/>
        </button>
      </div>

      <div style={{position:'absolute',bottom:8,left:0,right:0,display:'flex',
        justifyContent:'center',zIndex:100, pointerEvents:'none'}}>
        <div style={{width:134,height:5,borderRadius:3,background:'rgba(255,230,190,0.45)'}}/>
      </div>
    </div>
  );
}

function SteamWhisper({ msg, width, reduceMotion, isMine, keyboardUp }) {
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

  const yStart = keyboardUp ? 340 : 500;
  const yEnd   = keyboardUp ? 20  : 20;
  const y = yStart + (yEnd - yStart) * t;
  const x = msg.x * width + Math.sin(t * 3.2) * (keyboardUp ? 8 : 12);
  const opacity = t < 0.10 ? t / 0.10 : t > 0.72 ? (1 - t) / 0.28 : 1;
  const blur = t > 0.62 ? (t - 0.62) * 12 : 0;
  const scale = 0.9 + t * 0.15;

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity, filter: blur ? `blur(${blur}px)` : 'none',
      pointerEvents:'none', willChange:'transform, opacity',
      textAlign:'center',
    }}>
      <div style={{
        display:'inline-block',
        padding: keyboardUp ? '6px 12px' : '8px 14px',
        borderRadius: keyboardUp ? 12 : 14,
        background: isMine
          ? 'linear-gradient(180deg, rgba(255,220,150,0.5) 0%, rgba(255,180,100,0.38) 100%)'
          : 'linear-gradient(180deg, rgba(255,230,190,0.32) 0%, rgba(255,210,160,0.2) 100%)',
        backdropFilter:'blur(4px)',
        border: isMine
          ? '1.5px solid rgba(255,210,120,0.8)'
          : '1px solid rgba(255,220,180,0.35)',
        boxShadow: isMine
          ? '0 0 22px rgba(255,180,80,0.45), 0 2px 6px rgba(0,0,0,0.3)'
          : '0 0 14px rgba(255,200,140,0.25), 0 2px 4px rgba(0,0,0,0.3)',
        maxWidth: keyboardUp ? 240 : 280,
      }}>
        <div className="mono" style={{
          fontSize: keyboardUp ? 8.5 : 9,
          color: isMine ? '#FFE09A' : '#FFD4A0',
          letterSpacing: 0.3, marginBottom: keyboardUp ? 1 : 2,
          fontWeight: 700, opacity: 0.95,
        }}>{msg.nickname}</div>
        <div style={{
          fontSize: keyboardUp ? 12 : 13,
          fontWeight: 500, color:'#fff8ec',
          lineHeight: 1.4, textShadow:'0 1px 3px rgba(50,15,0,0.9)',
          wordBreak:'keep-all', textWrap:'pretty',
          fontFamily:"'Noto Sans KR', sans-serif",
        }}>{msg.text}</div>
      </div>
    </div>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('sauna-deep-kf')) {
  const s = document.createElement('style');
  s.id = 'sauna-deep-kf';
  s.textContent = `
    @keyframes sauna-heat-0 { 0%,100% { opacity:0.75; transform: translateY(0);} 50% { opacity:1; transform: translateY(2px);} }
    @keyframes sauna-heat-1 { 0%,100% { opacity:0.6;  transform: translateY(0);} 50% { opacity:0.9; transform: translateY(3px);} }
    @keyframes sauna-heat-2 { 0%,100% { opacity:0.7;  transform: translateY(0);} 50% { opacity:1; transform: translateY(1.5px);} }
    @keyframes sauna-shimmer { 0%,100% { opacity:0.85; } 50% { opacity: 1; } }
  `;
  document.head.appendChild(s);
}

Object.assign(window, { ConceptSaunaDeep });
