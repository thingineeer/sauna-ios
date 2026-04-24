// EarbudPod — original earbud-inspired orb. Three visual variants share
// the same footprint so they can be swapped in the tweaks panel.
//
// Variants:
//   'glass' - stylized glass orb with stem, subtle highlights
//   'neon'  - pure abstract circle with heavy sound-wave rings (sound-is-visible)
//   'hw'    - hardware-inspired CSS 3D-ish render
//
// Props:
//   side: 'L' | 'R'  (mirrors stem direction)
//   variant: one of above
//   roomAccent: hex color
//   state: 'idle' | 'active' | 'appearing' | 'disappearing' | 'reacting' | 'npc'
//   size: px for overall container width
//   reduceMotion: bool

function EarbudPod({ side = 'L', variant = 'glass', roomAccent = '#00FFB3',
                    state = 'idle', size = 150, reduceMotion = false,
                    children, onTap, onLongPress }) {
  const pressRef = React.useRef(null);
  const didLong = React.useRef(false);

  const startPress = (e) => {
    didLong.current = false;
    pressRef.current = setTimeout(() => {
      didLong.current = true;
      onLongPress && onLongPress(e);
    }, 400);
  };
  const endPress = (e) => {
    clearTimeout(pressRef.current);
    if (!didLong.current && onTap) onTap(e);
  };
  const cancelPress = () => clearTimeout(pressRef.current);

  const active = state === 'active' || state === 'appearing' || state === 'npc';
  const ring = state === 'npc' ? TOKENS.npc : roomAccent;

  const breathAnim = reduceMotion
    ? 'none'
    : active ? 'pod-breath-active 2.8s ease-in-out infinite'
             : 'pod-breath 2.4s ease-in-out infinite';

  return (
    <div
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      style={{
        position: 'relative',
        width: size, height: size * 1.32,
        cursor: onTap ? 'pointer' : 'default',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        animation: breathAnim,
        willChange: 'transform',
      }}>
        {variant === 'glass' && <GlassPod side={side} size={size} active={active} accent={ring} state={state} />}
        {variant === 'neon'  && <NeonPod  side={side} size={size} active={active} accent={ring} state={state} reduceMotion={reduceMotion} />}
        {variant === 'hw'    && <HwPod    side={side} size={size} active={active} accent={ring} state={state} />}
      </div>

      {/* message content layer — absolute, unaffected by breath scale */}
      {children && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: size, height: size,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: size * 0.12, boxSizing: 'border-box',
          pointerEvents: 'none', zIndex: 3,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Variant A: glass orb with stem ────────────────────────────────
function GlassPod({ side, size, active, accent, state }) {
  const isL = side === 'L';
  const tilt = isL ? -4 : 4;
  const stemW = size * 0.22;
  const stemH = size * 0.66;
  const glow = active ? `0 0 40px ${accent}66, 0 0 80px ${accent}33, 0 8px 40px ${accent}55` : '0 4px 24px rgba(0,0,0,0.45)';

  return (
    <div style={{
      position: 'absolute', inset: 0,
      transform: `rotate(${tilt}deg)`,
      transformOrigin: '50% 60%',
    }}>
      {/* accent glow halo (activates only when active) */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: size, height: size,
        borderRadius: '50%',
        background: active ? `radial-gradient(circle at 50% 50%, ${accent}55 0%, ${accent}22 35%, transparent 70%)` : 'transparent',
        transition: 'background 260ms cubic-bezier(0.33,1,0.68,1)',
        filter: 'blur(2px)',
        zIndex: 0,
      }}/>

      {/* stem (behind orb) */}
      <div style={{
        position: 'absolute',
        top: size * 0.66,
        left: `calc(50% - ${stemW / 2}px)`,
        width: stemW, height: stemH,
        borderRadius: stemW,
        background: 'linear-gradient(180deg, #EFEFF3 0%, #CECED6 50%, #9A9AA4 100%)',
        boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.35), inset -1px 0 0 rgba(0,0,0,0.25)',
        zIndex: 1,
      }}>
        {/* chrome ring at stem tip */}
        <div style={{
          position: 'absolute', bottom: stemW * 0.3, left: 0, right: 0,
          height: stemW * 0.55,
          background: `linear-gradient(180deg, #E5E5EB 0%, #A8A8B4 50%, #70707A 100%)`,
          borderRadius: stemW,
          boxShadow: active ? `0 0 12px ${accent}aa` : 'none',
        }} />
        {/* stem tip speaker dot */}
        <div style={{
          position: 'absolute', bottom: 2, left: `calc(50% - ${stemW * 0.15}px)`,
          width: stemW * 0.3, height: stemW * 0.3,
          borderRadius: '50%',
          background: '#0a0a0f',
          boxShadow: active ? `0 0 8px ${accent}` : 'none',
          animation: active ? 'stem-pulse 1.4s ease-in-out infinite' : 'none',
        }} />
      </div>

      {/* main orb */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: size, height: size,
        borderRadius: '50%',
        background: `
          radial-gradient(circle at 30% 25%, #FFFFFF 0%, #F5F5F7 20%, #D8D8DE 55%, #AEAEB8 85%, #90909A 100%)
        `,
        boxShadow: `
          ${glow},
          inset -8px -14px 30px rgba(0,0,0,0.18),
          inset 6px 8px 20px rgba(255,255,255,0.6),
          inset 0 0 0 1px rgba(255,255,255,0.3)
        `,
        transition: 'box-shadow 300ms cubic-bezier(0.33,1,0.68,1)',
        zIndex: 2,
      }}>
        {/* inner speaker mesh */}
        <div style={{
          position: 'absolute',
          top: '32%', left: isL ? '28%' : '42%',
          width: size * 0.3, height: size * 0.3,
          borderRadius: '50%',
          background: `radial-gradient(circle, #1A1A1E 40%, #2A2A30 100%)`,
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.15)',
          overflow: 'hidden',
        }}>
          {/* mesh dot pattern */}
          <div style={{
            position: 'absolute', inset: 2,
            backgroundImage: 'radial-gradient(circle, #3A3A40 0.8px, transparent 1px)',
            backgroundSize: '3px 3px',
            opacity: 0.6,
          }}/>
        </div>

        {/* proximity sensors */}
        <div style={{
          position: 'absolute', top: '72%', left: isL ? '40%' : '50%',
          width: 3, height: 3, borderRadius: '50%', background: '#1A1A1E',
        }}/>
        <div style={{
          position: 'absolute', top: '72%', left: isL ? '50%' : '60%',
          width: 3, height: 3, borderRadius: '50%', background: '#1A1A1E',
        }}/>

        {/* top specular highlight */}
        <div style={{
          position: 'absolute',
          top: '8%', left: '25%',
          width: '50%', height: '22%',
          borderRadius: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
          filter: 'blur(2px)',
        }}/>

        {/* accent rim reflection (active only) */}
        {active && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            boxShadow: `inset 0 0 0 1.5px ${accent}77`,
          }}/>
        )}
      </div>
    </div>
  );
}

