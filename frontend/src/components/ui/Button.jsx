import React from 'react';
import './Button.css';

export const Button = ({
  children,
  variant = 'primary', // primary, accent, secondary, outline, ghost, danger
  size = 'md',        // sm, md, lg
  fullWidth = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`curasync-btn curasync-btn--${variant} curasync-btn--${size} ${fullWidth ? 'curasync-btn--full' : ''} ${loading ? 'curasync-btn--loading' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="curasync-btn__spinner" aria-hidden="true" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="curasync-btn__icon curasync-btn__icon--left" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
          <span className="curasync-btn__text">{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="curasync-btn__icon curasync-btn__icon--right" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
        </>
      )}
    </button>
  );
};
