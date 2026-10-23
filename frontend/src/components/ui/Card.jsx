import React from 'react';
import './Card.css';

export const Card = ({
  children,
  variant = 'default', // default, elevated, bordered, interactive, primary, accent-tint, privacy-tint
  padding = 'md',     // none, sm, md, lg
  className = '',
  onClick,
  ...props
}) => {
  const isClickable = !!onClick || variant === 'interactive';
  return (
    <div
      className={`curasync-card curasync-card--${variant} curasync-card--pad-${padding} ${isClickable ? 'curasync-card--clickable' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};
