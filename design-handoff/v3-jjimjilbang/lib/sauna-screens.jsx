// Sauna app screens — all sharing the warm wood + amber-glow palette.
// Every screen is a full phone interior: absolute positioned, 393×852.
// All icons are SVG (from sauna-ds.jsx). Zero emoji.

const {
  SAUNA,
  IcSaunaMark, AnonAvatar,
  IcDaily, IcStock, IcJob, IcWorldCup, IcMedal,
  IcSteam, IcWaves, IcLeaf,
  IcDoor, IcPerson, IcGear,
  IcClock, IcRefresh, IcDice, IcBell, IcMoon, IcVibrate,
  IcContrast, IcMotion, IcType, IcTrash, IcInfo,
  IcArrowLeft, IcArrowUpRight, IcChevron, IcHeart,
  MonoTag, DoorButton,
} = window;

const WOOD      = SAUNA.wood.plank;
const WOOD_DARK = SAUNA.wood.dark;
const GLOW      = SAUNA.glow;

// Room → icon mapping (single source)
function RoomIcon({ id, size = 22, color = 'currentColor' }) {
  if (id === 'daily') return <IcDaily size={size} color={color}/>;
  if (id === 'stock') return <IcStock size={size} color={color}/>;
  if (id === 'job')   return <IcJob   size={size} color={color}/>;
  if (id === '_wc')   return <IcWorldCup size={size} color={color}/>;
  if (id === '_oly')  return <IcMedal size={size} color={color}/>;
  return <IcLeaf size={size} color={color}/>;
}

function ScreenBase({ children, bg = WOOD_DARK, glow = false }) {
  return (
    <div style={{
      position:'absolute', inset: 0, overflow: 'hidden',
      background: bg,
      fontFamily: "'Noto Sans KR', -apple-system, sans-serif",
      color: SAUNA.text.primary,
    }}>
      {glow && <div style={{position:'absolute',inset:0,pointerEvents:'none',
        zIndex:2, background: GLOW}}/>}
      {children}
    </div>
  );
}

