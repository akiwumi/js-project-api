import React from 'react'

export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--ds-accent, #2ec8a8)',
          animation: 'bounce 1.4s infinite',
          animationDelay: '0s',
        }}
      />
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--ds-accent, #2ec8a8)',
          animation: 'bounce 1.4s infinite',
          animationDelay: '0.2s',
        }}
      />
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--ds-accent, #2ec8a8)',
          animation: 'bounce 1.4s infinite',
          animationDelay: '0.4s',
        }}
      />
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          30% {
            transform: translateY(-10px);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  )
}

export function UnreadBadge({ count }) {
  if (!count || count === 0) return null
  return (
    <div
      style={{
        background: 'var(--ds-danger, #ff6b6b)',
        color: 'white',
        borderRadius: '9999px',
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        fontWeight: 600,
      }}
    >
      {count > 99 ? '99+' : count}
    </div>
  )
}

export function MessageStatus({ seen, sending }) {
  if (sending) {
    return <span style={{ fontSize: '10px', color: 'var(--ds-subtext, #7b8790)' }}>⏱</span>
  }
  return (
    <span style={{ fontSize: '10px', color: seen ? 'var(--ds-accent, #2ec8a8)' : 'var(--ds-subtext, #7b8790)' }}>
      {seen ? '✓✓' : '✓'}
    </span>
  )
}

export function OnlineBadge() {
  return (
    <div
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: '#2ec8a8',
        border: '2px solid white',
        position: 'absolute',
        bottom: 0,
        right: 0,
      }}
    />
  )
}
