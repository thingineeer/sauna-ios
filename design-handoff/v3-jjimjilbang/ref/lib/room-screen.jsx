// RoomScreen — the heart of the app. S05/S06/S07.
// Renders the tab bar, two pods with message slots, the wave between
// them, bottom input, optional echo + overlays.

function PodMessage({ text, nickname, lifetime, accent, npc, size, onVanish }) {
  // lifetime in ms (time remaining out of total)
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', gap: 6,
      width: '100%',
      animation: 'msg-appear 300ms cubic-bezier(0.33,1,0.68,1)',
    }}>
      <div className="kor" style={{
        fontSize: size * 0.085,
        lineHeight: 1.28,
        fontWeight: 500,
        color: '#0a0a0f',
        maxHeight: size * 0.4,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        textWrap: 'pretty',
        wordBreak: 'keep-all',
        textShadow: '0 1px 0 rgba(255,255,255,0.6)',
        padding: `0 ${size * 0.04}px`,
      }}>{text}</div>
      <div className="mono" style={{
        fontSize: 9.5, fontWeight: 500,
        color: npc ? TOKENS.npc : accent,
        letterSpacing: 0.2,
        opacity: 0.95,
        filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))',
      }}>
        {npc && <span style={{marginRight:3}}>🤖</span>}
        @{nickname}
      </div>
      {lifetime != null && (
        <div style={{
          width: '72%', height: 2, borderRadius: 2,
          background: 'rgba(0,0,0,0.15)',
          overflow: 'hidden',
          marginTop: 2,
        }}>
          <div style={{
            width: `${lifetime * 100}%`, height: '100%',
            background: lifetime < 0.2
              ? accent
              : `linear-gradient(90deg, rgba(255,255,255,0.5), ${accent})`,
            animation: lifetime < 0.2 ? 'lifebar-blink 500ms ease-in-out infinite' : 'none',
            transition: 'width 1s linear',
          }}/>
        </div>
      )}
    </div>
  );
}

// Room accent indicator chip
function RoomTab({ roomId, selected, onClick, accent }) {
  const room = TOKENS.rooms[roomId];
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      padding: '10px 4px', position: 'relative',
      color: selected ? TOKENS.text.primary : TOKENS.text.secondary,
      fontSize: 15, fontWeight: selected ? 600 : 500,
      fontFamily: "'Noto Sans KR', sans-serif",
      transition: 'color 220ms',
      letterSpacing: 0.2,
    }}>
      {room.name}
      {selected && (
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 26, height: 2, borderRadius: 2,
          background: accent,
          boxShadow: `0 0 8px ${accent}aa`,
        }}/>
      )}
    </button>
  );
}