// =======================================================================
// 0. Splash
// =======================================================================
function ScreenSplash() {
  return (
    <ScreenBase bg={SAUNA.wood.deep}>
      <div style={{position:'absolute', inset:0,
        background:`radial-gradient(ellipse 80% 50% at 50% 50%, rgba(255,150,60,0.25), transparent 70%)`}}/>
      <div style={{position:'absolute', inset:0, display:'flex',
        flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <div style={{
          width: 88, height: 88, borderRadius: 22,
          background: 'linear-gradient(180deg, #FFB060 0%, #8a3e14 100%)',
          boxShadow: '0 0 40px rgba(255,140,50,0.5), inset 0 2px 0 rgba(255,255,255,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <IcSaunaMark size={52} color="#2a1000"/>
        </div>
        <div style={{fontSize: 32, fontWeight: 800, marginTop: 22,
          letterSpacing: -0.8, color: SAUNA.text.primary,
          textShadow:'0 2px 12px rgba(255,150,60,0.4)'}}>Sauna</div>
        <MonoTag>TALK · SWEAT · DISSOLVE</MonoTag>
      </div>
      <div style={{position:'absolute', bottom: 50, left:0, right:0,
        textAlign:'center', color: SAUNA.text.muted, fontSize: 11}}>
        v 0.1 · 익명 휘발성 대화
      </div>
    </ScreenBase>
  );
}

// =======================================================================
// Onboarding 1 — What is Sauna
// =======================================================================
function ScreenOnboard1() {
  return (
    <ScreenBase bg={WOOD} glow={true}>
      <div style={{position:'absolute', top:80, left:0, right:0,
        textAlign:'center', padding:'0 28px', zIndex: 5}}>
        <div style={{display:'flex', justifyContent:'center', marginBottom: 18}}>
          <div style={{width: 88, height: 88, borderRadius: 22,
            background: 'linear-gradient(180deg, rgba(60,30,12,0.9) 0%, rgba(30,14,4,0.95) 100%)',
            border: '1px solid rgba(255,200,140,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(255,150,60,0.25), inset 0 1px 0 rgba(255,210,150,0.2)'}}>
            <IcSaunaMark size={52} color={SAUNA.heat[300]}/>
          </div>
        </div>
        <MonoTag>STEP 1 OF 3</MonoTag>
        <div style={{fontSize: 28, fontWeight: 800, marginTop: 14,
          letterSpacing: -0.6, color: SAUNA.text.primary,
          textShadow:'0 2px 8px rgba(100,40,10,0.8)'}}>
          여긴 사우나야
        </div>
        <div style={{fontSize: 15, color: SAUNA.text.secondary,
          marginTop: 14, lineHeight: 1.65,
          textShadow:'0 1px 3px rgba(0,0,0,0.6)'}}>
          뜨거운 원목 방에 앉아서<br/>
          얼굴 모르는 사람들이랑<br/>
          <b style={{color: SAUNA.heat[300]}}>땀 흘리듯</b> 말을 뱉는 곳.
        </div>
      </div>
      {/* decorative steam */}
      <div style={{position:'absolute', bottom: 200, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 18, opacity: 0.35,
        filter: 'blur(0.5px)', zIndex: 3, color: SAUNA.heat[200]}}>
        <IcSteam size={40} color="currentColor"/>
        <IcSteam size={56} color="currentColor"/>
        <IcSteam size={40} color="currentColor"/>
      </div>

      <Pagination index={0}/>
      <div style={{position:'absolute', bottom: 58, left: 24, right: 24, zIndex: 10,
        display:'flex', gap: 10}}>
        <DoorButton primary={false} style={{flex:'0 0 86px'}}>건너뛰기</DoorButton>
        <DoorButton>다음</DoorButton>
      </div>
    </ScreenBase>
  );
}

function Pagination({ index }) {
  return (
    <div style={{position:'absolute', bottom: 140, left:0, right:0,
      display:'flex', justifyContent:'center', gap: 6, zIndex: 10}}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: i===index ? 20 : 6, height: 6, borderRadius: 3,
          background: i===index ? SAUNA.heat[400] : 'rgba(255,220,180,0.3)',
          transition:'width .3s',
        }}/>
      ))}
    </div>
  );
}

