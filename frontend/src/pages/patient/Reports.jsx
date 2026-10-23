import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, UploadCloud, Search, Filter } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { ReportCard } from '../../components/patient/ReportCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { reportService } from '../../services/reports';
import '../app-pages.css';

export const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await reportService.getReports(filterType === 'all' ? null : filterType);
        setReports(data);
      } catch (err) {
        // Handled
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [filterType]);

  return (
    <PageLayout>
      <div className="curasync-page-header">
        <div>
          <span className="curasync-page-header__eyebrow">DOCUMENT INTELLIGENCE</span>
          <h1 className="curasync-page-header__title">Diagnostic Medical Records</h1>
          <p className="curasync-page-header__desc">
            Pathology tests and diagnostic investigations parsed by OCR and indexed into clinical data points.
          </p>
        </div>

        <div className="curasync-page-header__actions">
          <Button
            variant="accent"
            icon={UploadCloud}
            onClick={() => navigate('/patient/upload')}
          >
            Upload New Report
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="curasync-tabs-bar">
        <button
          className={`curasync-tab-btn ${filterType === 'all' ? 'curasync-tab-btn--active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All Records ({reports.length})
        </button>
        <button
          className={`curasync-tab-btn ${filterType === 'lab_report' ? 'curasync-tab-btn--active' : ''}`}
          onClick={() => setFilterType('lab_report')}
        >
          Laboratory Panels
        </button>
        <button
          className={`curasync-tab-btn ${filterType === 'prescription' ? 'curasync-tab-btn--active' : ''}`}
          onClick={() => setFilterType('prescription')}
        >
          Prescriptions
        </button>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="curasync-grid-2">
          <Skeleton height="120px" className="curasync-skeleton--card" />
          <Skeleton height="120px" className="curasync-skeleton--card" />
          <Skeleton height="120px" className="curasync-skeleton--card" />
          <Skeleton height="120px" className="curasync-skeleton--card" />
        </div>
      ) : reports.length > 0 ? (
        <div className="curasync-grid-2">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => navigate(`/patient/reports/${report.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No diagnostic records found"
          description="Your medical record timeline begins when you upload your first laboratory test or prescription."
          actionLabel="Upload First Report"
          onAction={() => navigate('/patient/upload')}
        />
      )}
    </PageLayout>
  );
};