function CountPill({ count, roomId, accent }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 10px', borderRadius: 999,
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid rgba(255,255,255,0.06)`,
      fontSize: 11, fontWeight: 500,
      color: TOKENS.text.secondary,
    }} className="mono">
      <div style={{
        width: 5, height: 5, borderRadius: '50%',
        background: accent,
        boxShadow: `0 0 6px ${accent}`,
        animation: 'counter-dot 1.6s ease-in-out infinite',
      }}/>
      {count}
      <svg width="7" height="5" viewBox="0 0 7 5" style={{opacity:0.5}}>
        <path d="M1 1l2.5 2.5L6 1" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

// Signature ambient background: drifting accent gradients behind everything.
function RoomAmbience({ accent, reduceMotion }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      pointerEvents: 'none', zIndex: 0,
    }}>
      <div style={{
        position: 'absolute',
        top: '15%', left: '-10%',
        width: 280, height: 280,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
        filter: 'blur(30px)',
        animation: reduceMotion ? 'none' : 'ambient-drift 8s ease-in-out infinite',
      }}/>
      <div style={{
        position: 'absolute',
        bottom: '20%', right: '-10%',
        width: 260, height: 260,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
        filter: 'blur(30px)',
        animation: reduceMotion ? 'none' : 'ambient-drift 11s ease-in-out -3s infinite',
      }}/>
      {/* subtle grid noise */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.02) 0.5px, transparent 0.8px)',
        backgroundSize: '3px 3px',
        opacity: 0.5,
      }}/>
    </div>
  );
}

// RoomScreen: renders the full S06 core-loop screen for a single room.
// Controlled via props so parent can drive animated transitions.
function RoomScreen({
  roomId = 'daily',
  messages = { L: null, R: null }, // { text, nickname, lifetime, npc }
  waveActive = null,       // 'LtoR' | 'RtoL' | null
  onWaveComplete,
  variant = 'glass',
  reduceMotion = false,
  onTab, onSwipe,
  showInput = true,
  showEcho = null,          // text to echo at bottom
  showEmpty = false,
  muted = false,
  keyboardUp = false,
  inputValue = '',
  onInputChange,
  onSend,
  onLongPressMessage,
  width = 390, height = 844,
  counts = { daily: '1.2k', stock: '640', job: '892' },
  overlay = null,           // react node overlay (report sheet etc.)
  emptyNpcHint = false,
}) {
  const room = TOKENS.rooms[roomId];
  const accent = room.accent;
  const podSize = Math.round(width * 0.42);
  const podGap = Math.round(width * 0.08);

  return (
    <div className="pod-app" style={{
      width, height,
      background: TOKENS.bg.base,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Space Grotesk', 'Noto Sans KR', sans-serif",
    }}>
      <RoomAmbience accent={accent} reduceMotion={reduceMotion}/>

      {/* status bar spacer (safe area) */}
      <div style={{height: 54}}/>

      {/* Tab bar */}
      <div style={{
        position: 'relative', zIndex: 5,
        display: 'flex', alignItems: 'center',
        padding: '4px 20px 0',
        justifyContent: 'space-between',
      }}>
        <div style={{display: 'flex', gap: 20}}>
          {ROOM_IDS.map(id => (
            <RoomTab key={id} roomId={id}
              selected={id === roomId}
              onClick={() => onTab && onTab(id)}
              accent={accent}/>
          ))}
        </div>
        <CountPill count={counts[roomId]} roomId={roomId} accent={accent}/>
      </div>

      {/* Pod stage */}
      <div style={{
        position: 'absolute',
        top: 135, left: 0, right: 0,
        height: podSize + 60,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: podGap,
        zIndex: 2,
      }}>
        <div style={{position: 'relative'}}>
          <EarbudPod side="L" variant={variant}
            size={podSize} roomAccent={accent}
            reduceMotion={reduceMotion}
            state={messages.L ? (messages.L.npc ? 'npc' : 'active') : 'idle'}
            onLongPress={() => messages.L && onLongPressMessage && onLongPressMessage('L')}>
            {messages.L && (
              <PodMessage {...messages.L} accent={accent} size={podSize}/>
            )}
          </EarbudPod>
        </div>
        <div style={{position: 'relative'}}>
          <EarbudPod side="R" variant={variant}
            size={podSize} roomAccent={accent}
            reduceMotion={reduceMotion}
            state={messages.R ? (messages.R.npc ? 'npc' : 'active') : 'idle'}
            onLongPress={() => messages.R && onLongPressMessage && onLongPressMessage('R')}>
            {messages.R && (
              <PodMessage {...messages.R} accent={accent} size={podSize}/>
            )}
          </EarbudPod>
        </div>

        {/* The wave layer — absolute between pods */}
        {waveActive && (
          <div style={{
            position: 'absolute',
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}>
            <WaveFlow
              direction={waveActive}
              accent={accent}
              width={podSize * 2 + podGap + 40}
              height={podSize * 0.9}
              amplitude={podSize * 0.12}
              reduceMotion={reduceMotion}
              onComplete={onWaveComplete}
            />
          </div>
        )}
      </div>

      {/* empty state hint */}
      {showEmpty && (
        <div style={{
          position: 'absolute',
          top: 135 + podSize + 80, left: 0, right: 0,
          textAlign: 'center', zIndex: 2,
          fontSize: 13,
          color: TOKENS.text.tertiary,
          fontFamily: "'Noto Sans KR', sans-serif",
          animation: reduceMotion ? 'none' : 'counter-dot 3.2s ease-in-out infinite',
        }}>
          {emptyNpcHint ? '박대리 도착 중…' : '아직 아무도 말 안 했어요'}
        </div>
      )}

      {/* echo message */}
      {showEcho && (
        <div style={{
          position: 'absolute', bottom: keyboardUp ? 340 : 110, left: 0, right: 0,
          display: 'flex', justifyContent: 'center', zIndex: 6,
          animation: 'echo-rise 3s ease-out forwards',
        }}>
          <div style={{
            maxWidth: '72%',
            padding: '10px 16px',
            background: `${accent}22`,
            border: `1px solid ${accent}55`,
            borderRadius: 18,
            fontSize: 14,
            color: TOKENS.text.primary,
            fontFamily: "'Noto Sans KR', sans-serif",
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: `0 8px 40px ${accent}44`,
          }}>
            <span className="mono" style={{fontSize: 10, color: accent, marginRight: 8, opacity: 0.9}}>나</span>
            {showEcho}
          </div>
        </div>
      )}

      {/* Input */}
      {showInput && !muted && (
        <InputBar
          roomId={roomId} accent={accent}
          value={inputValue} onChange={onInputChange}
          onSend={onSend}
          bottom={keyboardUp ? 301 : 34}/>
      )}

      {/* Muted overlay */}
      {muted && <MutedOverlay accent={accent}/>}

      {overlay}

      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', zIndex: 100,
        pointerEvents: 'none',
      }}>
        <div style={{width: 134, height: 5, borderRadius: 3,
          background: 'rgba(255,255,255,0.5)'}}/>
      </div>
    </div>
  );
}

function InputBar({ roomId, accent, value, onChange, onSend, bottom = 34 }) {
  const room = TOKENS.rooms[roomId];
  const hasText = value && value.length > 0;
  const count = value ? value.length : 0;
  return (
    <div style={{
      position: 'absolute',
      bottom, left: 16, right: 16,
      zIndex: 10,
    }}>
      <div style={{
        height: 52, borderRadius: 26,
        background: 'rgba(22,22,30,0.72)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid rgba(255,255,255,0.08)`,
        display: 'flex', alignItems: 'center',
        padding: '0 6px 0 18px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
      }}>
        <input
          value={value || ''}
          onChange={(e) => onChange && onChange(e.target.value.slice(0, 200))}
          onKeyDown={(e) => { if (e.key === 'Enter' && hasText) onSend && onSend(); }}
          placeholder={room.placeholder}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: TOKENS.text.primary,
            fontSize: 15,
            fontFamily: "'Noto Sans KR', sans-serif",
            letterSpacing: -0.2,
          }}
        />
        {count >= 180 && (
          <span className="mono" style={{
            fontSize: 11, color: count >= 200 ? TOKENS.text.danger : TOKENS.text.tertiary,
            marginRight: 8,
          }}>{count}/200</span>
        )}
        <button
          onClick={onSend}
          disabled={!hasText}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            border: 'none', cursor: hasText ? 'pointer' : 'default',
            background: hasText ? accent : 'rgba(255,255,255,0.08)',
            color: hasText ? '#0a0a0f' : 'rgba(255,255,255,0.25)',
            boxShadow: hasText ? `0 0 16px ${accent}88` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 200ms',
          }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function MutedOverlay({ accent }) {
  const [tLeft, setT] = React.useState(300);
  React.useEffect(() => {
    const i = setInterval(() => setT(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(i);
  }, []);
  const mm = String(Math.floor(tLeft / 60)).padStart(2, '0');
  const ss = String(tLeft % 60).padStart(2, '0');
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20,
      background: 'rgba(10,10,15,0.78)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 20,
    }}>
      <div style={{position: 'relative', width: 120, height: 120}}>
        <svg width="120" height="120" className="pod-ring-svg">
          <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none"/>
          <circle cx="60" cy="60" r="52"
            stroke={TOKENS.text.danger} strokeWidth="3" fill="none"
            strokeDasharray={2 * Math.PI * 52}
            strokeDashoffset={2 * Math.PI * 52 * (1 - tLeft / 300)}
            strokeLinecap="round"
            style={{transition: 'stroke-dashoffset 1s linear'}}/>
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 28, fontWeight: 500,
          color: TOKENS.text.primary,
        }}>{mm}:{ss}</div>
      </div>
      <div style={{textAlign: 'center', padding: '0 40px'}}>
        <div className="kor" style={{fontSize: 20, fontWeight: 600, marginBottom: 8}}>
          잠깐 쉬어가요
        </div>
        <div className="kor" style={{fontSize: 13, color: TOKENS.text.secondary, lineHeight: 1.5}}>
          도배로 5분 뮤트됐어요.<br/>
          계속 읽을 수는 있습니다.
        </div>
      </div>
    </div>
  );
}

