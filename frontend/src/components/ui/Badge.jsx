import React from 'react';
import './Badge.css';

export const Badge = ({
  children,
  variant = 'neutral', // success, warning, urgent, error, info, privacy, neutral, primary
  size = 'md',        // sm, md
  dot = false,
  className = '',
}) => {
  return (
    <span className={`curasync-badge curasync-badge--${variant} curasync-badge--${size} ${className}`}>
      {dot && <span className="curasync-badge__dot" />}
      {children}
    </span>
  );
};
