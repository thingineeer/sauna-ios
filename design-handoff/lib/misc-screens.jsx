// Miscellaneous static screens: S02 onboarding, S14 NPC, and the
// focused WaveFlow showcase (C12 deep-dive).

// S02 — "회원가입 없이, 익명으로"
function OnboardingScreen({ variant = 'glass', width = 390, height = 844 }) {
  return (
    <div className="pod-app" style={{
      width, height, position: 'relative',
      background: TOKENS.bg.base, overflow: 'hidden',
      fontFamily: "'Space Grotesk', 'Noto Sans KR', sans-serif",
    }}>
      <RoomAmbience accent="#00FFB3"/>
      <div style={{height: 54}}/>
      <div style={{
        padding: '16px 20px', display: 'flex', justifyContent: 'flex-end',
      }}>
        <button style={{
          background: 'none', border: 'none', color: TOKENS.text.secondary,
          fontSize: 14, cursor: 'pointer', fontFamily: "'Noto Sans KR', sans-serif",
        }}>건너뛰기</button>
      </div>

      {/* Paired pods — visually opening apart */}
      <div style={{
        position: 'absolute', top: 200, left: 0, right: 0,
        height: 220, display: 'flex', justifyContent: 'center',
        alignItems: 'center', gap: 24, zIndex: 2,
      }}>
        <div style={{transform: 'translateX(10px) rotate(-8deg)'}}>
          <EarbudPod side="L" variant={variant} size={130} roomAccent="#00FFB3" state="active"/>
        </div>
        <div style={{transform: 'translateX(-10px) rotate(8deg)'}}>
          <EarbudPod side="R" variant={variant} size={130} roomAccent="#00FFB3" state="active"/>
        </div>
      </div>

      {/* Title + subtitle */}
      <div style={{
        position: 'absolute', top: 500, left: 0, right: 0,
        padding: '0 40px', textAlign: 'center', zIndex: 3,
      }}>
        <div className="kor" style={{
          fontSize: 30, fontWeight: 700, lineHeight: 1.25,
          color: TOKENS.text.primary,
          letterSpacing: -0.5, marginBottom: 14,
        }}>회원가입 없이,<br/>익명으로.</div>
        <div className="kor" style={{
          fontSize: 15, color: TOKENS.text.secondary,
          lineHeight: 1.55,
        }}>지금 바로 대화에 뛰어들어요.</div>
      </div>

      {/* Page dots */}
      <div style={{
        position: 'absolute', bottom: 140, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 7,
      }}>
        <div style={{width: 18, height: 4, borderRadius: 2, background: '#00FFB3'}}/>
        <div style={{width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)'}}/>
        <div style={{width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)'}}/>
      </div>

      {/* CTA */}
      <div style={{position: 'absolute', bottom: 60, left: 20, right: 20}}>
        <button style={{
          width: '100%', height: 54, borderRadius: 27,
          background: '#00FFB3', border: 'none',
          color: '#0a0a0f', fontSize: 16, fontWeight: 600,
          cursor: 'pointer', boxShadow: '0 0 24px rgba(0,255,179,0.3)',
          fontFamily: "'Noto Sans KR', sans-serif",
        }}>다음</button>
      </div>

      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{width: 134, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.5)'}}/>
      </div>
    </div>
  );
}

// ─── Static wave-motion showcase (C12 timeline) ──────────────────
function WaveShowcase({ variant = 'glass', width = 390, height = 844 }) {
  const [frame, setFrame] = React.useState(0); // 0..6 discrete stops
  const accent = '#00FFB3';
  // Show a specific moment as a snapshot
  const stops = [
    { label: '0ms · 발생',    p: 0.02 },
    { label: '300ms · 가속',  p: 0.17 },
    { label: '600ms · 중앙 · 최대 진폭', p: 0.38 },
    { label: '1200ms · 감쇠', p: 0.70 },
    { label: '1700ms · 흡수', p: 0.92 },
  ];

  return (
    <div className="pod-app" style={{
      width, height, background: TOKENS.bg.base, position: 'relative',
      overflow: 'hidden',
    }}>
      <RoomAmbience accent={accent}/>
      <div style={{height: 54}}/>
      <div style={{padding: '16px 20px 24px'}}>
        <div style={{
          fontSize: 11, letterSpacing: 1.5, color: accent,
          fontFamily: 'JetBrains Mono, monospace', fontWeight: 500,
        }}>C12 · SIGNATURE MOTION</div>
        <div className="kor" style={{fontSize: 22, fontWeight: 600, marginTop: 4}}>
          L → R 파동 타임라인
        </div>
      </div>

      {stops.map((s, i) => (
        <div key={i} style={{
          padding: '18px 20px',
          borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10}}>
            <div style={{
              width: 4, height: 4, borderRadius: '50%', background: accent,
              boxShadow: `0 0 6px ${accent}`,
            }}/>
            <div className="mono" style={{fontSize: 11, color: TOKENS.text.secondary}}>{s.label}</div>
          </div>
          <div style={{
            position: 'relative', height: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* mini pods */}
            <div style={{position: 'absolute', left: 8}}>
              <EarbudPod side="L" variant={variant} size={50} roomAccent={accent} state="active"/>
            </div>
            <div style={{position: 'absolute', right: 8}}>
              <EarbudPod side="R" variant={variant} size={50} roomAccent={accent} state={s.p > 0.85 ? 'active' : 'idle'}/>
            </div>
            {/* wave snapshot */}
            <WaveSnapshot phase={s.p} accent={accent} width={width - 80} height={80}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function WaveSnapshot({ phase, accent, width, height }) {
  const env = phase < 0.4 ? phase / 0.4 : phase < 0.75 ? 1 : 1 - (phase - 0.75) / 0.25;
  const amp = 12 * env;
  const steps = 60;
  const path = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = height / 2 + Math.sin((i / steps) * Math.PI * 3 + phase * Math.PI * 4) * amp;
    path.push((i === 0 ? 'M' : 'L') + x + ',' + y);
  }
  return (
    <svg width={width} height={height} style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`ws-${phase}`} x1="0%" x2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0"/>
          <stop offset={`${Math.max(0, phase * 100 - 30)}%`} stopColor={accent} stopOpacity="0"/>
          <stop offset={`${phase * 100}%`} stopColor={accent} stopOpacity="1"/>
          <stop offset={`${Math.min(100, phase * 100 + 30)}%`} stopColor={accent} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={path.join(' ')}
        stroke={`url(#ws-${phase})`}
        strokeWidth="2.5" fill="none"
        strokeDasharray="3 4" strokeLinecap="round"
        style={{filter: `drop-shadow(0 0 4px ${accent})`}}/>
      {[0, -0.08, -0.16, -0.24].map((o, i) => {
        const p = Math.max(0, Math.min(1, phase + o));
        const x = p * width;
        const y = height / 2 + Math.sin(p * Math.PI * 3 + phase * Math.PI * 4) * amp;
        const op = (1 - Math.abs(o) * 2) * env;
        return <circle key={i} cx={x} cy={y} r={3 - i * 0.4} fill={accent} opacity={Math.max(0, op)} style={{filter: `drop-shadow(0 0 3px ${accent})`}}/>;
      })}
    </svg>
  );
}

Object.assign(window, { OnboardingScreen, WaveShowcase, WaveSnapshot });
