import React from 'react';
import { Link } from 'react-router-dom';
import './Logo.css';

export const Logo = ({ size = 'md', to = '/', showTagline = false, theme = 'dark' }) => {
  // theme: 'dark' (for white bg), 'light' (for dark navy bg)
  const content = (
    <div className={`curasync-logo curasync-logo--${size} curasync-logo--${theme}`}>
      <div className="curasync-logo__mark">
        <svg viewBox="0 0 100 100" fill="none" className="curasync-logo__svg">
          <rect width="100" height="100" rx="24" fill={theme === 'light' ? '#ffffff' : '#0F2B46'} />
          <circle cx="50" cy="50" r="30" stroke="#2A9D8F" strokeWidth="6" strokeDasharray="6 6" />
          <path d="M32 50 C32 38, 42 32, 50 32 C58 32, 68 38, 68 50 C68 62, 58 68, 50 68" stroke="#A8DADC" strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="50" r="10" fill="#2A9D8F" />
          <circle cx="50" cy="50" r="4" fill={theme === 'light' ? '#0F2B46' : '#FFFFFF'} />
        </svg>
      </div>
      <div className="curasync-logo__text-group">
        <span className="curasync-logo__brand">
          Cura<span className="curasync-logo__sync">sync</span>
        </span>
        {showTagline && (
          <span className="curasync-logo__tagline">Clinical Intelligence</span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="curasync-logo-link">{content}</Link>;
  }
  return content;
};
