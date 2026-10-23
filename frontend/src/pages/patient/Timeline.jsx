import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Bot, FileText, UploadCloud, Plus } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { MedicalTimeline } from '../../components/patient/MedicalTimeline';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { reportService } from '../../services/reports';
import { visitService } from '../../services/visits';
import '../app-pages.css';

export const Timeline = () => {
  const [timelineItems, setTimelineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, visits, reports
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        const [reports, visits] = await Promise.all([
          reportService.getReports(),
          visitService.getVisits(),
        ]);

        const formattedReports = reports.map((r) => ({
          id: `rep-${r.id}`,
          rawId: r.id,
          type: 'report',
          date: r.uploaded_at || r.report_date,
          title: r.title || r.original_filename,
          subtitle: `Extracted ${r.extraction?.extracted_data?.length || 0} clinical values`,
          metrics: (r.extraction?.extracted_data || []).map((m) => ({
            name: m.test_name,
            value: m.value,
            unit: m.unit,
          })),
        }));

        const formattedVisits = visits.map((v) => ({
          id: `vis-${v.id}`,
          rawId: v.id,
          type: 'visit',
          date: v.created_at,
          title: v.title,
          subtitle: v.summary?.chief_complaint
            ? `Chief Complaint: ${v.summary.chief_complaint}`
            : 'Pre-consultation intake session',
          hasRedFlags: v.has_red_flags,
        }));

        // Merge and sort newest first
        const combined = [...formattedReports, ...formattedVisits].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setTimelineItems(combined);
      } catch (err) {
        // Handled
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  const filteredItems = timelineItems.filter((item) => {
    if (filter === 'visits') return item.type === 'visit';
    if (filter === 'reports') return item.type === 'report';
    return true;
  });

  const handleItemClick = (item) => {
    if (item.type === 'report') {
      navigate(`/patient/reports/${item.rawId}`);
    } else {
      navigate(`/patient/visits/${item.rawId}`);
    }
  };

  return (
    <PageLayout>
      <div className="curasync-page-header">
        <div>
          <span className="curasync-page-header__eyebrow">CHRONOLOGICAL HEALTH TIMELINE</span>
          <h1 className="curasync-page-header__title">Medical Timeline</h1>
          <p className="curasync-page-header__desc">
            A unified clinical history showing diagnostic test investigations, consultation intakes, and physician access milestones.
          </p>
        </div>

        <div className="curasync-page-header__actions">
          <Button
            variant="accent"
            icon={Plus}
            onClick={() => navigate('/patient/new-visit')}
          >
            New Visit Intake
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

      {/* Filter Tabs */}
      <div className="curasync-tabs-bar">
        <button
          className={`curasync-tab-btn ${filter === 'all' ? 'curasync-tab-btn--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Timeline Events ({timelineItems.length})
        </button>
        <button
          className={`curasync-tab-btn ${filter === 'reports' ? 'curasync-tab-btn--active' : ''}`}
          onClick={() => setFilter('reports')}
        >
          Diagnostic Reports
        </button>
        <button
          className={`curasync-tab-btn ${filter === 'visits' ? 'curasync-tab-btn--active' : ''}`}
          onClick={() => setFilter('visits')}
        >
          Clinical Intakes
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton height="100px" className="curasync-skeleton--card" />
          <Skeleton height="100px" className="curasync-skeleton--card" />
          <Skeleton height="100px" className="curasync-skeleton--card" />
        </div>
      ) : filteredItems.length > 0 ? (
        <MedicalTimeline
          items={filteredItems}
          onItemClick={handleItemClick}
        />
      ) : (
        <EmptyState
          icon={Clock}
          title="Your health timeline is empty"
          description="Upload your first medical report or prepare for a visit to begin building your personal health timeline."
          actionLabel="Upload Diagnostic Report"
          onAction={() => navigate('/patient/upload')}
        />
      )}
    </PageLayout>
  );
};
