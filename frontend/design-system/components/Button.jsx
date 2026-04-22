import React from 'react';
import '../styles/design-system.css';

export default function Button({ children, variant = 'primary', onClick, className = '', ...rest }) {
  const cls = `ds-button ds-button--${variant} ${className}`.trim();
  return (
    <button className={cls} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
