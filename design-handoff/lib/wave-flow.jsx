// WaveFlow — the signature L↔R wave motion (C12). Renders a dotted/
// continuous sine wave that travels between two points. Duration 1.8s.

function WaveFlow({ direction = 'LtoR', accent = '#00FFB3', width = 260,
                   height = 40, amplitude = 12, reduceMotion = false,
                   onComplete, active = true }) {
  const duration = 1800;
  const [phase, setPhase] = React.useState(0); // 0..1
  const rafRef = React.useRef();

  React.useEffect(() => {
    if (!active) return;
    if (reduceMotion) {
      // fade-only fallback
      const t = setTimeout(() => onComplete && onComplete(), 400);
      return () => clearTimeout(t);
    }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setPhase(t);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else onComplete && onComplete();
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, reduceMotion]);

  if (!active) return null;

  if (reduceMotion) {
    return (
      <div style={{
        width, height,
        background: `radial-gradient(ellipse at center, ${accent}66 0%, transparent 70%)`,
        opacity: 1 - phase,
      }}/>
    );
  }

  // Ease phase for amp envelope: rises 0→1 in first 40%, stays, decays
  const env = phase < 0.4 ? phase / 0.4
            : phase < 0.75 ? 1
            : 1 - (phase - 0.75) / 0.25;
  const ampNow = amplitude * env;

  // Build sine path
  const steps = 80;
  const path = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const y = height / 2 + Math.sin((i / steps) * Math.PI * 3 + phase * Math.PI * 4) * ampNow;
    path.push((i === 0 ? 'M' : 'L') + x + ',' + y);
  }

  const flow = direction === 'LtoR' ? phase : 1 - phase;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`wave-grad-${direction}-${accent}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stopColor={accent} stopOpacity="0"/>
          <stop offset={`${Math.max(0, flow * 100 - 30)}%`} stopColor={accent} stopOpacity="0"/>
          <stop offset={`${flow * 100}%`} stopColor={accent} stopOpacity="1"/>
          <stop offset={`${Math.min(100, flow * 100 + 30)}%`} stopColor={accent} stopOpacity="0"/>
        </linearGradient>
        <filter id="wave-glow">
          <feGaussianBlur stdDeviation="2.5"/>
          <feComposite in2="SourceGraphic" operator="over"/>
        </filter>
      </defs>

      <path d={path.join(' ')}
        stroke={`url(#wave-grad-${direction}-${accent})`}
        strokeWidth="2.5" fill="none"
        strokeDasharray="3 4" strokeLinecap="round"
        filter="url(#wave-glow)"/>

      {/* Travel dots */}
      {[0, -0.1, -0.2, -0.3, -0.4].map((offset, i) => {
        const dotPhase = Math.max(0, Math.min(1, flow + offset));
        const x = dotPhase * width;
        const y = height / 2 + Math.sin(dotPhase * Math.PI * 3 + phase * Math.PI * 4) * ampNow;
        const op = (1 - Math.abs(offset) * 1.8) * env;
        return (
          <circle key={i} cx={x} cy={y} r={3 - i * 0.3}
            fill={accent} opacity={Math.max(0, op)}
            style={{ filter: `drop-shadow(0 0 4px ${accent})` }}/>
        );
      })}
    </svg>
  );
}

Object.assign(window, { WaveFlow });