// Report long-press sheet
function ReportSheet({ message, accent, onClose, onReport }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 30,
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#14141B',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '10px 0 34px',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderBottom: 'none',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.2)',
          margin: '6px auto 16px',
        }}/>
        <div style={{
          padding: '14px 20px',
          margin: '0 16px 14px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 12,
          border: `1px solid rgba(255,255,255,0.06)`,
        }}>
          <div className="mono" style={{fontSize: 10, color: accent, marginBottom: 6}}>
            @{message && message.nickname}
          </div>
          <div className="kor" style={{fontSize: 14, color: TOKENS.text.primary, lineHeight: 1.4}}>
            {message && message.text}
          </div>
        </div>
        {[
          { icon: '⚠️', label: '신고',    danger: true, onClick: onReport },
          { icon: '🚫', label: '이 사용자 차단', danger: true },
          { icon: '📋', label: '메시지 복사' },
          { icon: '✕',  label: '취소',    muted: true, onClick: onClose },
        ].map((r, i) => (
          <button key={i} onClick={r.onClick} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            width: '100%', padding: '14px 24px',
            background: 'transparent', border: 'none',
            borderTop: `1px solid rgba(255,255,255,0.04)`,
            color: r.danger ? TOKENS.text.danger : r.muted ? TOKENS.text.secondary : TOKENS.text.primary,
            fontSize: 16, fontWeight: 500,
            fontFamily: "'Noto Sans KR', sans-serif",
            cursor: 'pointer', textAlign: 'left',
          }}>
            <span style={{fontSize: 18, width: 24}}>{r.icon}</span>
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Report form screen (S11)
function ReportForm({ message, accent, onClose, onSubmit, selectedReason, onSelectReason }) {
  const reasons = [
    '스팸 / 광고',
    '욕설 / 혐오 표현',
    '음란물',
    '주식 리딩 / 조작',
    '개인정보 유출',
    '기타',
  ];
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 40,
      background: TOKENS.bg.base,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{height: 54}}/>
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '10px 16px', justifyContent: 'space-between',
      }}>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: TOKENS.text.primary,
          fontSize: 16, fontWeight: 500, cursor: 'pointer',
          fontFamily: "'Noto Sans KR', sans-serif",
        }}>취소</button>
        <div className="kor" style={{fontSize: 16, fontWeight: 600}}>신고</div>
        <button onClick={onSubmit} disabled={!selectedReason} style={{
          background: 'none', border: 'none',
          color: selectedReason ? TOKENS.text.danger : TOKENS.text.tertiary,
          fontSize: 16, fontWeight: 600, cursor: selectedReason ? 'pointer' : 'default',
          fontFamily: "'Noto Sans KR', sans-serif",
        }}>제출</button>
      </div>
      <div style={{padding: '24px 20px 12px'}}>
        <div className="kor" style={{fontSize: 13, color: TOKENS.text.tertiary, marginBottom: 8}}>
          신고할 메시지
        </div>
        <div style={{
          padding: '14px 16px',
          background: TOKENS.bg.elevated,
          borderRadius: 14,
          border: `1px solid rgba(255,255,255,0.06)`,
        }}>
          <div className="mono" style={{fontSize: 10, color: accent, marginBottom: 6}}>
            @{message && message.nickname}
          </div>
          <div className="kor" style={{fontSize: 14, lineHeight: 1.4}}>
            {message && message.text}
          </div>
        </div>
      </div>
      <div style={{padding: '18px 20px 8px'}}>
        <div className="kor" style={{fontSize: 13, color: TOKENS.text.tertiary, marginBottom: 10}}>
          사유 선택
        </div>
      </div>
      <div style={{padding: '0 20px', flex: 1}}>
        {reasons.map((r) => (
          <button key={r} onClick={() => onSelectReason(r)} style={{
            display: 'flex', alignItems: 'center',
            width: '100%', padding: '14px 16px',
            marginBottom: 8,
            background: selectedReason === r ? 'rgba(255,77,109,0.08)' : TOKENS.bg.elevated,
            border: `1px solid ${selectedReason === r ? 'rgba(255,77,109,0.4)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 14,
            color: TOKENS.text.primary,
            fontSize: 15,
            cursor: 'pointer', textAlign: 'left',
            fontFamily: "'Noto Sans KR', sans-serif",
            transition: 'all 180ms',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              border: `1.5px solid ${selectedReason === r ? TOKENS.text.danger : 'rgba(255,255,255,0.25)'}`,
              marginRight: 14, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selectedReason === r && (
                <div style={{width: 10, height: 10, borderRadius: '50%', background: TOKENS.text.danger}}/>
              )}
            </div>
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { RoomScreen, InputBar, MutedOverlay, ReportSheet, ReportForm, PodMessage, RoomAmbience });
