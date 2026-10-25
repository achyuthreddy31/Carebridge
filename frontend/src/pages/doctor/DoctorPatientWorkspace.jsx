import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  FileText, 
  Download, 
  ArrowLeft, 
  AlertTriangle, 
  Activity, 
  HeartPulse, 
  ShieldCheck,
  Clock
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout/DoctorLayout';
import { ReadOnlyBanner } from '../../components/doctor/ReadOnlyBanner';
import { VisitSummaryCard } from '../../components/patient/VisitSummaryCard';
import { PrecautionGuidanceCard } from '../../components/patient/PrecautionGuidanceCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { accessService } from '../../services/access';
import { reportService } from '../../services/reports';
import '../app-pages.css';

export const DoctorPatientWorkspace = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [summaryData, setSummaryData] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // summary, reports, lab_data

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const [sumRes, repRes] = await Promise.all([
          accessService.getPatientSummaryForDoctor(tokenId),
          accessService.getPatientReportsForDoctor(tokenId),
        ]);
        setSummaryData(sumRes);
        setReports(repRes);
      } catch (err) {
        const msg = err.response?.data?.detail || 'Session expired or access unauthorized.';
        addToast(msg, 'error');
        navigate('/doctor/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [tokenId, navigate, addToast]);

  if (loading) {
    return (
      <DoctorLayout>
        <Skeleton height="80px" className="curasync-skeleton--card" style={{ marginBottom: '1.5rem' }} />
        <Skeleton height="300px" className="curasync-skeleton--card" />
      </DoctorLayout>
    );
  }

  const patient = summaryData?.patient;
  const visit = summaryData?.visit;

  return (
    <DoctorLayout>
      {/* Persistent Read-Only Indicator & Countdown */}
      <ReadOnlyBanner expiresAt={summaryData?.expires_at} />

      {/* Patient Demographic Card */}
      <Card variant="bordered" padding="lg" style={{ marginBottom: '1.5rem' }}>
        <div className="curasync-doctor-patient-header">
          <div className="curasync-patient-avatar-badge">
            <User size={28} />
          </div>
          <div className="curasync-doctor-patient-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="curasync-doctor-patient-name">{patient?.name || 'Patient'}</h2>
              <Badge variant="primary" size="sm">PATIENT RECORD</Badge>
            </div>
            <div className="curasync-doctor-patient-badges">
              <span>Age: <strong>{patient?.age || 'N/A'}</strong></span>
              <span>Gender: <strong>{patient?.gender || 'N/A'}</strong></span>
              <span>Blood Group: <strong>{patient?.blood_group || 'N/A'}</strong></span>
            </div>
          </div>

          <button
            type="button"
            className="curasync-btn curasync-btn--outline curasync-btn--sm"
            onClick={() => navigate('/doctor/dashboard')}
          >
            <ArrowLeft size={14} /> Exit Patient Record
          </button>
        </div>

        {/* Clinical History Tags */}
        <div className="curasync-doctor-quick-tags">
          <div className="curasync-doctor-tag-group">
            <span className="curasync-doctor-tag-label">ALLERGIES:</span>
            {patient?.allergies?.length > 0 ? (
              patient.allergies.map((a, i) => (
                <span key={i} className="curasync-badge curasync-badge--urgent curasync-badge--sm">
                  {a}
                </span>
              ))
            ) : (
              <span className="curasync-muted-text">None declared</span>
            )}
          </div>

          <div className="curasync-doctor-tag-group">
            <span className="curasync-doctor-tag-label">MEDICATIONS:</span>
            {patient?.medications?.length > 0 ? (
              patient.medications.map((m, i) => (
                <span key={i} className="curasync-badge curasync-badge--info curasync-badge--sm">
                  {m}
                </span>
              ))
            ) : (
              <span className="curasync-muted-text">None</span>
            )}
          </div>

          <div className="curasync-doctor-tag-group">
            <span className="curasync-doctor-tag-label">CHRONIC CONDITIONS:</span>
            {patient?.chronic_conditions?.length > 0 ? (
              patient.chronic_conditions.map((c, i) => (
                <span key={i} className="curasync-badge curasync-badge--neutral curasync-badge--sm">
                  {c}
                </span>
              ))
            ) : (
              <span className="curasync-muted-text">None</span>
            )}
          </div>
        </div>
      </Card>

      {/* Clinical Workspace Tabs */}
      <div className="curasync-tabs-bar">
        <button
          className={`curasync-tab-btn ${activeTab === 'summary' ? 'curasync-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Consultation Intake Summary
        </button>
        <button
          className={`curasync-tab-btn ${activeTab === 'reports' ? 'curasync-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Diagnostic Reports ({reports.length})
        </button>
        <button
          className={`curasync-tab-btn ${activeTab === 'lab_data' ? 'curasync-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('lab_data')}
        >
          Extracted Lab Parameters
        </button>
      </div>

      {/* Tab 1: Visit Summary */}
      {activeTab === 'summary' && (
        <div>
          {visit?.summary ? (
            <>
              <VisitSummaryCard
                summary={visit.summary}
                redFlags={visit.red_flags}
                patientDescription={visit.summary.patient_own_description}
              />
              {(visit.precautions || visit.summary.precautions) && (
                <PrecautionGuidanceCard
                  precautions={visit.precautions || visit.summary.precautions}
                />
              )}
            </>
          ) : (
            <Card variant="bordered" padding="lg">
              <p className="curasync-muted-text">No active consultation intake recorded for this patient.</p>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Diagnostic Documents */}
      {activeTab === 'reports' && (
        <div className="curasync-grid-2">
          {reports.length > 0 ? (
            reports.map((r) => (
              <Card key={r.id} variant="bordered" padding="md" className="curasync-doctor-report-item">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <FileText size={22} color="var(--color-accent)" />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                      {r.title || r.original_filename}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Uploaded: {new Date(r.uploaded_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-dark)', fontWeight: '600' }}>
                    {r.extraction?.extracted_data?.length || 0} parameters extracted
                  </span>
                  <a
                    href={reportService.getFileUrl(r.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="curasync-btn curasync-btn--outline curasync-btn--sm"
                  >
                    <Download size={14} /> Download Document
                  </a>
                </div>
              </Card>
            ))
          ) : (
            <p className="curasync-muted-text">No diagnostic documents shared in this consultation scope.</p>
          )}
        </div>
      )}

      {/* Tab 3: Extracted Lab Parameters Table */}
      {activeTab === 'lab_data' && (
        <Card variant="bordered" padding="lg">
          <h3 className="curasync-card-heading">All Permitted Numerical Lab Parameters</h3>
          <p className="curasync-card-sub" style={{ marginBottom: '1rem' }}>
            Extracted from shared pathology reports through Carebridge clinical document intelligence.
          </p>

          <div className="curasync-table-container">
            <table className="curasync-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Observed Value</th>
                  <th>Unit</th>
                  <th>Standard Range</th>
                  <th>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {reports.flatMap((r) => r.extraction?.extracted_data || []).map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.test_name}</strong></td>
                    <td style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{item.value}</td>
                    <td>{item.unit}</td>
                    <td>{item.reference_range}</td>
                    <td>
                      <Badge
                        variant={item.status === 'normal' ? 'success' : item.status === 'high' ? 'warning' : 'info'}
                        size="sm"
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </DoctorLayout>
  );
};
