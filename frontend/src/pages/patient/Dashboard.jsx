import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  Bot, 
  Share2, 
  Clock, 
  FileText, 
  History, 
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { PrivacyPulse } from '../../components/patient/PrivacyPulse';
import { ReportCard } from '../../components/patient/ReportCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { patientService } from '../../services/patients';
import { useAuth } from '../../contexts/AuthContext';
import '../app-pages.css';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await patientService.getDashboard();
        setData(res);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load health command center.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <PageLayout>
      {/* Personalized Greeting */}
      <div className="curasync-page-header">
        <div>
          <span className="curasync-page-header__eyebrow">PATIENT COMMAND CENTER</span>
          <h1 className="curasync-page-header__title">
            Hello, {user?.name || 'Patient'}
          </h1>
          <p className="curasync-page-header__desc">
            "Your health information is under your control." Review records, prepare for upcoming visits with AI intake, or manage temporary doctor permissions.
          </p>
        </div>

        <div className="curasync-page-header__actions">
          <Button
            variant="accent"
            icon={Bot}
            onClick={() => navigate('/patient/new-visit')}
          >
            Start AI Intake
          </Button>
          <Button
            variant="outline"
            icon={UploadCloud}
            onClick={() => navigate('/patient/upload')}
          >
            Upload Report
          </Button>
        </div>
      </div>

      {/* Signature Privacy Pulse Component */}
      {loading ? (
        <Skeleton height="110px" className="curasync-skeleton--card" style={{ marginBottom: '1.5rem' }} />
      ) : (
        <PrivacyPulse
          hasActiveShare={data?.has_active_share}
          doctorName={data?.active_doctor_name}
          shareExpiresAt={data?.share_expires_at}
          activeSharesCount={data?.active_shares_count || 0}
        />
      )}

      {/* Health Overview Metric Cards */}
      <div className="curasync-stat-grid">
        <Card variant="bordered" padding="md" className="curasync-stat-card">
          <span className="curasync-stat-card__label">Health Profile</span>
          <span className="curasync-stat-card__value">
            {loading ? '...' : `${data?.profile_completion || 50}%`}
          </span>
          <span className="curasync-stat-card__hint">Self-reported completeness</span>
        </Card>

        <Card variant="bordered" padding="md" className="curasync-stat-card">
          <span className="curasync-stat-card__label">Diagnostic Reports</span>
          <span className="curasync-stat-card__value">
            {loading ? '...' : data?.total_reports || 0}
          </span>
          <span className="curasync-stat-card__hint">Indexed & OCR structured</span>
        </Card>

        <Card variant="bordered" padding="md" className="curasync-stat-card">
          <span className="curasync-stat-card__label">Clinical Intakes</span>
          <span className="curasync-stat-card__value">
            {loading ? '...' : data?.total_visits || 0}
          </span>
          <span className="curasync-stat-card__hint">SOAP summaries compiled</span>
        </Card>

        <Card variant="bordered" padding="md" className="curasync-stat-card">
          <span className="curasync-stat-card__label">Active OTP Shares</span>
          <span className="curasync-stat-card__value" style={{ color: data?.has_active_share ? 'var(--color-privacy)' : 'var(--color-primary)' }}>
            {loading ? '...' : data?.active_shares_count || 0}
          </span>
          <span className="curasync-stat-card__hint">Temporary 15m sessions</span>
        </Card>
      </div>

      {/* Quick Action Clinical Tiles */}
      <div className="curasync-section">
        <h3 className="curasync-section__title">Clinical Workspace Actions</h3>
        <div className="curasync-action-grid">
          <Card
            variant="interactive"
            padding="md"
            className="curasync-action-card"
            onClick={() => navigate('/patient/upload')}
          >
            <div className="curasync-action-card__icon-wrap" style={{ background: '#E0F2FE', color: '#0369A1' }}>
              <UploadCloud size={24} />
            </div>
            <h4>Upload Diagnostic Report</h4>
            <p>Upload CBC, metabolic panels, or pathology documents for automated OCR extraction.</p>
            <span className="curasync-action-card__link">Upload PDF/Image →</span>
          </Card>

          <Card
            variant="interactive"
            padding="md"
            className="curasync-action-card"
            onClick={() => navigate('/patient/new-visit')}
          >
            <div className="curasync-action-card__icon-wrap" style={{ background: '#ECFDF5', color: '#059669' }}>
              <Bot size={24} />
            </div>
            <h4>AI Intake Assistant</h4>
            <p>Prepare clinical visit notes with structured symptom, onset, and red-flag screening.</p>
            <span className="curasync-action-card__link">Begin Intake →</span>
          </Card>

          <Card
            variant="interactive"
            padding="md"
            className="curasync-action-card"
            onClick={() => navigate('/patient/share')}
          >
            <div className="curasync-action-card__icon-wrap" style={{ background: '#FAF5FF', color: '#7C3AED' }}>
              <Share2 size={24} />
            </div>
            <h4>Generate Doctor Access Code</h4>
            <p>Create a temporary 6-digit OTP granting your consulting physician 15-minute read access.</p>
            <span className="curasync-action-card__link">Share with Doctor →</span>
          </Card>

          <Card
            variant="interactive"
            padding="md"
            className="curasync-action-card"
            onClick={() => navigate('/patient/timeline')}
          >
            <div className="curasync-action-card__icon-wrap" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <Clock size={24} />
            </div>
            <h4>Medical Timeline</h4>
            <p>View chronological health milestones combining lab reports and visit histories.</p>
            <span className="curasync-action-card__link">Explore Timeline →</span>
          </Card>
        </div>
      </div>

      {/* Recent Diagnostic Reports & Recent Visits Columns */}
      <div className="curasync-columns-grid">
        <div>
          <div className="curasync-subhead-row">
            <h3>Recent Diagnostic Reports</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/patient/reports')}>
              View all ({data?.total_reports || 0})
            </Button>
          </div>

          {loading ? (
            <div>
              <Skeleton height="80px" className="curasync-skeleton--card" style={{ marginBottom: '8px' }} />
              <Skeleton height="80px" className="curasync-skeleton--card" />
            </div>
          ) : data?.recent_reports?.length > 0 ? (
            data.recent_reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => navigate(`/patient/reports/${report.id}`)}
              />
            ))
          ) : (
            <EmptyState
              icon={FileText}
              title="No reports uploaded yet"
              description="Upload your first laboratory report to index your health parameters."
              actionLabel="Upload Report"
              onAction={() => navigate('/patient/upload')}
            />
          )}
        </div>

        <div>
          <div className="curasync-subhead-row">
            <h3>Recent Clinical Intakes</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/patient/new-visit')}>
              New Visit
            </Button>
          </div>

          {loading ? (
            <div>
              <Skeleton height="80px" className="curasync-skeleton--card" style={{ marginBottom: '8px' }} />
              <Skeleton height="80px" className="curasync-skeleton--card" />
            </div>
          ) : data?.recent_visits?.length > 0 ? (
            data.recent_visits.map((visit) => (
              <Card
                key={visit.id}
                variant="interactive"
                padding="md"
                className="curasync-item-card"
                onClick={() => navigate(`/patient/visits/${visit.id}`)}
              >
                <div className="curasync-item-card__header">
                  <div>
                    <h4 className="curasync-item-card__title">{visit.title}</h4>
                    <span className="curasync-item-card__date">
                      {new Date(visit.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {visit.has_red_flags && (
                    <span className="curasync-badge curasync-badge--urgent curasync-badge--sm">
                      Urgent Flagged
                    </span>
                  )}
                </div>
                {visit.chief_complaint && (
                  <p className="curasync-item-card__detail">
                    Complaint: <strong>{visit.chief_complaint}</strong>
                  </p>
                )}
              </Card>
            ))
          ) : (
            <EmptyState
              icon={Bot}
              title="No consultation intakes yet"
              description="Prepare for your next doctor appointment using the AI Intake Assistant."
              actionLabel="Start Intake"
              onAction={() => navigate('/patient/new-visit')}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
};
