import React from 'react';
import '../styles/design-system.css';

export default function ChatWindow({ messages = [] }) {
  return (
    <section className="ds-chat-window">
      {messages.map((m, i) => (
        <div key={i} className={`ds-message ${m.from === 'me' ? 'ds-message--me' : 'ds-message--other'}`}>
          <div style={{ fontSize: '12px', color: 'var(--ds-subtext)', marginBottom: 6 }}>{m.sender}</div>
          <div>{m.text}</div>
        </div>
      ))}
    </section>
  );
}
