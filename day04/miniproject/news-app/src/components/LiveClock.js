import { useState, useEffect } from 'react';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  const [visible, setVisible] = useState(true);

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setVisible(!visible)}
        style={{
          background: visible ? '#ef4444' : '#0d9488',
          color: 'white',
          border: 'none',
          padding: '6px 14px',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 12,
          marginBottom: 8
        }}
      >
        {visible ? '⏹ Hide Clock (unmount → cleanup)' : '▶️ Show Clock (mount → useEffect)'}
      </button>

      {visible && <ClockDisplay />}
    </div>
  );
}

function ClockDisplay() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    console.log('🟢 Clock mounted — setInterval started');

    // Side effect: start a timer
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cleanup: clear timer when component unmounts
    return () => {
      console.log('🔴 Clock unmounted — clearInterval (cleanup!)');
      clearInterval(timer);
    };
  }, []); // Empty [] = run once on mount, cleanup on unmount

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 14px',
      borderRadius: 8,
      background: 'rgba(20, 184, 166, 0.1)',
      border: '1px solid rgba(20, 184, 166, 0.2)',
      fontSize: 13
    }}>
      <span>🕐</span>
      <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
        {time.toLocaleTimeString()}
      </span>
      <span style={{ fontSize: 11, opacity: 0.5 }}>
        useEffect cleanup demo — open console to see mount/unmount logs
      </span>
    </div>
  );
}

export default LiveClock;
