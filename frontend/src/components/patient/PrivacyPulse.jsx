import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Share2, Clock, ArrowRight, Lock } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';
import './PrivacyPulse.css';

export const PrivacyPulse = ({
  hasActiveShare = false,
  doctorName = null,
  shareExpiresAt = null,
  activeSharesCount = 0,
}) => {
  const { minutes, seconds, isExpired } = useCountdown(shareExpiresAt);
  const isActivelyShared = hasActiveShare && !isExpired;

  return (
    <div className={`curasync-privacy-pulse ${isActivelyShared ? 'curasync-privacy-pulse--shared' : 'curasync-privacy-pulse--private'}`}>
      <div className="curasync-privacy-pulse__left">
        <div className="curasync-privacy-pulse__beacon">
          {isActivelyShared ? (
            <div className="curasync-privacy-pulse__dot curasync-privacy-pulse__dot--shared animate-privacy-pulse">
              <Share2 size={18} className="curasync-privacy-pulse__icon" />
            </div>
          ) : (
            <div className="curasync-privacy-pulse__dot curasync-privacy-pulse__dot--private">
              <Lock size={18} className="curasync-privacy-pulse__icon" />
            </div>
          )}
        </div>

        <div className="curasync-privacy-pulse__content">
          <span className="curasync-privacy-pulse__eyebrow">YOUR HEALTH DATA STATUS</span>
          <div className="curasync-privacy-pulse__title-row">
            {isActivelyShared ? (
              <h2 className="curasync-privacy-pulse__status curasync-privacy-pulse__status--shared">
                SHARED TEMPORARILY
              </h2>
            ) : (
              <h2 className="curasync-privacy-pulse__status curasync-privacy-pulse__status--private">
                🔒 PRIVATE & PROTECTED
              </h2>
            )}
          </div>

          <p className="curasync-privacy-pulse__meta">
            {isActivelyShared ? (
              <>
                <span className="curasync-privacy-pulse__doctor">
                  ● Authorized: {doctorName || 'Healthcare Provider'}
                </span>
                <span className="curasync-privacy-pulse__countdown">
                  <Clock size={14} />
                  Expires in {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </>
            ) : (
              <span>No external doctor access active. You maintain 100% cryptographic data ownership.</span>
            )}
          </p>
        </div>
      </div>

      <div className="curasync-privacy-pulse__action">
        <Link
          to="/patient/share"
          className={`curasync-privacy-pulse__btn ${isActivelyShared ? 'curasync-privacy-pulse__btn--manage' : 'curasync-privacy-pulse__btn--share'}`}
        >
          <span>{isActivelyShared ? 'Manage Access' : 'Share with Doctor'}</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};
