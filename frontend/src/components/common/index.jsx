import React from 'react'

export function Spinner() {
  return (
    <div style={{
      display: 'inline-block',
      width: 24,
      height: 24,
      border: '3px solid var(--ds-muted, #edf2f5)',
      borderTop: '3px solid var(--ds-accent, #2ec8a8)',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export function Toast({ message, type = 'info' }) {
  const bgColor = {
    success: 'var(--ds-accent, #2ec8a8)',
    error: 'var(--ds-danger, #ff6b6b)',
    info: 'var(--ds-accent, #2ec8a8)',
  }[type] || 'var(--ds-accent)'

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: bgColor,
      color: 'white',
      padding: '12px 16px',
      borderRadius: 'var(--ds-radius, 12px)',
      boxShadow: 'var(--ds-shadow, 0 8px 20px rgba(38,49,63,0.06))',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-in-out',
    }}>
      <style>{`@keyframes slideIn { from { transform: translateX(400px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }`}</style>
      {message}
    </div>
  )
}

export function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div
        style={{
          background: 'var(--ds-surface, white)',
          borderRadius: 'var(--ds-radius, 12px)',
          padding: 24,
          maxWidth: 500,
          width: '90%',
          boxShadow: 'var(--ds-shadow, 0 8px 20px rgba(38,49,63,0.06))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: 'var(--ds-subtext, #7b8790)',
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Input({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', marginBottom: 6, fontSize: '14px', fontWeight: 500, color: 'var(--ds-text, #24303a)' }}>{label}</label>}
      <input
        {...props}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 'var(--ds-radius, 12px)',
          border: `1px solid ${error ? 'var(--ds-danger, #ff6b6b)' : 'var(--ds-muted, #edf2f5)'}`,
          fontSize: '14px',
          fontFamily: 'var(--ds-font-family, inherit)',
          boxSizing: 'border-box',
        }}
      />
      {error && <div style={{ color: 'var(--ds-danger, #ff6b6b)', fontSize: '12px', marginTop: 4 }}>{error}</div>}
    </div>
  )
}