// ─── Variant B: neon abstract ──────────────────────────────────────
function NeonPod({ side, size, active, accent, state, reduceMotion }) {
  const isL = side === 'L';
  const rings = active ? 3 : 1;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* expanding rings */}
      {!reduceMotion && [...Array(rings)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: size, height: size,
          borderRadius: '50%',
          border: `1.5px solid ${accent}`,
          opacity: 0,
          animation: `ambient-drift ${4 + i}s ease-in-out ${i * 0.6}s infinite`,
        }}/>
      ))}

      {/* core orb */}
      <div style={{
        width: size * 0.78, height: size * 0.78,
        borderRadius: '50%',
        background: active
          ? `radial-gradient(circle at 35% 30%, ${accent}ee 0%, ${accent}88 30%, ${accent}33 65%, transparent 80%)`
          : `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 60%, transparent 85%)`,
        boxShadow: active
          ? `0 0 48px ${accent}77, 0 0 100px ${accent}44, inset 0 0 30px ${accent}33`
          : 'inset 0 0 20px rgba(255,255,255,0.04)',
        border: `1px solid ${active ? accent + '88' : 'rgba(255,255,255,0.1)'}`,
        transition: 'all 300ms cubic-bezier(0.33,1,0.68,1)',
        position: 'relative',
      }}>
        {/* inner specular */}
        <div style={{
          position: 'absolute',
          top: '12%', left: '20%',
          width: '45%', height: '22%',
          borderRadius: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0) 100%)',
          filter: 'blur(4px)',
        }}/>
        {/* L/R letter */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: size * 0.14, fontWeight: 500,
          color: active ? '#000' : 'rgba(255,255,255,0.25)',
          letterSpacing: 2,
        }}>{side}</div>
      </div>
    </div>
  );
}

