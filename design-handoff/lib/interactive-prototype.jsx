// InteractivePrototype — S06 core-loop + S07 room-switch in one component.
// Drives real L/R message alternation and a live wave animation.

function InteractivePrototype({ variant = 'glass', reduceMotion = false, width = 390, height = 844 }) {
  const [roomId, setRoomId] = React.useState('daily');
  const [nextRoomId, setNextRoomId] = React.useState(null); // during transition
  const [transitionProgress, setTransitionProgress] = React.useState(0); // 0→1
  const swipeRef = React.useRef(null);

  // state per room, so switching preserves conversation state
  const [roomState, setRoomState] = React.useState(() => ({
    daily: { messages: { L: null, R: null }, wave: null, echo: null },
    stock: { messages: { L: null, R: null }, wave: null, echo: null },
    job:   { messages: { L: null, R: null }, wave: null, echo: null },
  }));
  const [inputValue, setInputValue] = React.useState('');
  const [reportMsg, setReportMsg] = React.useState(null);
  const [reportReason, setReportReason] = React.useState(null);
  const [reportSubmitted, setReportSubmitted] = React.useState(false);

  // Message bank — sample conversation per room
  const bank = React.useMemo(() => ({
    daily: [
      { text: '퇴근하고 싶다ㅠㅠ 누가 나 좀 구해줘',   nickname: '퇴근하고싶은판다#1203' },
      { text: '나도 ㅠㅠ 시계가 멈춘 것 같아',        nickname: '졸린곰#0042' },
      { text: '오늘 저녁 뭐 먹지… 치킨 각?',          nickname: '배고픈햄스터#7788' },
      { text: '치킨 찬성 🙋‍♀️',                     nickname: '화난여우#2111' },
      { text: '비 와서 분위기 좋다',                  nickname: '축축한수달#0909' },
      { text: '월요병 그 자체',                       nickname: '지친라쿤#5050' },
    ],
    stock: [
      { text: '오늘 장 뭐야 진짜',                    nickname: '불타는곰#3303' },
      { text: '물렸다… 계속 물렸다',                   nickname: '초록손개미#7700' },
      { text: '반도체 어떻게 생각해?',                 nickname: '차분한독수리#1155' },
    ],
    job: [
      { text: '자소서 10번째 고치는 중',              nickname: '지친올빼미#4747' },
      { text: '면접 끝났는데 망한 것 같아요',          nickname: '떨리는두더지#0110' },
    ],
  }), []);

  const bankIdx = React.useRef({ daily: 0, stock: 0, job: 0 });
  const nextSide = React.useRef('L'); // which pod the NEXT message should land on

  // Auto-drive messages (Flow 2). Every 2.2s push a new one into the
  // "empty" slot.
  React.useEffect(() => {
    const tick = () => {
      setRoomState(prev => {
        const cur = prev[roomId];
        const slot = nextSide.current;
        const msg = bank[roomId][bankIdx.current[roomId] % bank[roomId].length];
        bankIdx.current[roomId]++;
        const newMsgs = { ...cur.messages, [slot]: { ...msg, lifetime: 1.0, npc: false } };
        // Lifetime counter: decrement the OTHER message (it's older)
        const otherSlot = slot === 'L' ? 'R' : 'L';
        if (newMsgs[otherSlot]) {
          newMsgs[otherSlot] = { ...newMsgs[otherSlot], lifetime: Math.max(0, newMsgs[otherSlot].lifetime - 0.33) };
        }
        nextSide.current = otherSlot;
        return {
          ...prev,
          [roomId]: {
            ...cur,
            messages: newMsgs,
            wave: slot === 'L' ? 'RtoL' : 'LtoR', // wave travels TOWARD the new message
          },
        };
      });
    };
    const id = setInterval(tick, 2400);
    // initial kick
    const kick = setTimeout(tick, 600);
    return () => { clearInterval(id); clearTimeout(kick); };
  }, [roomId, bank]);

  const clearWave = (room) => {
    setRoomState(prev => ({ ...prev, [room]: { ...prev[room], wave: null } }));
  };

  // Send user message
  const handleSend = () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue('');
    setRoomState(prev => ({
      ...prev,
      [roomId]: { ...prev[roomId], echo: text },
    }));
    setTimeout(() => {
      setRoomState(prev => ({ ...prev, [roomId]: { ...prev[roomId], echo: null } }));
    }, 3000);
  };

  // Swipe room transition
  const onPointerDown = (e) => {
    if (reportMsg || nextRoomId) return;
    swipeRef.current = { x0: e.clientX, id: e.pointerId, currentDx: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!swipeRef.current || e.pointerId !== swipeRef.current.id) return;
    const dx = e.clientX - swipeRef.current.x0;
    swipeRef.current.currentDx = dx;
    // threshold and direction
    const curIdx = ROOM_IDS.indexOf(roomId);
    if (Math.abs(dx) > 12) {
      const dir = dx > 0 ? -1 : 1;
      const nextIdx = curIdx + dir;
      if (nextIdx >= 0 && nextIdx < ROOM_IDS.length) {
        setNextRoomId(ROOM_IDS[nextIdx]);
        setTransitionProgress(Math.min(1, Math.abs(dx) / width));
      }
    }
  };
  const onPointerUp = (e) => {
    if (!swipeRef.current || e.pointerId !== swipeRef.current.id) return;
    const dx = swipeRef.current.currentDx;
    swipeRef.current = null;
    if (Math.abs(dx) > width * 0.3 && nextRoomId) {
      // commit: animate to 1, then swap
      setTransitionProgress(1);
      setTimeout(() => {
        setRoomId(nextRoomId);
        setNextRoomId(null);
        setTransitionProgress(0);
      }, 260);
    } else {
      // snap back
      setTransitionProgress(0);
      setTimeout(() => setNextRoomId(null), 260);
    }
  };

  // Tab click transition
  const handleTab = (target) => {
    if (target === roomId) return;
    const curIdx = ROOM_IDS.indexOf(roomId);
    const nextIdx = ROOM_IDS.indexOf(target);
    const dir = nextIdx > curIdx ? 1 : -1;
    setNextRoomId(target);
    // animate
    requestAnimationFrame(() => setTransitionProgress(1));
    setTimeout(() => {
      setRoomId(target);
      setNextRoomId(null);
      setTransitionProgress(0);
    }, 260);
  };

  const cur = roomState[roomId];
  const nxt = nextRoomId ? roomState[nextRoomId] : null;

  // Direction for the transition slide
  const curIdx = ROOM_IDS.indexOf(roomId);
  const nextIdx = nextRoomId ? ROOM_IDS.indexOf(nextRoomId) : curIdx;
  const slideDir = nextIdx > curIdx ? -1 : 1; // cur pans LEFT if next is RIGHT

  return (
    <div style={{
      width, height, overflow: 'hidden', position: 'relative',
      background: TOKENS.bg.base,
      borderRadius: 0,
    }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}>

      {/* Current room */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: `translateX(${nextRoomId ? slideDir * transitionProgress * width : 0}px)`,
        transition: swipeRef.current ? 'none' : 'transform 260ms cubic-bezier(0.5,0,0.2,1)',
      }}>
        <RoomScreen
          roomId={roomId}
          messages={cur.messages}
          waveActive={cur.wave}
          onWaveComplete={() => clearWave(roomId)}
          variant={variant}
          reduceMotion={reduceMotion}
          onTab={handleTab}
          showEcho={cur.echo}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          onLongPressMessage={(slot) => setReportMsg({ ...cur.messages[slot], slot })}
          width={width} height={height}
        />
      </div>

      {/* Next room (during transition) */}
      {nextRoomId && (
        <div style={{
          position: 'absolute', inset: 0,
          transform: `translateX(${-slideDir * (1 - transitionProgress) * width}px)`,
          transition: swipeRef.current ? 'none' : 'transform 260ms cubic-bezier(0.5,0,0.2,1)',
        }}>
          <RoomScreen
            roomId={nextRoomId}
            messages={nxt.messages}
            waveActive={null}
            variant={variant}
            reduceMotion={reduceMotion}
            width={width} height={height}
            onTab={() => {}}
          />
        </div>
      )}

      {/* Report sheet */}
      {reportMsg && !reportReason && !reportSubmitted && (
        <ReportSheet
          message={reportMsg}
          accent={TOKENS.rooms[roomId].accent}
          onClose={() => setReportMsg(null)}
          onReport={() => setReportReason('_select_')}
        />
      )}

      {/* Report form */}
      {reportMsg && reportReason && !reportSubmitted && (
        <ReportForm
          message={reportMsg}
          accent={TOKENS.rooms[roomId].accent}
          onClose={() => { setReportMsg(null); setReportReason(null); }}
          selectedReason={reportReason === '_select_' ? null : reportReason}
          onSelectReason={(r) => setReportReason(r)}
          onSubmit={() => {
            setReportSubmitted(true);
            setTimeout(() => {
              setReportMsg(null);
              setReportReason(null);
              setReportSubmitted(false);
            }, 1500);
          }}
        />
      )}

      {/* Submitted toast */}
      {reportSubmitted && (
        <div style={{
          position: 'absolute',
          bottom: 100, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 20px', borderRadius: 12,
          background: 'rgba(0,210,106,0.15)',
          border: '1px solid rgba(0,210,106,0.4)',
          color: '#00D26A', fontSize: 14, fontWeight: 500,
          fontFamily: "'Noto Sans KR', sans-serif",
          zIndex: 50,
          animation: 'echo-rise 1.5s ease-out forwards',
        }}>
          ✓ 신고 접수됐어요
        </div>
      )}
    </div>
  );
}

Object.assign(window, { InteractivePrototype });