// =======================================================================
// Onboarding 2 — Rules (evaporates)
// =======================================================================
function ScreenOnboard2() {
  const rules = [
    { Ic: IcArrowLeft, t: '언제든 나가도 돼',
      d: '답답하면 그냥 뒤로. 시간 제한 없음. 다음에 또 들어오면 돼.' },
    { Ic: IcPerson,    t: '이름은 매일 바뀌어',
      d: '자정마다 새 닉네임이 주어져. 어제의 나랑 연결 안 됨.' },
    { Ic: IcSteam,     t: '메시지는 저장 안 돼',
      d: '올라오고, 떠다니고, 사라짐. 히스토리도 검색도 없어.' },
    { Ic: IcDoor,      t: '방은 3개부터',
      d: '일상 · 주식 · 취준. 시즌마다 새 방이 열려.' },
  ];
  return (
    <ScreenBase bg={WOOD} glow={true}>
      <div style={{position:'absolute', top: 76, left: 24, right: 24, zIndex: 5}}>
        <div style={{textAlign:'center'}}>
          <div style={{display:'flex', justifyContent:'center', marginBottom: 8,
            color: SAUNA.heat[200]}}>
            <IcSteam size={52} color="currentColor"/>
          </div>
          <MonoTag>STEP 2 OF 3</MonoTag>
          <div style={{fontSize: 24, fontWeight: 800, marginTop: 10,
            letterSpacing: -0.4, color: SAUNA.text.primary,
            textShadow:'0 2px 8px rgba(100,40,10,0.8)'}}>
            말은 증기처럼 사라져
          </div>
        </div>

        <div style={{marginTop: 26, display:'flex', flexDirection:'column', gap: 12}}>
          {rules.map((r, i) => (
            <div key={i} style={{
              display:'flex', gap: 14, alignItems:'flex-start',
              padding:'14px 16px', borderRadius: 12,
              background:'rgba(20,8,2,0.55)',
              border:`1px solid ${SAUNA.surface.hairline}`,
              backdropFilter:'blur(8px)',
            }}>
              <div style={{marginTop: 2, color: SAUNA.heat[300]}}>
                <r.Ic size={22} color="currentColor"/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize: 14, fontWeight: 700, color: SAUNA.text.primary}}>{r.t}</div>
                <div style={{fontSize: 12, color: SAUNA.text.tertiary,
                  marginTop: 3, lineHeight: 1.5}}>{r.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Pagination index={1}/>
      <div style={{position:'absolute', bottom: 58, left: 24, right: 24, zIndex: 10,
        display:'flex', gap: 10}}>
        <DoorButton primary={false} style={{flex:'0 0 86px'}}>이전</DoorButton>
        <DoorButton>다음</DoorButton>
      </div>
    </ScreenBase>
  );
}

// =======================================================================
// Onboarding 3 — Your nickname today
// =======================================================================
function ScreenOnboard3() {
  return (
    <ScreenBase bg={WOOD} glow={true}>
      <div style={{position:'absolute', top: 96, left: 24, right: 24,
        zIndex: 5, textAlign:'center'}}>
        <MonoTag>STEP 3 OF 3</MonoTag>
        <div style={{fontSize: 24, fontWeight: 800, marginTop: 10,
          letterSpacing: -0.4, color: SAUNA.text.primary,
          textShadow:'0 2px 8px rgba(100,40,10,0.8)'}}>
          오늘의 너는
        </div>

        <div style={{
          marginTop: 32, padding:'28px 20px', borderRadius: 20,
          background:'linear-gradient(180deg, rgba(80,40,14,0.7) 0%, rgba(30,14,4,0.85) 100%)',
          border:'1.5px solid rgba(255,200,130,0.45)',
          boxShadow:'0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,210,150,0.2)',
        }}>
          <div style={{display:'flex', justifyContent:'center', marginBottom: 16}}>
            <AnonAvatar size={72} accent={SAUNA.heat[300]}/>
          </div>
          <div style={{fontSize: 26, fontWeight: 800, color: SAUNA.heat[200],
            letterSpacing: -0.4, textShadow:'0 0 20px rgba(255,180,90,0.5)'}}>
            노곤한사슴
          </div>
          <div className="mono" style={{fontSize: 11, color: SAUNA.text.tertiary,
            marginTop: 4, letterSpacing: 1.5}}>#4f29</div>

          <div style={{marginTop: 18, padding: '10px 14px', borderRadius: 10,
            background:'rgba(20,8,2,0.5)', fontSize: 11.5,
            color: SAUNA.text.secondary, lineHeight: 1.55}}>
            내일 자정이 되면 새 이름이 와. 오늘 무슨 말을 해도 내일의 너랑은 연결되지 않아.
          </div>
        </div>

        <button style={{
          marginTop: 14, background:'transparent', border:'none',
          color: SAUNA.text.tertiary, fontSize: 12, cursor:'pointer',
          fontFamily:"'Noto Sans KR', sans-serif",
          display:'inline-flex', alignItems:'center', gap: 6,
          padding: '4px 8px',
        }}>
          <IcDice size={14} color="currentColor"/>
          다시 뽑기 (오늘 1회)
        </button>
      </div>

      <Pagination index={2}/>
      <div style={{position:'absolute', bottom: 58, left: 24, right: 24, zIndex: 10}}>
        <DoorButton iconLeft={<IcDoor size={18} color="#2a1000"/>}>
          사우나로 들어가기
        </DoorButton>
      </div>
    </ScreenBase>
  );
}

// =======================================================================
// Home — 3 room cards + tab bar
// =======================================================================
function RoomCard({ roomId, label, tag, sub, headCount, trend, density }) {
  const accent = (SAUNA.room[roomId] || {}).accent || SAUNA.heat[400];
  const tagBg  = (SAUNA.room[roomId] || {}).bg || 'rgba(255,180,110,0.15)';
  const barW = Math.min(1, headCount / 300);

  return (
    <div style={{
      padding:'18px 18px 16px', borderRadius: 18,
      background: SAUNA.surface.card,
      border:'1px solid rgba(255,180,110,0.3)',
      boxShadow:'0 4px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,210,150,0.12)',
      position:'relative', overflow:'hidden',
    }}>
      {/* large decorative icon in corner */}
      <div style={{position:'absolute', top: 14, right: 14,
        opacity: 0.18, pointerEvents:'none', color: accent}}>
        <RoomIcon id={roomId} size={64} color="currentColor"/>
      </div>

      <div style={{display:'flex', alignItems:'flex-start',
        justifyContent:'space-between', gap: 10}}>
        <div style={{minWidth: 0, flex: 1}}>
          <div style={{display:'inline-flex', alignItems:'center', gap:5,
            padding:'3px 8px', borderRadius: 5,
            background: tagBg,
            border: `1px solid ${accent}44`,
          }}>
            <span style={{width:5,height:5,borderRadius:'50%',
              background: accent,
              boxShadow:`0 0 6px ${accent}`}}/>
            <span className="mono" style={{fontSize: 9, color: accent,
              letterSpacing: 2, fontWeight: 600}}>{tag}</span>
          </div>
          <div style={{marginTop: 6, display:'flex', alignItems:'center', gap: 8,
            fontSize: 20, fontWeight: 700,
            color: SAUNA.text.primary, letterSpacing: -0.4}}>
            {label}
            <span style={{color: accent, opacity: 0.7, display:'inline-flex'}}>
              <RoomIcon id={roomId} size={16} color="currentColor"/>
            </span>
          </div>
          <div style={{fontSize: 12, color: SAUNA.text.tertiary, marginTop: 2}}>
            {sub}
          </div>
        </div>
      </div>

      {/* density bar */}
      <div style={{marginTop: 14, display:'flex',
        alignItems:'center', gap: 10}}>
        <div style={{flex:1, height: 4, borderRadius: 2,
          background:'rgba(20,8,2,0.6)', overflow:'hidden'}}>
          <div style={{
            height:'100%',
            width: `${barW*100}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
            boxShadow: `0 0 8px ${accent}80`,
          }}/>
        </div>
        <div style={{display:'flex', alignItems:'baseline', gap: 4,
          fontFamily:"'JetBrains Mono', monospace"}}>
          <span style={{fontSize: 16, fontWeight: 700, color: accent,
            fontVariantNumeric:'tabular-nums'}}>{headCount.toLocaleString()}</span>
          <span style={{fontSize: 10, color: SAUNA.text.tertiary}}>명</span>
          {trend !== undefined && trend !== 0 && (
            <span style={{fontSize: 10,
              color: trend>0 ? SAUNA.heat[400] : '#9bc',
              marginLeft: 4,
              display:'inline-flex', alignItems:'center', gap: 1}}>
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
        color: SAUNA.text.tertiary,
        letterSpacing: 0.2}}>{density}</div>
    </div>
  );
}

function ScreenHome({ timeOfDay = 'evening' }) {
  const tod = {
    morning: { label: '09:41', nick: '상쾌한수달',
      daily: {h: 48, t: 5, d: '한산 · 숨고를만한 리듬'},
      stock: {h: 322, t: 28, d: '장 시작 · 벌써 꽉 참'},
      job:   {h: 12, t: -2, d: '적막 · 혼자 땀 흘리기 좋음'},
    },
    evening: { label: '18:47', nick: '노곤한사슴',
      daily: {h: 142, t: 16, d: '붐빔 · 퇴근 피크'},
      stock: {h: 88, t: -12, d: '장 마감 후 정리'},
      job:   {h: 67, t: 4, d: '편안 · 자소서 얘기 많음'},
    },
    night: { label: '03:28', nick: '깨어있는여우',
      daily: {h: 8, t: -3, d: '적막 · 불면의 밤'},
      stock: {h: 3, t: 0, d: '한두명 · 뉴욕장 구경'},
      job:   {h: 24, t: 2, d: '새벽조 · 발표 대기'},
    },
  }[timeOfDay];

  return (
    <ScreenBase bg={WOOD_DARK}>
      {/* ambient glow */}
      <div style={{position:'absolute', inset:0, zIndex: 1,
        background:`radial-gradient(ellipse 60% 35% at 50% 0%, rgba(255,160,70,0.18), transparent 70%)`}}/>

      {/* Header */}
      <div style={{position:'absolute', top: 60, left: 20, right: 20, zIndex: 5}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <MonoTag>TODAY · {tod.label}</MonoTag>
            <div style={{fontSize: 26, fontWeight: 800, marginTop: 4,
              color: SAUNA.text.primary, letterSpacing: -0.5}}>
              어느 방에 앉을까?
            </div>
          </div>
          <AnonAvatar size={44} accent={SAUNA.heat[300]}/>
        </div>
        <div style={{marginTop: 8, fontSize: 12,
          color: SAUNA.text.tertiary}}>
          오늘 너는 <b style={{color: SAUNA.heat[300]}}>{tod.nick}</b>
        </div>
      </div>

      {/* Room list */}
      <div style={{position:'absolute', top: 184, left: 20, right: 20,
        display:'flex', flexDirection:'column', gap: 12, zIndex: 5}}>
        <RoomCard roomId="daily" label="일상" tag="DAILY"
          sub="오늘 하루 흘려보내기"
          headCount={tod.daily.h} trend={tod.daily.t} density={tod.daily.d}/>
        <RoomCard roomId="stock" label="주식" tag="STOCK"
          sub="열받은 장에서 잠깐 쉬기"
          headCount={tod.stock.h} trend={tod.stock.t} density={tod.stock.d}/>
        <RoomCard roomId="job" label="취준" tag="JOB"
          sub="면접 뒤끝 · 막막함 전부"
          headCount={tod.job.h} trend={tod.job.t} density={tod.job.d}/>

        {/* Coming soon row — seasonal rooms, added by dev */}
        <div style={{marginTop: 4, padding:'14px 16px', borderRadius: 14,
          background:'rgba(20,8,2,0.3)',
          border:'1px dashed rgba(255,180,110,0.25)',
          display:'flex', alignItems:'center', gap: 14}}>
          <div style={{display:'flex', gap: 8, opacity: 0.45,
            color: SAUNA.text.tertiary}}>
            <IcWorldCup size={22} color="currentColor"/>
            <IcMedal    size={22} color="currentColor"/>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 12, color: SAUNA.text.tertiary,
              fontWeight: 600}}>시즌 방</div>
            <div style={{fontSize: 10.5, color: SAUNA.text.muted,
              marginTop: 1}}>이벤트 · 시즌마다 새 방이 열립니다</div>
          </div>
          <div className="mono" style={{fontSize: 9,
            color:'rgba(255,180,110,0.45)', letterSpacing: 1.5}}>SOON</div>
        </div>
      </div>

      <TabBar active="home"/>
    </ScreenBase>
  );
}

function TabBar({ active = 'home' }) {
  const items = [
    { id: 'home', label: '방',   Ic: IcDoor },
    { id: 'me',   label: '나',   Ic: IcPerson },
    { id: 'set',  label: '설정', Ic: IcGear },
  ];
  return (
    <div style={{
      position:'absolute', bottom: 0, left: 0, right: 0,
      height: 92, paddingBottom: 32,
      background: 'linear-gradient(180deg, rgba(30,14,4,0.7) 0%, rgba(15,6,2,0.98) 60%)',
      backdropFilter:'blur(16px)',
      borderTop:`1px solid ${SAUNA.surface.hairline}`,
      display:'flex', justifyContent:'space-around',
      alignItems:'flex-start', paddingTop: 10,
      zIndex: 20,
    }}>
      {items.map(it => {
        const on = it.id === active;
        const col = on ? SAUNA.heat[300] : SAUNA.text.muted;
        return (
          <div key={it.id} style={{
            display:'flex', flexDirection:'column', alignItems:'center',
            gap: 4, padding:'4px 14px', minWidth: 60,
            color: col,
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

// =======================================================================
// Enter transition — door opening
// =======================================================================
function ScreenEnter() {
  return (
    <ScreenBase bg={SAUNA.wood.deep}>
      <div style={{position:'absolute', inset:0,
        background:`radial-gradient(ellipse 50% 30% at 50% 50%, rgba(255,170,80,0.35), transparent 70%)`}}/>
      <div style={{position:'absolute', inset:0, display:'flex',
        flexDirection:'column', alignItems:'center', justifyContent:'center',
        gap: 22}}>
        <div style={{
          width: 96, height: 96, borderRadius: 22,
          background: 'linear-gradient(180deg, rgba(60,30,12,0.95), rgba(20,8,2,0.95))',
          border: '1px solid rgba(255,200,140,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(255,150,60,0.4)',
        }}>
          <IcDoor size={56} color={SAUNA.heat[300]}/>
        </div>
        <MonoTag color={SAUNA.heat[500]}>ENTERING DAILY SAUNA</MonoTag>
        <div style={{fontSize: 20, fontWeight: 700, color: SAUNA.text.primary,
          letterSpacing: -0.3, textAlign:'center'}}>
          문을 엽니다…
        </div>
        <div style={{width: 140, height: 3, borderRadius: 2,
          background:'rgba(255,180,110,0.15)', overflow:'hidden',
          marginTop: 8}}>
          <div style={{width:'65%', height:'100%',
            background:'linear-gradient(90deg, #FFB060, #E87020)',
            boxShadow:'0 0 10px rgba(255,150,70,0.7)'}}/>
        </div>
        <div style={{fontSize: 11, color: SAUNA.text.tertiary,
          marginTop: 6}}>
          따뜻한 열기가 얼굴에 닿아요
        </div>
      </div>
    </ScreenBase>
  );
}

// =======================================================================
// Room — wraps ConceptSaunaDeep (existing)
// =======================================================================
function ScreenRoom({ roomId = 'daily', crowd = 'medium' }) {
  return (
    <window.ConceptSaunaDeep roomId={roomId} crowd={crowd}
      width={393} height={852}/>
  );
}

function ScreenRoomKeyboard({ roomId = 'daily' }) {
  return (
    <window.ConceptSaunaDeep roomId={roomId} crowd="medium"
      keyboardUp={true} width={393} height={852}/>
  );
}

// =======================================================================
// Me / Profile — no history
// =======================================================================
function ScreenProfile() {
  return (
    <ScreenBase bg={WOOD_DARK}>
      <div style={{position:'absolute', top: 60, left: 20, right: 20, zIndex: 5}}>
        <MonoTag>MY SAUNA</MonoTag>
        <div style={{fontSize: 26, fontWeight: 800, marginTop: 4,
          color: SAUNA.text.primary, letterSpacing: -0.5}}>나</div>

        {/* Today card */}
        <div style={{marginTop: 18, padding:'20px 18px', borderRadius: 16,
          background: SAUNA.surface.card,
          border:`1px solid ${SAUNA.surface.hairlineStrong}`,
          display:'flex', alignItems:'center', gap: 16}}>
          <AnonAvatar size={56} accent={SAUNA.heat[300]}/>
          <div style={{flex: 1}}>
            <div style={{fontSize: 18, fontWeight: 800, color: SAUNA.heat[200],
              letterSpacing: -0.3}}>노곤한사슴</div>
            <div className="mono" style={{fontSize: 10,
              color: SAUNA.text.tertiary, letterSpacing: 1.5,
              marginTop: 2}}>TODAY · #4F29</div>
          </div>
          <div style={{fontSize: 11, color: SAUNA.text.tertiary,
            textAlign:'right', lineHeight: 1.45}}>
            내일 자정<br/>새 이름
          </div>
        </div>

        {/* Stats grid */}
        <div style={{marginTop: 14,
          display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10}}>
          <StatCell label="오늘 세션" value="2회"/>
          <StatCell label="오늘 앉은 시간" value="47분"/>
          <StatCell label="이번 주 세션" value="9회"/>
          <StatCell label="단골 방" value="일상" Ic={IcDaily}/>
        </div>

        {/* Retention message */}
        <div style={{marginTop: 14, padding:'14px 16px', borderRadius: 12,
          background:'rgba(20,8,2,0.45)',
          border:`1px solid ${SAUNA.surface.hairline}`,
          fontSize: 12, color: SAUNA.text.secondary,
          lineHeight: 1.6}}>
          <div style={{fontSize: 11, fontWeight: 700, color: SAUNA.heat[400],
            marginBottom: 4, letterSpacing: 1}}>※ 기록은 남지 않아요</div>
          뱉은 말도, 읽은 말도 저장하지 않습니다. 위 숫자는 "얼마나 앉아있었는지"만 기록.
        </div>
      </div>

      <TabBar active="me"/>
    </ScreenBase>
  );
}

function StatCell({ label, value, Ic }) {
  return (
    <div style={{padding:'14px 16px', borderRadius: 12,
      background:'rgba(20,8,2,0.55)',
      border:`1px solid ${SAUNA.surface.hairline}`}}>
      <div style={{fontSize: 11, color: SAUNA.text.tertiary}}>{label}</div>
      <div style={{fontSize: 18, fontWeight: 800, color: SAUNA.text.primary,
        marginTop: 4, letterSpacing: -0.3,
        display:'inline-flex', alignItems:'center', gap: 6}}>
        {value}
        {Ic && <span style={{color: SAUNA.heat[300]}}>
          <Ic size={16} color="currentColor"/></span>}
      </div>
    </div>
  );
}

// =======================================================================
// Settings
// =======================================================================
function ScreenSettings() {
  return (
    <ScreenBase bg={WOOD_DARK}>
      <div style={{position:'absolute', top: 60, left: 20, right: 20, zIndex: 5}}>
        <MonoTag>PREFERENCES</MonoTag>
        <div style={{fontSize: 26, fontWeight: 800, marginTop: 4,
          color: SAUNA.text.primary, letterSpacing: -0.5}}>설정</div>

        <SettingGroup title="알림">
          <SettingRow Ic={IcBell}     label="방 피크 알림"   toggle={true}/>
          <SettingRow Ic={IcMoon}     label="야간 모드"       value="22:00 ~ 07:00"/>
          <SettingRow Ic={IcVibrate}  label="진동"           toggle={true}/>
        </SettingGroup>

        <SettingGroup title="경험">
          <SettingRow Ic={IcContrast} label="다크 모드"       value="항상 켜짐"/>
          <SettingRow Ic={IcMotion}   label="모션 줄이기"     toggle={false}/>
          <SettingRow Ic={IcType}     label="폰트 크기"       value="중간"/>
        </SettingGroup>

        <SettingGroup title="계정">
          <SettingRow Ic={IcTrash}    label="데이터 삭제"     value="기록 없음" muted/>
          <SettingRow Ic={IcInfo}     label="Sauna란?"       value="v 0.1"/>
        </SettingGroup>
      </div>

      <TabBar active="set"/>
    </ScreenBase>
  );
}

function SettingGroup({ title, children }) {
  return (
    <div style={{marginTop: 22}}>
      <div className="mono" style={{fontSize: 10, color: SAUNA.heat[400],
        letterSpacing: 2, fontWeight: 600, marginBottom: 8, paddingLeft: 4}}>
        {title.toUpperCase()}
      </div>
      <div style={{borderRadius: 14, overflow:'hidden',
        background:'rgba(20,8,2,0.55)',
        border:`1px solid ${SAUNA.surface.hairline}`}}>
        {children}
      </div>
    </div>
  );
}

function SettingRow({ Ic, label, value, toggle, muted }) {
  return (
    <div style={{display:'flex', alignItems:'center',
      padding:'13px 14px', gap: 12,
      borderBottom:'1px solid rgba(255,180,110,0.08)',
    }}>
      <div style={{width: 22, display:'flex', justifyContent:'center',
        color: SAUNA.heat[300]}}>
        {Ic && <Ic size={18} color="currentColor"/>}
      </div>
      <div style={{flex: 1, fontSize: 14, color: SAUNA.text.primary}}>{label}</div>
      {toggle !== undefined && (
        <div style={{width: 44, height: 26, borderRadius: 13,
          background: toggle
            ? 'linear-gradient(180deg, #FFB060 0%, #E87020 100%)'
            : 'rgba(60,40,20,0.6)',
          position:'relative',
          boxShadow: toggle ? '0 0 10px rgba(255,150,70,0.4)' : 'none',
        }}>
          <div style={{position:'absolute', top: 2,
            left: toggle ? 20 : 2,
            width: 22, height: 22, borderRadius: 11, background:'#fff',
            transition:'left .2s',
            boxShadow:'0 2px 4px rgba(0,0,0,0.3)'}}/>
        </div>
      )}
      {value !== undefined && (
        <div style={{fontSize: 12,
          color: muted ? SAUNA.text.muted : SAUNA.text.secondary,
          display:'inline-flex', alignItems:'center', gap: 4}}>
          {value}
          <IcChevron size={14} color="currentColor"/>
        </div>
      )}
    </div>
  );
}

// =======================================================================
// Notification preview
// =======================================================================
function ScreenNotifPrefs() {
  return (
    <ScreenBase bg={WOOD_DARK}>
      <div style={{position:'absolute', top: 60, left: 20, right: 20, zIndex: 5}}>
        <button style={{background:'transparent', border:'none',
          color: SAUNA.heat[400], fontSize: 13, padding: 0, cursor:'pointer',
          fontFamily:"inherit",
          display:'inline-flex', alignItems:'center', gap: 4}}>
          <IcChevron size={14} color="currentColor" dir="left"/>
          설정
        </button>
        <div style={{fontSize: 26, fontWeight: 800, marginTop: 8,
          color: SAUNA.text.primary, letterSpacing: -0.5}}>알림</div>
        <div style={{fontSize: 12, color: SAUNA.text.tertiary,
          marginTop: 4, lineHeight: 1.55}}>
          방이 붐비는 순간 짧게 알려줍니다. 너무 자주 오지 않도록 조정.
        </div>

        {/* Preview notification */}
        <div style={{marginTop: 22}}>
          <div className="mono" style={{fontSize: 10, color: SAUNA.heat[400],
            letterSpacing: 2, marginBottom: 8, paddingLeft: 4}}>PREVIEW</div>
          <div style={{padding:'12px 14px', borderRadius: 14,
            background:'rgba(255,255,255,0.08)',
            backdropFilter:'blur(20px)',
            border:'1px solid rgba(255,255,255,0.1)',
            display:'flex', gap: 12, alignItems:'flex-start'}}>
            <div style={{width: 36, height: 36, borderRadius: 9,
              background:'linear-gradient(180deg, #FFB060, #8a3e14)',
              display:'flex', alignItems:'center', justifyContent:'center'}}>
              <IcSaunaMark size={22} color="#2a1000"/>
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display:'flex', justifyContent:'space-between',
                alignItems:'baseline'}}>
                <div style={{fontSize: 13, fontWeight: 700,
                  color: SAUNA.text.primary}}>Sauna</div>
                <div style={{fontSize: 10,
                  color: SAUNA.text.tertiary}}>지금</div>
              </div>
              <div style={{fontSize: 12.5, color:'rgba(255,230,200,0.9)',
                marginTop: 2, lineHeight: 1.45,
                display:'inline-flex', alignItems:'center', gap: 5,
                flexWrap:'wrap'}}>
                <span style={{color: SAUNA.room.stock.accent,
                  display:'inline-flex'}}>
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
          <SettingRow Ic={IcJob}   label="취준 방 피크" toggle={false}/>
        </SettingGroup>

        <SettingGroup title="빈도">
          <SettingRow Ic={IcClock} label="쿨다운"           value="최소 2시간"/>
          <SettingRow Ic={IcMoon}  label="야간 방해금지"   value="22:00 ~ 07:00"/>
        </SettingGroup>
      </div>

      <TabBar active="set"/>
    </ScreenBase>
  );
}

// =======================================================================
// Exports
// =======================================================================
Object.assign(window, {
  ScreenSplash,
  ScreenOnboard1, ScreenOnboard2, ScreenOnboard3,
  ScreenHome, ScreenEnter,
  ScreenRoom, ScreenRoomKeyboard,
  ScreenProfile, ScreenSettings, ScreenNotifPrefs,
});
