import React from 'react';
import { FileText, Calendar, ChevronRight, Activity } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import './ReportCard.css';

export const ReportCard = ({ report, onClick }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" dot size="sm">Indexed & Verified</Badge>;
      case 'ocr_processing':
      case 'ai_extracting':
        return <Badge variant="info" dot size="sm">Processing</Badge>;
      case 'failed':
        return <Badge variant="error" dot size="sm">Processing Failed</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Uploaded</Badge>;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const extractedCount = report.extracted_count || (report.extraction?.extracted_data?.length || 0);

  return (
    <Card variant="interactive" padding="md" className="curasync-report-card" onClick={onClick}>
      <div className="curasync-report-card__header">
        <div className="curasync-report-card__icon-wrap">
          <FileText size={20} className="curasync-report-card__icon" />
        </div>
        <div className="curasync-report-card__meta">
          <h4 className="curasync-report-card__title">{report.title || report.original_filename}</h4>
          <span className="curasync-report-card__date">
            <Calendar size={13} /> {formatDate(report.uploaded_at || report.report_date)}
          </span>
        </div>
        <div className="curasync-report-card__status">
          {getStatusBadge(report.status)}
        </div>
      </div>

      <div className="curasync-report-card__footer">
        <div className="curasync-report-card__params">
          <Activity size={14} className="curasync-report-card__activity-icon" />
          <span>{extractedCount} clinical parameters extracted</span>
        </div>
        <div className="curasync-report-card__arrow">
          <span>View</span>
          <ChevronRight size={16} />
        </div>
      </div>
    </Card>
  );
};
