import React from 'react';
import { Clock, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useCountdown } from '../../hooks/useCountdown';
import './AccessTokenCard.css';

export const AccessTokenCard = ({ token, onRevoke }) => {
  const { minutes, seconds, isExpired } = useCountdown(token.expires_at);

  const isTokenActive = token.is_active && !isExpired && !token.is_revoked;

  // Format OTP code into spaced digits: "4 8 2   9 1 0"
  const formattedCode = token.code
    ? token.code.split('').map((digit, i) => (
        <span key={i} className="curasync-token-card__digit">
          {digit}
        </span>
      ))
    : '------';

  return (
    <Card
      variant={isTokenActive ? 'privacy-tint' : 'bordered'}
      padding="lg"
      className={`curasync-token-card ${isTokenActive ? 'curasync-token-card--active' : 'curasync-token-card--expired'}`}
    >
      <div className="curasync-token-card__header">
        <div>
          <span className="curasync-token-card__eyebrow">TEMPORARY CLINICAL ACCESS CODE</span>
          <h3 className="curasync-token-card__title">Doctor Consultation Access</h3>
        </div>
        <div>
          {isTokenActive ? (
            <Badge variant="privacy" dot size="md">● ACTIVE</Badge>
          ) : token.is_revoked ? (
            <Badge variant="error" size="md">REVOKED</Badge>
          ) : (
            <Badge variant="neutral" size="md">EXPIRED</Badge>
          )}
        </div>
      </div>

      <div className="curasync-token-card__digits-row">
        {formattedCode}
      </div>

      <div className="curasync-token-card__meta-grid">
        <div className="curasync-token-card__timer">
          <Clock size={16} className="curasync-token-card__clock-icon" />
          {isTokenActive ? (
            <span>
              Expires in: <strong>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</strong>
            </span>
          ) : (
            <span>Session Inactive</span>
          )}
        </div>

        <div className="curasync-token-card__uses">
          <span>Used: {token.used_count || 0} / {token.max_uses || 5} sessions</span>
        </div>
      </div>

      <div className="curasync-token-card__scope">
        <span className="curasync-token-card__scope-label">Permitted Scope:</span>
        <div className="curasync-token-card__scope-tags">
          {(token.scope || []).map((s, idx) => (
            <span key={idx} className="curasync-token-card__scope-tag">
              {s.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {isTokenActive && onRevoke && (
        <div className="curasync-token-card__footer">
          <Button
            variant="danger"
            size="sm"
            onClick={() => onRevoke(token.id)}
            icon={XCircle}
          >
            REVOKE ACCESS NOW
          </Button>
          <span className="curasync-token-card__hint">
            Terminating access cuts off doctor view immediately.
          </span>
        </div>
      )}
    </Card>
  );
};
