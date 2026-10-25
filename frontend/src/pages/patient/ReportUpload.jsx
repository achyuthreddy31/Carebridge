import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle2, ArrowRight, FileText, Sparkles } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { FileUploader } from '../../components/ui/FileUploader';
import { ProcessingPipeline } from '../../components/ui/ProcessingPipeline';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { reportService } from '../../services/reports';
import '../app-pages.css';

export const ReportUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState('lab_report');
  const [status, setStatus] = useState('idle'); // idle, uploading, ocr_processing, ocr_completed, ai_extracting, completed, failed
  const [error, setError] = useState(null);
  const [processedReport, setProcessedReport] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!selectedFile) {
      addToast('Please select a file to upload.', 'warning');
      return;
    }

    setStatus('uploaded');
    setError(null);

    try {
      // Advance pipeline animation for visual feedback
      const timer1 = setTimeout(() => setStatus('ocr_processing'), 600);
      const timer2 = setTimeout(() => setStatus('ocr_completed'), 1400);
      const timer3 = setTimeout(() => setStatus('ai_extracting'), 2200);

      const result = await reportService.uploadReport(selectedFile, reportType, title || null);

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      setStatus('completed');
      setProcessedReport(result);
      addToast('Medical report successfully parsed and extracted!', 'success');
    } catch (err) {
      setStatus('failed');
      const msg = err.response?.data?.detail || 'Failed to process document.';
      setError(msg);
      addToast(msg, 'error');
    }
  };

  return (
    <PageLayout>
      <div className="curasync-page-header">
        <div>
          <span className="curasync-page-header__eyebrow">SIGNATURE EXPERIENCE 1</span>
          <h1 className="curasync-page-header__title">Upload Diagnostic Report</h1>
          <p className="curasync-page-header__desc">
            Upload PDF or image pathology investigations. The Carebridge pipeline extracts clinical values, reference ranges, and indexes them into your health wallet.
          </p>
        </div>
      </div>

      <div className="curasync-upload-workspace">
        {status === 'idle' ? (
          <Card variant="bordered" padding="lg">
            <FileUploader
              onFileSelect={(file) => {
                setSelectedFile(file);
                if (!title) {
                  const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
                  setTitle(cleanName);
                }
              }}
            />

            {selectedFile && (
              <div className="curasync-upload-meta-form">
                <div className="curasync-grid-2">
                  <Input
                    label="Report Title (Optional)"
                    placeholder="e.g. Complete Blood Count (CBC)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <div className="curasync-input-group">
                    <label className="curasync-input-label">Document Category</label>
                    <select
                      className="curasync-input"
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option value="lab_report">Pathology / Laboratory Panel</option>
                      <option value="prescription">Doctor Prescription</option>
                      <option value="imaging">Imaging / Radiology Report</option>
                      <option value="discharge_summary">Discharge Summary</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <Button
                    variant="accent"
                    size="lg"
                    fullWidth
                    onClick={handleUpload}
                    icon={UploadCloud}
                  >
                    Start Automated Clinical Processing
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card variant="bordered" padding="lg">
            <h3 className="curasync-card-heading">
              <Sparkles size={18} /> Processing Medical Document
            </h3>
            <p className="curasync-upload-pipeline-desc">
              Parsing {selectedFile?.name || 'document'} through the Carebridge OCR and Clinical Extraction engine.
            </p>

            <ProcessingPipeline currentStatus={status} error={error} />

            {status === 'completed' && processedReport && (
              <div className="curasync-upload-success-preview">
                <div className="curasync-upload-success-banner">
                  <CheckCircle2 size={24} color="var(--color-success)" />
                  <div>
                    <h4>Document Intelligence Extraction Complete!</h4>
                    <p>
                      Extracted{' '}
                      <strong>
                        {processedReport.extraction?.extracted_data?.length || 0} clinical parameters
                      </strong>{' '}
                      with physiological reference ranges.
                    </p>
                  </div>
                </div>

                {/* Extracted Parameters Quick Table */}
                {processedReport.extraction?.extracted_data?.length > 0 && (
                  <div className="curasync-extracted-preview-table-wrap">
                    <table className="curasync-table">
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Observed Value</th>
                          <th>Unit</th>
                          <th>Standard Range</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedReport.extraction.extracted_data.map((item, idx) => (
                          <tr key={idx}>
                            <td><strong>{item.test_name}</strong></td>
                            <td>{item.value}</td>
                            <td>{item.unit}</td>
                            <td>{item.reference_range}</td>
                            <td>
                              <span className={`curasync-badge curasync-badge--${item.status === 'normal' ? 'success' : 'warning'} curasync-badge--sm`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="curasync-upload-cta-row">
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/patient/reports/${processedReport.id}`)}
                    icon={FileText}
                  >
                    View Report Record
                  </Button>
                  <Button
                    variant="accent"
                    onClick={() => navigate('/patient/timeline')}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    View in Medical Timeline
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatus('idle');
                      setSelectedFile(null);
                      setProcessedReport(null);
                    }}
                  >
                    Upload Another Document
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </PageLayout>
  );
};
