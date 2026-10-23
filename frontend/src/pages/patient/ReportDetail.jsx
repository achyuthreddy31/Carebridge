import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ArrowLeft, Calendar, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { reportService } from '../../services/reports';
import '../app-pages.css';

export const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRawOcr, setShowRawOcr] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await reportService.getReportDetail(id);
        setReport(data);
      } catch (err) {
        addToast('Failed to load report details.', 'error');
        navigate('/patient/reports');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate, addToast]);

  const handleDownload = () => {
    const downloadUrl = reportService.getFileUrl(id);
    window.open(downloadUrl, '_blank');
  };

  if (loading) {
    return (
      <PageLayout>
        <Skeleton height="300px" className="curasync-skeleton--card" />
      </PageLayout>
    );
  }

  const extraction = report?.extraction;
  const items = extraction?.extracted_data || [];

  return (
    <PageLayout>
      <div className="curasync-page-header">
        <div>
          <button
            type="button"
            className="curasync-back-btn"
            onClick={() => navigate('/patient/reports')}
          >
            <ArrowLeft size={16} /> Back to Diagnostic Reports
          </button>
          <span className="curasync-page-header__eyebrow" style={{ marginTop: '0.5rem' }}>
            REPORT INVESTIGATION DETAIL
          </span>
          <h1 className="curasync-page-header__title">
            {report?.title || report?.original_filename}
          </h1>
          <p className="curasync-page-header__desc">
            Uploaded on {new Date(report?.uploaded_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} • {report?.original_filename}
          </p>
        </div>

        <div className="curasync-page-header__actions">
          <Button
            variant="outline"
            icon={Download}
            onClick={handleDownload}
          >
            Download Original Document
          </Button>
        </div>
      </div>

      {/* Extracted Clinical Laboratory Values Table */}
      <Card variant="bordered" padding="lg" style={{ marginBottom: '1.5rem' }}>
        <div className="curasync-table-header-row">
          <div>
            <h3 className="curasync-card-heading">Extracted Clinical Values</h3>
            <p className="curasync-card-sub">
              {items.length} physiological parameters parsed and structured from the report.
            </p>
          </div>
          <Badge variant="success" dot size="md">Indexed in Timeline</Badge>
        </div>

        {items.length > 0 ? (
          <div className="curasync-table-container">
            <table className="curasync-table">
              <thead>
                <tr>
                  <th>Test Investigation</th>
                  <th>Observed Value</th>
                  <th>Unit</th>
                  <th>Reference Threshold</th>
                  <th>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.test_name}</strong></td>
                    <td style={{ fontWeight: '600', color: 'var(--color-primary)' }}>
                      {item.value}
                    </td>
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
        ) : (
          <p className="curasync-muted-text">No structured numerical parameters found in this document.</p>
        )}
      </Card>

      {/* Raw OCR Text Section (Collapsible) */}
      <Card variant="default" padding="md">
        <button
          type="button"
          className="curasync-accordion-toggle"
          onClick={() => setShowRawOcr(!showRawOcr)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} />
            <span style={{ fontWeight: '600' }}>Inspect Raw OCR Extracted Text</span>
          </div>
          {showRawOcr ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showRawOcr && (
          <div className="curasync-raw-ocr-content">
            <pre>{report?.ocr_text || 'No raw OCR text available.'}</pre>
          </div>
        )}
      </Card>
    </PageLayout>
  );
};
