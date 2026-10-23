import React from 'react';
import { FileText, Bot, Activity, ArrowRight, AlertTriangle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import './MedicalTimeline.css';

export const MedicalTimeline = ({ items = [], onItemClick }) => {
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return {
      day: d.toLocaleDateString('en-IN', { day: '2-digit' }),
      month: d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
      year: d.getFullYear(),
    };
  };

  return (
    <div className="curasync-timeline">
      {items.map((item, index) => {
        const dateObj = formatDate(item.date);
        const isVisit = item.type === 'visit';

        return (
          <div key={item.id || index} className="curasync-timeline__item">
            <div className="curasync-timeline__date-node">
              <span className="curasync-timeline__day">{dateObj.day}</span>
              <span className="curasync-timeline__month">{dateObj.month}</span>
              <span className="curasync-timeline__year">{dateObj.year}</span>
            </div>

            <div className="curasync-timeline__axis">
              <div className={`curasync-timeline__bullet ${isVisit ? 'curasync-timeline__bullet--visit' : 'curasync-timeline__bullet--report'}`}>
                {isVisit ? <Bot size={14} /> : <FileText size={14} />}
              </div>
              {index < items.length - 1 && <div className="curasync-timeline__line" />}
            </div>

            <div
              className="curasync-timeline__card"
              onClick={() => onItemClick && onItemClick(item)}
            >
              <div className="curasync-timeline__card-header">
                <Badge variant={isVisit ? 'primary' : 'neutral'} size="sm">
                  {isVisit ? 'CLINICAL INTAKE' : 'DIAGNOSTIC REPORT'}
                </Badge>
                {item.hasRedFlags && (
                  <Badge variant="urgent" size="sm" dot>Red-Flag Noted</Badge>
                )}
              </div>

              <h4 className="curasync-timeline__card-title">{item.title}</h4>
              <p className="curasync-timeline__card-subtitle">{item.subtitle}</p>

              {item.metrics && item.metrics.length > 0 && (
                <div className="curasync-timeline__metrics">
                  {item.metrics.slice(0, 3).map((m, mIdx) => (
                    <span key={mIdx} className="curasync-timeline__metric-pill">
                      <Activity size={12} /> {m.name}: <strong>{m.value} {m.unit}</strong>
                    </span>
                  ))}
                  {item.metrics.length > 3 && (
                    <span className="curasync-timeline__more-pill">
                      +{item.metrics.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="curasync-timeline__card-action">
                <span>Inspect Clinical Data</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
