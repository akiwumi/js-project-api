import React from 'react';
import '../styles/design-system.css';

export default function Avatar({ src, alt = '', size = 48, className = '' }) {
  const style = { width: size, height: size };
  return (
    <div className={`ds-avatar ${className}`} style={style}>
      <img src={src} alt={alt} style={style} />
    </div>
  );
}
