import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--ds-bg, #f4f7fa)' }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, margin: 0, color: 'var(--ds-text, #24303a)' }}>404</h1>
      <p style={{ fontSize: 18, color: 'var(--ds-subtext, #7b8790)', marginTop: 8 }}>Page not found</p>
      <Link to="/chat" style={{ marginTop: 16, color: 'var(--ds-accent, #2ec8a8)', textDecoration: 'none', fontWeight: 600 }}>Go back to chat</Link>
    </div>
  )
}
