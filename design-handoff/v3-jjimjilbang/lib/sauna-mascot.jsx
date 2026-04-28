// SaunaMascots — 힐링 캐릭터 (수건 머리띠 두른 동글동글)
// 사진 레퍼: 머리에 수건 묶은 동그란 회색 캐릭터, 욕탕에 잠긴 모습
// 5가지 포즈: soak(잠김), idle(앉기), sweat(땀), bliss(눈감기), peek(빠끔)

function MoongMoong({ size = 80, pose = 'idle', tone = 'warm' }) {
  // tone: warm = 사우나 따뜻한 톤, cool = 욕탕 청록 톤
  const body = '#D8D2CA';
  const bodyShadow = '#A8A29A';
  const towel = tone === 'cool' ? '#E8DCC4' : '#F2E4C8';
  const towelStripe = tone === 'cool' ? '#7BB8C4' : '#E87020';
  const blush = tone === 'cool' ? '#F4A8A0' : '#F09870';

  // Eyes by pose
  const eyesClosed = pose === 'bliss' || pose === 'soak' || pose === 'sweat';
  const peeking = pose === 'peek';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display:'block'}}>
      <defs>
        <radialGradient id={`mm-body-${tone}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F0EAE0"/>
          <stop offset="60%" stopColor={body}/>
          <stop offset="100%" stopColor={bodyShadow}/>
        </radialGradient>
        <radialGradient id={`mm-towel-${tone}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFF6E6"/>
          <stop offset="100%" stopColor={towel}/>
        </radialGradient>
      </defs>

      {/* shadow */}
      <ellipse cx="50" cy="88" rx="26" ry="3" fill="rgba(0,0,0,0.2)"/>

      {/* body — 동글동글 */}
      <ellipse cx="50" cy="62" rx="30" ry="26" fill={`url(#mm-body-${tone})`}
        stroke="#5a544c" strokeWidth="1.6"/>

      {/* arms — 짧은 양옆 */}
      <ellipse cx="22" cy="64" rx="6" ry="5" fill={`url(#mm-body-${tone})`}
        stroke="#5a544c" strokeWidth="1.4"/>
      <ellipse cx="78" cy="64" rx="6" ry="5" fill={`url(#mm-body-${tone})`}
        stroke="#5a544c" strokeWidth="1.4"/>

      {/* 머리 수건 — 묶은 매듭 */}
      {/* 수건 본체 */}
      <path d="M 24 38 Q 24 28, 50 26 Q 76 28, 76 38 L 76 44 Q 50 50, 24 44 Z"
        fill={`url(#mm-towel-${tone})`} stroke="#5a544c" strokeWidth="1.5"/>
      {/* 수건 스트라이프 */}
      <path d="M 26 41 Q 50 46, 74 41" stroke={towelStripe} strokeWidth="1.5" fill="none" opacity="0.55"/>
      {/* 매듭 — 위 가운데 */}
      <ellipse cx="50" cy="22" rx="6" ry="5" fill={`url(#mm-towel-${tone})`}
        stroke="#5a544c" strokeWidth="1.4"/>
      <path d="M 47 20 Q 50 17, 53 20" stroke="#5a544c" strokeWidth="1" fill="none"/>
      {/* 수건 끝자락 양쪽 */}
      <path d="M 44 22 L 41 16 L 47 19 Z" fill={`url(#mm-towel-${tone})`}
        stroke="#5a544c" strokeWidth="1.2"/>
      <path d="M 56 22 L 59 16 L 53 19 Z" fill={`url(#mm-towel-${tone})`}
        stroke="#5a544c" strokeWidth="1.2"/>

      {/* 볼 홍조 */}
      <ellipse cx="34" cy="62" rx="5" ry="3.2" fill={blush} opacity="0.55"/>
      <ellipse cx="66" cy="62" rx="5" ry="3.2" fill={blush} opacity="0.55"/>

      {/* 눈 */}
      {eyesClosed ? (
        <>
          <path d="M 40 58 Q 43 55, 46 58" stroke="#3a342c" strokeWidth="1.8"
            fill="none" strokeLinecap="round"/>
          <path d="M 54 58 Q 57 55, 60 58" stroke="#3a342c" strokeWidth="1.8"
            fill="none" strokeLinecap="round"/>
        </>
      ) : peeking ? (
        <>
          <path d="M 40 58 Q 43 60, 46 58" stroke="#3a342c" strokeWidth="1.8"
            fill="none" strokeLinecap="round"/>
          <path d="M 54 58 Q 57 60, 60 58" stroke="#3a342c" strokeWidth="1.8"
            fill="none" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <ellipse cx="43" cy="58" rx="2" ry="2.4" fill="#3a342c"/>
          <ellipse cx="57" cy="58" rx="2" ry="2.4" fill="#3a342c"/>
          <circle cx="43.5" cy="57" r="0.6" fill="#fff"/>
          <circle cx="57.5" cy="57" r="0.6" fill="#fff"/>
        </>
      )}

      {/* 입 — 작은 만족 */}
      <path d="M 47 67 Q 50 70, 53 67" stroke="#3a342c" strokeWidth="1.6"
        fill="none" strokeLinecap="round"/>

      {/* 땀방울 — sweat 포즈 */}
      {pose === 'sweat' && (
        <g>
          <path d="M 78 38 Q 80 42, 78 44 Q 76 42, 78 38" fill="#9BD8E8"
            stroke="#4A8AA0" strokeWidth="0.8"/>
          <circle cx="78.5" cy="40" r="0.6" fill="#FFFFFF" opacity="0.9"/>
        </g>
      )}

      {/* zZz — bliss 포즈 */}
      {pose === 'bliss' && (
        <g fill="#7a7268" fontFamily="'Noto Sans KR', sans-serif" fontWeight="700">
          <text x="74" y="32" fontSize="10" opacity="0.7">z</text>
          <text x="80" y="26" fontSize="8" opacity="0.5">z</text>
        </g>
      )}

      {/* soak — 물에 잠긴 라인 */}
      {pose === 'soak' && (
        <>
          <path d="M 16 72 Q 30 70, 50 72 Q 70 74, 84 72"
            stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none"/>
          <path d="M 12 76 Q 30 74, 50 76 Q 70 78, 88 76"
            stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none"/>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// CharacterShowcase — 캐릭터 명세 (디자인 스펙 카드)
// ─────────────────────────────────────────────────────────────
function CharacterShowcase() {
  const poses = [
    { id: 'idle',   name: '앉음',     desc: '기본. 채팅방 한쪽에 가만히' },
    { id: 'bliss',  name: '나른함',  desc: '메시지 없을 때 / 야간 모드' },
    { id: 'sweat',  name: '땀뻘뻘', desc: '방이 packed일 때' },
    { id: 'soak',   name: '잠김',     desc: 'Bath Hall 전용 포즈' },
    { id: 'peek',   name: '빠끔',     desc: '새 메시지 / 알림' },
  ];

  return (
    <div style={{
      width: 880, padding: '28px 28px',
      background: 'linear-gradient(180deg, #f0eee9 0%, #e8e3d8 100%)',
      borderRadius: 16, border: '1px solid rgba(60,40,20,0.12)',
      fontFamily: "'Noto Sans KR', -apple-system, sans-serif",
    }}>
      <div className="mono" style={{fontSize:10, color:'#c96442',
        letterSpacing:2.5, fontWeight:700}}>SAUNA · MASCOT</div>
      <div style={{fontSize:24, fontWeight:800, color:'#3a2a1a',
        letterSpacing:-0.5, marginTop:6}}>몽몽 — 사우나 힐링 메이트</div>
      <div style={{fontSize:13, color:'rgba(40,30,20,0.7)', marginTop:6,
        lineHeight: 1.6, maxWidth: 640}}>
        머리에 수건 두르고 사우나에 같이 앉아있는 캐릭터. 5가지 포즈로 방 분위기에 반응.
        Sauna에선 따뜻한 톤, Bath Hall에선 시원한 톤.
      </div>

      <div style={{marginTop:24, display:'grid',
        gridTemplateColumns:'repeat(5, 1fr)', gap:12}}>
        {poses.map(p => (
          <div key={p.id} style={{
            background:'#fff', borderRadius:12, padding:'14px 12px 12px',
            border:'1px solid rgba(60,40,20,0.08)',
            boxShadow:'0 2px 6px rgba(60,40,20,0.06)',
          }}>
            <div style={{display:'flex', justifyContent:'center',
              padding:'12px 0', borderRadius:8,
              background:'linear-gradient(180deg, #F5EBD8, #E5D6B8)',
              marginBottom:10}}>
              <MoongMoong size={72} pose={p.id} tone="warm"/>
            </div>
            <div style={{fontSize:13, fontWeight:700, color:'#3a2a1a'}}>{p.name}</div>
            <div style={{fontSize:11, color:'rgba(40,30,20,0.6)',
              marginTop:2, lineHeight:1.4}}>{p.desc}</div>
          </div>
        ))}
      </div>

      {/* tone variation */}
      <div style={{marginTop:22, display:'grid',
        gridTemplateColumns:'1fr 1fr', gap:12}}>
        <div style={{background:'linear-gradient(180deg, #6a3a18, #3a1e0c)',
          borderRadius:12, padding:'18px 16px', display:'flex',
          alignItems:'center', gap:14, border:'1px solid rgba(255,200,140,0.25)'}}>
          <MoongMoong size={64} pose="idle" tone="warm"/>
          <div>
            <div style={{fontSize:12, color:'#FFD4A0', fontWeight:700}}>WARM</div>
            <div style={{fontSize:11, color:'rgba(255,220,180,0.7)',
              marginTop:2, lineHeight:1.4}}>
              사우나 (Cedar / Modern Stone)<br/>
              스트라이프: 주황
            </div>
          </div>
        </div>
        <div style={{background:'linear-gradient(180deg, #2a4a48, #0f2530)',
          borderRadius:12, padding:'18px 16px', display:'flex',
          alignItems:'center', gap:14, border:'1px solid rgba(180,220,200,0.25)'}}>
          <MoongMoong size={64} pose="soak" tone="cool"/>
          <div>
            <div style={{fontSize:12, color:'#A8DCE8', fontWeight:700}}>COOL</div>
            <div style={{fontSize:11, color:'rgba(200,230,240,0.7)',
              marginTop:2, lineHeight:1.4}}>
              Bath Hall · 욕탕 잠김<br/>
              스트라이프: 청록
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 채팅방에 캐릭터 얹은 wrapper
// ─────────────────────────────────────────────────────────────
function ChatRoomCedarGroveWithMascot(props) {
  return (
    <div style={{position:'relative', width: props.width || 393, height: props.height || 852}}>
      <window.ChatRoomCedarGrove {...props}/>
      {/* 좌하단 */}
      <div style={{position:'absolute', bottom: 96, left: 14, zIndex: 9,
        pointerEvents: 'none',
        filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'}}>
        <MoongMoong size={86} pose="bliss" tone="warm"/>
      </div>
    </div>
  );
}

function ChatRoomModernStoneWithMascot(props) {
  return (
    <div style={{position:'relative', width: props.width || 393, height: props.height || 852}}>
      <window.ChatRoomModernStone {...props}/>
      {/* 우하단, heater rocks 옆 안 겹치게 */}
      <div style={{position:'absolute', bottom: 100, right: 18, zIndex: 9,
        pointerEvents: 'none',
        filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'}}>
        <MoongMoong size={78} pose="idle" tone="warm"/>
      </div>
    </div>
  );
}

function ChatRoomBathHallWithMascot(props) {
  return (
    <div style={{position:'relative', width: props.width || 393, height: props.height || 852}}>
      <window.ChatRoomBathHall {...props}/>
      {/* 풀에 잠긴 모습 — 풀 영역 안 */}
      <div style={{position:'absolute', bottom: 180, left: '50%',
        transform:'translateX(-50%)', zIndex: 9,
        pointerEvents: 'none',
        filter:'drop-shadow(0 4px 10px rgba(0,0,0,0.55))'}}>
        <MoongMoong size={90} pose="soak" tone="cool"/>
      </div>
    </div>
  );
}

Object.assign(window, {
  MoongMoong, CharacterShowcase,
  ChatRoomCedarGroveWithMascot,
  ChatRoomModernStoneWithMascot,
  ChatRoomBathHallWithMascot,
});
