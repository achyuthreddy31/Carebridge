import React from 'react';
import { Lock, Clock, ShieldAlert } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';
import './ReadOnlyBanner.css';

export const ReadOnlyBanner = ({ expiresAt }) => {
  const { minutes, seconds, isExpired } = useCountdown(expiresAt);

  return (
    <div className={`curasync-readonly-banner ${isExpired ? 'curasync-readonly-banner--expired' : ''}`}>
      <div className="curasync-readonly-banner__left">
        <Lock size={16} className="curasync-readonly-banner__lock" />
        <span className="curasync-readonly-banner__title">
          PATIENT-AUTHORIZED TEMPORARY READ-ONLY ACCESS
        </span>
      </div>

      <div className="curasync-readonly-banner__right">
        <Clock size={16} className="curasync-readonly-banner__clock" />
        {isExpired ? (
          <span className="curasync-readonly-banner__time curasync-readonly-banner__time--expired">
            SESSION EXPIRED
          </span>
        ) : (
          <span className="curasync-readonly-banner__time">
            Access Expires in: <strong>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</strong>
          </span>
        )}
      </div>
    </div>
  );
};
