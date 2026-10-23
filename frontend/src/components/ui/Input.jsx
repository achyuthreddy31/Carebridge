import React from 'react';
import './Input.css';

export const Input = ({
  label,
  helperText,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  required,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`curasync-input-group ${error ? 'curasync-input-group--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="curasync-input-label">
          {label} {required && <span className="curasync-input-required">*</span>}
        </label>
      )}
      <div className="curasync-input-wrapper">
        {Icon && <Icon className="curasync-input-icon" size={18} />}
        <input
          id={inputId}
          type={type}
          required={required}
          className={`curasync-input ${Icon ? 'curasync-input--with-icon' : ''}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="curasync-input-error">{error}</p>
      ) : helperText ? (
        <p className="curasync-input-helper">{helperText}</p>
      ) : null}
    </div>
  );
};

export const Textarea = ({
  label,
  helperText,
  error,
  id,
  required,
  rows = 3,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`curasync-input-group ${error ? 'curasync-input-group--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="curasync-input-label">
          {label} {required && <span className="curasync-input-required">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        required={required}
        rows={rows}
        className="curasync-input curasync-textarea"
        {...props}
      />
      {error ? (
        <p className="curasync-input-error">{error}</p>
      ) : helperText ? (
        <p className="curasync-input-helper">{helperText}</p>
      ) : null}
    </div>
  );
};