// ─── Variant C: hardware-inspired ──────────────────────────────────
function HwPod({ side, size, active, accent, state }) {
  const isL = side === 'L';
  const tilt = isL ? -6 : 6;
  const stemW = size * 0.2;
  const stemH = size * 0.72;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      transform: `rotate(${tilt}deg)`,
      transformOrigin: '50% 55%',
    }}>
      {/* accent wash */}
      <div style={{
        position: 'absolute',
        top: -size * 0.2, left: -size * 0.2,
        width: size * 1.4, height: size * 1.4,
        borderRadius: '50%',
        background: active ? `radial-gradient(circle, ${accent}33 0%, ${accent}11 40%, transparent 70%)` : 'transparent',
        transition: 'background 300ms',
        filter: 'blur(8px)',
      }}/>

      {/* stem */}
      <div style={{
        position: 'absolute',
        top: size * 0.62,
        left: `calc(50% - ${stemW/2}px)`,
        width: stemW, height: stemH,
        borderRadius: stemW / 2,
        background: `
          linear-gradient(90deg,
            #6a6a74 0%,
            #c4c4cc 25%,
            #ededf2 48%,
            #aaaab4 78%,
            #4a4a54 100%)
        `,
        boxShadow: `
          inset 0 2px 3px rgba(255,255,255,0.5),
          inset 0 -2px 3px rgba(0,0,0,0.4),
          0 4px 12px rgba(0,0,0,0.4)
        `,
      }}>
        {/* lower polished band */}
        <div style={{
          position: 'absolute', bottom: '8%', left: 0, right: 0, height: '18%',
          background: `linear-gradient(90deg, #3a3a42, #ededf2 50%, #3a3a42)`,
          borderRadius: stemW / 2,
          boxShadow: active ? `0 0 12px ${accent}` : 'none',
        }}/>
      </div>

      {/* orb — matte pearl */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: size, height: size,
        borderRadius: '50%',
        background: `
          radial-gradient(ellipse at 30% 20%,
            #fafafc 0%,
            #e0e0e6 30%,
            #b8b8c2 60%,
            #888892 85%,
            #55555c 100%)
        `,
        boxShadow: `
          ${active ? `0 0 50px ${accent}77, 0 0 90px ${accent}44,` : ''}
          inset -14px -18px 40px rgba(0,0,0,0.35),
          inset 8px 12px 24px rgba(255,255,255,0.6),
          0 8px 30px rgba(0,0,0,0.5),
          inset 0 0 0 0.5px rgba(255,255,255,0.4)
        `,
        transition: 'box-shadow 300ms',
      }}>
        {/* inner ear grille */}
        <div style={{
          position: 'absolute',
          top: '34%', left: isL ? '25%' : '45%',
          width: size * 0.34, height: size * 0.28,
          borderRadius: '50%',
          background: `
            radial-gradient(ellipse, #0a0a0e 0%, #1a1a20 60%, #2a2a32 100%)
          `,
          boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.9), 0 1px 1px rgba(255,255,255,0.15)',
        }}>
          <div style={{
            position: 'absolute', inset: 3,
            backgroundImage: 'radial-gradient(circle, #4a4a52 0.5px, transparent 0.8px)',
            backgroundSize: '2.4px 2.4px',
            opacity: 0.5,
            borderRadius: '50%',
          }}/>
        </div>

        {/* keynote-style specular arc */}
        <div style={{
          position: 'absolute',
          top: '6%', left: '18%',
          width: '55%', height: '26%',
          borderRadius: '50%',
          background: 'linear-gradient(165deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(1px)',
          opacity: 0.85,
        }}/>

        {/* bottom rim shadow accent */}
        {active && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            boxShadow: `inset 0 -4px 20px ${accent}77`,
          }}/>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { EarbudPod, GlassPod, NeonPod, HwPod });
