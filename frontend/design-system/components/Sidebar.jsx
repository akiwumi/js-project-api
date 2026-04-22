import React from 'react';
import Avatar from './Avatar';
import Button from './Button';
import '../styles/design-system.css';

export default function Sidebar({ user = {}, children }) {
  return (
    <aside className="ds-sidebar ds-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar src={user.avatar} alt={user.name} size={64} />
        <div>
          <div className="ds-username">{user.name || 'User Name'}</div>
          <div className="ds-user-sub">{user.status || 'available'}</div>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <input placeholder="Search" style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(36,48,58,0.06)' }} />
      </div>

      <div style={{ marginTop: 16 }}>
        <Button variant="ghost">New chat</Button>
      </div>

      <div style={{ marginTop: 20 }}>{children}</div>
    </aside>
  );
}
