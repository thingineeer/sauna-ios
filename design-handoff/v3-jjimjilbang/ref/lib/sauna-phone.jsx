// SaunaPhone — iPhone 15 Pro (393×852) bezel with proper iOS keyboard.
// Keyboard slides in from bottom, pushes/reveals at a fixed height (291px
// for Korean). Status bar + Dynamic Island pinned. Home indicator always
// on. This is the single device frame for the whole Sauna app.

function SaunaPhone({ children, keyboardUp = false }) {
  const W = 393, H = 852;
  const PAD = 10;
  return (
    <div style={{
      width: W + PAD*2, height: H + PAD*2, padding: PAD, borderRadius: 56,
      background: 'linear-gradient(145deg, #1a1a22 0%, #0b0b10 100%)',
      boxShadow: '0 24px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
    }}>
      <div style={{
        width: W, height: H, borderRadius: 46, overflow: 'hidden',
        position: 'relative', background: '#0a0a0f',
      }}>
        {children}
        {keyboardUp && <SaunaKeyboard/>}

        {/* Dynamic Island */}
        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 124, height: 36, borderRadius: 20, background: '#000', zIndex: 500,
        }}/>
        {/* Status bar */}
        <div style={{
          position: 'absolute', top: 18, left: 0, right: 0, zIndex: 500,
          display: 'flex', justifyContent: 'space-between',
          padding: '0 34px', color: '#fff', fontSize: 15, fontWeight: 600,
          fontFamily: '"SF Pro Display", -apple-system, system-ui, sans-serif',
          pointerEvents: 'none',
        }}>
          <span>9:41</span>
          <span style={{display:'flex',alignItems:'center',gap:6}}>
            <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
              <rect x="0" y="3" width="3" height="5" rx="0.6" fill="white"/>
              <rect x="4.5" y="2" width="3" height="6" rx="0.6" fill="white"/>
              <rect x="9" y="1" width="3" height="7" rx="0.6" fill="white"/>
              <rect x="13.5" y="0" width="3" height="8" rx="0.6" fill="white"/>
            </svg>
            <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
              <rect x="0.5" y="0.5" width="13" height="9" rx="2" stroke="white" strokeOpacity="0.5"/>
              <rect x="2" y="2" width="10" height="6" rx="0.8" fill="white"/>
              <rect x="14.5" y="3" width="1.5" height="3.5" rx="0.5" fill="white" fillOpacity="0.4"/>
            </svg>
          </span>
        </div>
        {/* Home indicator */}
        <div style={{
          position:'absolute', bottom:8, left:0, right:0,
          display:'flex', justifyContent:'center', zIndex: 501,
          pointerEvents:'none',
        }}>
          <div style={{width:134, height:5, borderRadius:3,
            background:'rgba(255,255,255,0.85)'}}/>
        </div>
      </div>
    </div>
  );
}

// iOS Korean (한) keyboard — 291px total (iPhone 15 Pro standard)
function SaunaKeyboard() {
  const row1 = ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'];
  const row2 = ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'];
  const row3 = ['ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'];
  const key = (label, w, modifier=false) => (
    <div style={{
      width: w, height: 42, borderRadius: 5,
      background: modifier ? '#3a3a45' : '#545460',
      boxShadow: '0 1px 0 rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 17, fontWeight: 400,
      fontFamily: "'Noto Sans KR', -apple-system, sans-serif",
    }}>{label}</div>
  );
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 291,
      boxSizing: 'border-box',
      background: 'linear-gradient(180deg, #2a2a33 0%, #1d1d25 100%)',
      zIndex: 450,
      padding: '8px 3px 30px',
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      {/* Row 1 — 10 keys full width */}
      <div style={{display:'flex', gap:5, justifyContent:'center', marginTop:4}}>
        {row1.map(k => (
          <div key={k} style={{flex:1, height:42, borderRadius:5,
            background:'#545460', boxShadow:'0 1px 0 rgba(0,0,0,0.5)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontSize:17}}>{k}</div>
        ))}
      </div>
      {/* Row 2 — 9 keys inset */}
      <div style={{display:'flex', gap:5, justifyContent:'center',
        padding:'0 21px', marginTop:10}}>
        {row2.map(k => (
          <div key={k} style={{flex:1, height:42, borderRadius:5,
            background:'#545460', boxShadow:'0 1px 0 rgba(0,0,0,0.5)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontSize:17}}>{k}</div>
        ))}
      </div>
      {/* Row 3 — shift + 7 keys + delete */}
      <div style={{display:'flex', gap:5, justifyContent:'center', marginTop:10}}>
        <div style={{width:42, height:42, borderRadius:5, background:'#3a3a45',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontSize:15}}>⇧</div>
        {row3.map(k => (
          <div key={k} style={{flex:1, height:42, borderRadius:5,
            background:'#545460', boxShadow:'0 1px 0 rgba(0,0,0,0.5)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', fontSize:17}}>{k}</div>
        ))}
        <div style={{width:42, height:42, borderRadius:5, background:'#3a3a45',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontSize:15}}>⌫</div>
      </div>
      {/* Row 4 — control row */}
      <div style={{display:'flex', gap:5, marginTop:10, padding:'0 3px'}}>
        <div style={{width:80, height:42, borderRadius:5, background:'#3a3a45',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff', fontSize:14, fontWeight:500}}>123</div>
        <div style={{width:42, height:42, borderRadius:5, background:'#3a3a45',
          display:'flex', alignItems:'center', justifyContent:'center',
          color:'#fff'}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <path d="M3 12h18"/>
            <path d="M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>
          </svg>
        </div>
        <div style={{flex:1, height:42, borderRadius:5, background:'#545460',
          boxShadow:'0 1px 0 rgba(0,0,0,0.5)'}}/>
        <div style={{width:80, height:42, borderRadius:5,
          background:'linear-gradient(180deg, #FFB060 0%, #E87020 100%)',
          color:'#2a1000', fontSize:14,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:700,
          fontFamily:"'Noto Sans KR', sans-serif"}}>전송</div>
      </div>
    </div>
  );
}

Object.assign(window, { SaunaPhone, SaunaKeyboard });
