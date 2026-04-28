// =============================================================
// 황토방 엔트리 화면들: Splash / Onboarding 1-3 / Passkey 1-3
// =============================================================

const {
  JJIM, CLAY_BG, FLOOR_BG, ROOM_BG,
  ClayLamp, ClayFloor, ClayWall,
  JjimMonoTag, ClayButton, JjimHeader,
} = window;
const { PixelMascot } = window;
const {
  IcSaunaMark, IcSteam, IcDoor, IcArrowLeft, IcDice, IcRefresh,
  IcPerson, IcInfo, IcBell, IcChevron,
} = window;

// =============================================================
// 0. Splash
// =============================================================
function JjimSplash() {
  return (
    <ClayWall>
      <div style={{position:'absolute', inset:0, zIndex: 2,
        background:`radial-gradient(ellipse 70% 40% at 50% 50%, rgba(255,150,60,0.25), transparent 70%)`}}/>

      <div style={{position:'absolute', inset:0, zIndex: 5,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap: 20}}>
        {/* 황토 가마 형태 로고 */}
        <div style={{
          width: 96, height: 96, borderRadius: '50% 50% 18px 18px',
          background:'radial-gradient(ellipse at 50% 65%, #FFD68A 0%, #FF9050 35%, #C95830 75%, #5a2010 100%)',
          boxShadow:'0 0 50px rgba(255,140,60,0.55), inset 0 2px 0 rgba(255,255,255,0.25)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <IcSaunaMark size={52} color="#2a1000"/>
        </div>
        <div style={{
          fontSize: 34, fontWeight: 800, letterSpacing: -0.8,
          color: JJIM.text.primary,
          textShadow:'0 2px 14px rgba(255,150,60,0.45)',
        }}>Sauna</div>
        <div className="mono" style={{
          fontSize: 10, color: JJIM.accent.warm,
          letterSpacing: 3, fontWeight: 700,
        }}>땀 · 수다 · 휘발</div>

        {/* 콩이 픽셀 — 살짝 작게, 로고 아래 */}
        <div style={{marginTop: 18, imageRendering:'pixelated',
          filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.7))'}}>
          <PixelMascot pose="idle" tone="warm" size={16} scale={3}/>
        </div>
      </div>

      {/* 마룻바닥 살짝 */}
      <ClayFloor height={120}/>

      <div style={{position:'absolute', bottom: 38, left: 0, right: 0,
        textAlign:'center', color: JJIM.text.muted, fontSize: 11, zIndex: 6}}>
        v 0.1 · 익명 휘발성 대화
      </div>
    </ClayWall>
  );
}

// =============================================================
// 페이지네이션 도트
// =============================================================
function JjimPagination({ index, total = 3, bottom = 144 }) {
  return (
    <div style={{position:'absolute', bottom, left: 0, right: 0, zIndex: 15,
      display: 'flex', justifyContent: 'center', gap: 6}}>
      {Array.from({length: total}).map((_, i) => (
        <div key={i} style={{
          width: i === index ? 22 : 6, height: 6, borderRadius: 3,
          background: i === index ? JJIM.accent.primary : JJIM.text.dim,
          transition: 'width .3s',
          boxShadow: i === index ? `0 0 10px ${JJIM.accent.primary}` : 'none',
        }}/>
      ))}
    </div>
  );
}

// =============================================================
// Onboarding 1 — 환영 / 사우나가 뭔가
// =============================================================
function JjimOnboard1() {
  return (
    <ClayWall>
      {/* 천장 등 */}
      <ClayLamp top={88} right={32} size={0.8}/>
      <ClayLamp top={88} right={'auto'} style={{left: 32}}/>

      <div style={{position:'absolute', top: 100, left: 0, right: 0, zIndex: 5,
        textAlign: 'center', padding: '0 28px'}}>
        <JjimMonoTag>STEP 1 OF 3</JjimMonoTag>
        <div style={{fontSize: 30, fontWeight: 800, marginTop: 14,
          letterSpacing: -0.6, color: JJIM.text.primary,
          textShadow: '0 2px 8px rgba(50,15,0,0.85)'}}>
          여긴 황토방이야
        </div>
        <div style={{fontSize: 15, color: JJIM.text.secondary,
          marginTop: 18, lineHeight: 1.7,
          textShadow: '0 1px 3px rgba(0,0,0,0.6)'}}>
          뜨거운 황토 벽돌방에 앉아서<br/>
          얼굴 모르는 사람들이랑<br/>
          <b style={{color: JJIM.accent.soft}}>땀 흘리듯</b> 말을 뱉는 곳.
        </div>
      </div>

      {/* 콩이 — 졸기 자세, 마룻바닥 위 정중앙 */}
      <div style={{position:'absolute', bottom: 254, left: '50%',
        transform: 'translateX(-50%)', zIndex: 8,
        imageRendering: 'pixelated',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))'}}>
        <PixelMascot pose="doze" tone="warm" size={32} scale={5}/>
      </div>

      {/* 증기 (장식) */}
      <div style={{position:'absolute', bottom: 380, left: 0, right: 0,
        display:'flex', justifyContent:'center', gap: 18,
        opacity: 0.32, filter:'blur(0.5px)', zIndex: 6,
        color: JJIM.accent.soft}}>
        <IcSteam size={32} color="currentColor"/>
        <IcSteam size={48} color="currentColor"/>
        <IcSteam size={32} color="currentColor"/>
      </div>

      <ClayFloor height={210}/>

      <JjimPagination index={0} bottom={146}/>
      <div style={{position:'absolute', bottom: 58, left: 24, right: 24, zIndex: 16,
        display:'flex', gap: 10}}>
        <ClayButton primary={false} fullWidth={false}
          style={{flex: '0 0 96px'}}>건너뛰기</ClayButton>
        <ClayButton>다음</ClayButton>
      </div>
    </ClayWall>
  );
}

// =============================================================
// Onboarding 2 — 규칙 (휘발)
// =============================================================
function JjimOnboard2() {
  const rules = [
    { Ic: IcArrowLeft, t: '언제든 나가도 돼',
      d: '답답하면 그냥 뒤로. 시간 제한 없음.' },
    { Ic: IcPerson,    t: '이름은 매일 바뀌어',
      d: '자정마다 새 닉네임. 어제 너랑 안 이어짐.' },
    { Ic: IcSteam,     t: '메시지는 저장 안 돼',
      d: '올라오고, 떠다니고, 사라짐. 검색도 없음.' },
    { Ic: IcDoor,      t: '방은 3개부터',
      d: '일상 · 주식 · 취준. 시즌 방은 가끔 열림.' },
  ];
  return (
    <ClayWall>
      <ClayLamp top={88} right={32} size={0.8}/>

      <div style={{position:'absolute', top: 100, left: 24, right: 24, zIndex: 5}}>
        <div style={{textAlign: 'center'}}>
          <div style={{display:'flex', justifyContent:'center', marginBottom: 8,
            color: JJIM.accent.soft, opacity: 0.85}}>
            <IcSteam size={48} color="currentColor"/>
          </div>
          <JjimMonoTag>STEP 2 OF 3</JjimMonoTag>
          <div style={{fontSize: 26, fontWeight: 800, marginTop: 10,
            letterSpacing: -0.4, color: JJIM.text.primary,
            textShadow: '0 2px 8px rgba(50,15,0,0.85)'}}>
            말은 증기처럼 사라져
          </div>
        </div>

        <div style={{marginTop: 22, display:'flex', flexDirection:'column', gap: 10}}>
          {rules.map((r, i) => (
            <div key={i} style={{
              display:'flex', gap: 14, alignItems:'flex-start',
              padding:'14px 16px', borderRadius: 12,
              background: JJIM.surface.panel,
              border: `1px solid ${JJIM.surface.hairline}`,
              backdropFilter:'blur(8px)',
            }}>
              <div style={{marginTop: 2, color: JJIM.accent.soft}}>
                <r.Ic size={22} color="currentColor"/>
              </div>
              <div style={{flex: 1}}>
                <div style={{fontSize: 14, fontWeight: 700,
                  color: JJIM.text.primary}}>{r.t}</div>
                <div style={{fontSize: 12, color: JJIM.text.tertiary,
                  marginTop: 3, lineHeight: 1.55}}>{r.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ClayFloor height={150}/>

      <JjimPagination index={1} bottom={146}/>
      <div style={{position:'absolute', bottom: 58, left: 24, right: 24, zIndex: 16,
        display:'flex', gap: 10}}>
        <ClayButton primary={false} fullWidth={false}
          style={{flex:'0 0 86px'}}>이전</ClayButton>
        <ClayButton>다음</ClayButton>
      </div>
    </ClayWall>
  );
}

// =============================================================
// Onboarding 3 — 오늘의 닉네임 배정
// =============================================================
function JjimOnboard3() {
  return (
    <ClayWall>
      <ClayLamp top={88} right={32} size={0.8}/>

      <div style={{position:'absolute', top: 100, left: 24, right: 24,
        zIndex: 5, textAlign:'center'}}>
        <JjimMonoTag>STEP 3 OF 3</JjimMonoTag>
        <div style={{fontSize: 26, fontWeight: 800, marginTop: 10,
          letterSpacing: -0.4, color: JJIM.text.primary,
          textShadow: '0 2px 8px rgba(50,15,0,0.85)'}}>
          오늘의 너는
        </div>

        <div style={{
          marginTop: 28, padding:'28px 20px', borderRadius: 20,
          background: JJIM.surface.card,
          border: `1.5px solid ${JJIM.surface.hairlineStrong}`,
          boxShadow:'0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,210,150,0.18)',
        }}>
          {/* 콩이 (32x32) */}
          <div style={{display: 'flex', justifyContent: 'center',
            imageRendering: 'pixelated', marginBottom: 14,
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}}>
            <PixelMascot pose="idle" tone="warm" size={32} scale={4}/>
          </div>
          <div style={{fontSize: 26, fontWeight: 800, color: JJIM.accent.soft,
            letterSpacing: -0.4,
            textShadow: '0 0 22px rgba(255,180,90,0.55)'}}>
            노곤한사슴
          </div>
          <div className="mono" style={{fontSize: 11,
            color: JJIM.text.tertiary,
            marginTop: 4, letterSpacing: 1.5}}>#4F29</div>

          <div style={{marginTop: 18, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(20,8,2,0.5)',
            fontSize: 11.5, color: JJIM.text.secondary,
            lineHeight: 1.55}}>
            내일 자정이 되면 새 이름이 와. 오늘 무슨 말을 해도 내일의 너랑은 연결되지 않아.
          </div>
        </div>

        <button style={{
          marginTop: 14, background: 'transparent', border: 'none',
          color: JJIM.text.tertiary, fontSize: 12, cursor: 'pointer',
          fontFamily:"'Noto Sans KR', sans-serif",
          display:'inline-flex', alignItems:'center', gap: 6,
          padding:'4px 8px',
        }}>
          <IcDice size={14} color="currentColor"/>
          다시 뽑기 (오늘 1회)
        </button>
      </div>

      <ClayFloor height={130}/>

      <JjimPagination index={2} bottom={146}/>
      <div style={{position:'absolute', bottom: 58, left: 24, right: 24, zIndex: 16}}>
        <ClayButton iconLeft={<IcDoor size={18} color="#2a1000"/>}>
          다음 — 패스키 등록
        </ClayButton>
      </div>
    </ClayWall>
  );
}

// =============================================================
// 패스키 1 — 안내
// =============================================================
function JjimPasskey1() {
  return (
    <ClayWall>
      <ClayLamp top={88} right={32} size={0.8}/>

      <div style={{position:'absolute', top: 100, left: 24, right: 24, zIndex: 5}}>
        <JjimMonoTag>PASSKEY · 1 OF 3</JjimMonoTag>
        <div style={{fontSize: 26, fontWeight: 800, marginTop: 10,
          letterSpacing: -0.4, color: JJIM.text.primary,
          textShadow:'0 2px 8px rgba(50,15,0,0.85)'}}>
          비밀번호 없이<br/>이 폰 하나로
        </div>
        <div style={{fontSize: 13, color: JJIM.text.secondary,
          marginTop: 12, lineHeight: 1.65}}>
          이메일·전화번호 안 받아. 이 폰의 Face ID(혹은 Touch ID)가 너의 열쇠야.
          폰 바뀌면 다시 등록.
        </div>

        {/* 패스키 일러 */}
        <div style={{marginTop: 26, padding: '28px 20px', borderRadius: 20,
          background: JJIM.surface.card,
          border: `1.5px solid ${JJIM.surface.hairlineStrong}`,
          boxShadow:'0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,210,150,0.18)',
          textAlign: 'center',
        }}>
          {/* 키 + 페이스 SVG */}
          <div style={{position: 'relative', height: 120,
            display:'flex', alignItems:'center', justifyContent:'center'}}>
            <svg width="180" height="120" viewBox="0 0 180 120">
              <defs>
                <radialGradient id="pkglow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFB070" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#FF9050" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <ellipse cx="90" cy="60" rx="80" ry="50" fill="url(#pkglow)"/>
              {/* face circle */}
              <circle cx="58" cy="60" r="22" fill="none"
                stroke="#FFD4A0" strokeWidth="2"/>
              <circle cx="51" cy="56" r="1.6" fill="#FFD4A0"/>
              <circle cx="65" cy="56" r="1.6" fill="#FFD4A0"/>
              <path d="M51 66 Q58 70 65 66" fill="none"
                stroke="#FFD4A0" strokeWidth="1.6" strokeLinecap="round"/>
              {/* arrow */}
              <path d="M88 60 L102 60 M98 56 L102 60 L98 64" fill="none"
                stroke="#FF9050" strokeWidth="2" strokeLinecap="round"/>
              {/* key */}
              <g transform="translate(120,46)">
                <circle cx="10" cy="14" r="9" fill="none"
                  stroke="#FFB060" strokeWidth="2"/>
                <circle cx="10" cy="14" r="3" fill="#FFB060"/>
                <rect x="19" y="12" width="22" height="4" fill="#FFB060"/>
                <rect x="32" y="16" width="3" height="6" fill="#FFB060"/>
                <rect x="38" y="16" width="3" height="4" fill="#FFB060"/>
              </g>
            </svg>
          </div>
          <div style={{fontSize: 13, fontWeight: 600, color: JJIM.accent.soft,
            marginTop: 6}}>
            Face ID → Passkey
          </div>
        </div>

        {/* benefits */}
        <div style={{marginTop: 18, display:'flex', flexDirection:'column', gap: 8}}>
          {[
            ['비밀번호 없음', '외울 게 없어'],
            ['해킹 피싱 안전', '너 폰 안의 보안칩에서 처리'],
            ['1초 로그인', '얼굴/지문만'],
          ].map(([t, d]) => (
            <div key={t} style={{display:'flex', gap: 10, alignItems:'flex-start',
              padding:'10px 14px', borderRadius: 10,
              background: JJIM.surface.panelLight,
              border:`1px solid ${JJIM.surface.hairline}`}}>
              <div style={{width: 4, height: 4, borderRadius: '50%',
                background: JJIM.accent.warm, marginTop: 8}}/>
              <div style={{flex: 1}}>
                <div style={{fontSize: 13, fontWeight: 700,
                  color: JJIM.text.primary}}>{t}</div>
                <div style={{fontSize: 11.5, color: JJIM.text.tertiary,
                  marginTop: 1}}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{position:'absolute', bottom: 58, left: 24, right: 24, zIndex: 16}}>
        <ClayButton>패스키 만들기</ClayButton>
      </div>
    </ClayWall>
  );
}

// =============================================================
// 패스키 2 — 시스템 시트 (Face ID 인증 모달)
// =============================================================
function JjimPasskey2() {
  return (
    <ClayWall>
      {/* dim 배경 — 패스키 1 화면이 어둑하게 */}
      <div style={{position:'absolute', inset:0, zIndex: 3,
        background:'rgba(0,0,0,0.65)', backdropFilter:'blur(2px)'}}/>

      {/* 시스템 시트 */}
      <div style={{
        position:'absolute', left: 16, right: 16, bottom: 110, zIndex: 20,
        borderRadius: 20, padding: '22px 22px 18px',
        background: 'rgba(245,232,210,0.96)',
        backdropFilter: 'blur(40px) saturate(160%)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.6)',
        color: '#2a1408',
        fontFamily: '-apple-system, system-ui, sans-serif',
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10,
          paddingBottom: 14,
          borderBottom: '1px solid rgba(50,25,10,0.18)'}}>
          {/* 로고 */}
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(180deg, #FFB060 0%, #C95830 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 2px rgba(50,25,10,0.25)',
          }}>
            <IcSaunaMark size={18} color="#2a1000"/>
          </div>
          <div style={{flex: 1, fontSize: 14, fontWeight: 600,
            color: '#2a1408'}}>
            Sauna에 패스키 저장
          </div>
        </div>

        <div style={{paddingTop: 16}}>
          <div style={{fontSize: 13, color: 'rgba(40,20,10,0.75)',
            lineHeight: 1.5}}>
            <span style={{fontWeight: 700, color:'#2a1408'}}>noh.gonhan@sauna.local</span> 계정의 패스키가 iCloud 키체인에 저장됩니다.
          </div>
        </div>

        {/* Face ID 시각 */}
        <div style={{
          marginTop: 22, display:'flex', flexDirection:'column',
          alignItems:'center', gap: 8,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 14,
            border: '2.5px solid #2a1408',
            display:'flex', alignItems:'center', justifyContent:'center',
            position: 'relative',
          }}>
            <svg width="38" height="38" viewBox="0 0 38 38">
              <circle cx="14" cy="14" r="1.5" fill="#2a1408"/>
              <circle cx="24" cy="14" r="1.5" fill="#2a1408"/>
              <path d="M14 24 Q19 28 24 24" stroke="#2a1408" strokeWidth="1.6"
                fill="none" strokeLinecap="round"/>
              <path d="M19 14 V22" stroke="#2a1408" strokeWidth="1.6"
                strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{fontSize: 13, fontWeight: 600, color: '#2a1408'}}>
            Face ID로 계속
          </div>
          <div style={{fontSize: 11, color: 'rgba(40,20,10,0.55)',
            marginTop: -2}}>
            얼굴을 화면에 보여주세요
          </div>
        </div>

        <button style={{
          width: '100%', marginTop: 22, height: 44, borderRadius: 12,
          background: 'transparent', border: 'none',
          color: '#7a4020', fontSize: 14, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>취소</button>
      </div>

      {/* 시스템 시트 핸들 */}
      <div style={{position:'absolute', left: '50%', bottom: 100,
        transform:'translateX(-50%)', zIndex: 21,
        width: 36, height: 5, borderRadius: 3,
        background: 'rgba(40,20,10,0.18)'}}/>
    </ClayWall>
  );
}

// =============================================================
// 패스키 3 — 완료
// =============================================================
function JjimPasskey3() {
  return (
    <ClayWall>
      <div style={{position:'absolute', inset:0, zIndex: 2,
        background:`radial-gradient(ellipse 80% 50% at 50% 40%, rgba(255,160,80,0.32), transparent 70%)`}}/>

      <div style={{position:'absolute', top: 0, bottom: 0, left: 0, right: 0,
        zIndex: 5, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', padding: '0 32px',
        textAlign:'center'}}>

        {/* 체크 + 가마 */}
        <div style={{
          width: 100, height: 100, borderRadius: '50% 50% 18px 18px',
          background:'radial-gradient(ellipse at 50% 65%, #FFD68A 0%, #FF9050 35%, #C95830 75%, #5a2010 100%)',
          boxShadow:'0 0 50px rgba(255,140,60,0.55), inset 0 2px 0 rgba(255,255,255,0.25)',
          display:'flex', alignItems:'center', justifyContent:'center',
          position:'relative',
        }}>
          <svg width="46" height="46" viewBox="0 0 46 46">
            <path d="M10 24 L20 32 L36 14" stroke="#2a1000"
              strokeWidth="4.5" fill="none"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <JjimMonoTag color={JJIM.accent.warm}>PASSKEY READY</JjimMonoTag>

        <div style={{fontSize: 28, fontWeight: 800, marginTop: 10,
          letterSpacing: -0.5, color: JJIM.text.primary,
          textShadow: '0 2px 12px rgba(255,150,60,0.4)'}}>
          이제 들어갈 준비 끝
        </div>

        <div style={{fontSize: 14, color: JJIM.text.secondary,
          marginTop: 14, lineHeight: 1.6, maxWidth: 280}}>
          닉네임 <b style={{color: JJIM.accent.soft}}>노곤한사슴</b>으로<br/>
          오늘 자정까지 활동해.
        </div>

        {/* 콩이 환영 */}
        <div style={{marginTop: 22, imageRendering:'pixelated',
          filter:'drop-shadow(0 3px 6px rgba(0,0,0,0.6))'}}>
          <PixelMascot pose="peek" tone="warm" size={16} scale={4}/>
        </div>
      </div>

      <ClayFloor height={130}/>

      <div style={{position:'absolute', bottom: 58, left: 24, right: 24, zIndex: 16}}>
        <ClayButton iconLeft={<IcDoor size={18} color="#2a1000"/>}>
          황토방 들어가기
        </ClayButton>
      </div>
    </ClayWall>
  );
}

Object.assign(window, {
  JjimSplash,
  JjimOnboard1, JjimOnboard2, JjimOnboard3,
  JjimPasskey1, JjimPasskey2, JjimPasskey3,
  JjimPagination,
});
