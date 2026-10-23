import React from 'react';
import { Eye, Clock, ShieldCheck, Stethoscope } from 'lucide-react';
import { Card } from '../ui/Card';
import './AccessLogTimeline.css';

export const AccessLogTimeline = ({ logs = [] }) => {
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDateHeader = (isoString) => {
    if (!isoString) return 'RECENT';
    const d = new Date(isoString);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return 'TODAY';
    }
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  return (
    <div className="curasync-access-timeline">
      {logs.map((log, index) => (
        <div key={log.id || index} className="curasync-access-timeline__entry">
          <div className="curasync-access-timeline__date-badge">
            {formatDateHeader(log.accessed_at)}
          </div>

          <div className="curasync-access-timeline__node">
            <div className="curasync-access-timeline__bullet">
              <Stethoscope size={16} />
            </div>
            {index < logs.length - 1 && <div className="curasync-access-timeline__connector" />}
          </div>

          <Card variant="default" padding="md" className="curasync-access-timeline__card">
            <div className="curasync-access-timeline__doctor-row">
              <div className="curasync-access-timeline__doctor-info">
                <h4 className="curasync-access-timeline__doctor-name">
                  {log.doctor_name || 'Healthcare Professional'}
                </h4>
                {log.clinic_name && (
                  <span className="curasync-access-timeline__clinic">
                    {log.clinic_name}
                  </span>
                )}
              </div>
              <span className="curasync-access-timeline__time">
                <Clock size={13} /> {formatTime(log.accessed_at)}
              </span>
            </div>

            <div className="curasync-access-timeline__resources">
              <span className="curasync-access-timeline__viewed-label">
                <Eye size={14} /> Viewed:
              </span>
              <div className="curasync-access-timeline__resource-chips">
                {(log.resources_accessed || []).map((res, rIdx) => (
                  <span key={rIdx} className="curasync-access-timeline__resource-chip">
                    {typeof res === 'string' ? res.replace(/_/g, ' ') : 'Clinical Record'}
                  </span>
                ))}
              </div>
            </div>

            <div className="curasync-access-timeline__audit-status">
              <ShieldCheck size={14} className="curasync-access-timeline__audit-icon" />
              <span>Cryptographically logged & timestamped under DPDP patient consent model</span>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};
