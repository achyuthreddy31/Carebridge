import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, MessageSquare, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { VisitSummaryCard } from '../../components/patient/VisitSummaryCard';
import { PrecautionGuidanceCard } from '../../components/patient/PrecautionGuidanceCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { visitService } from '../../services/visits';
import '../app-pages.css';

export const VisitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [visit, setVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        setLoading(true);
        const data = await visitService.getVisitDetail(id);
        setVisit(data);
      } catch (err) {
        addToast('Failed to load visit record.', 'error');
        navigate('/patient/timeline');
      } finally {
        setLoading(false);
      }
    };
    fetchVisit();
  }, [id, navigate, addToast]);

  if (loading) {
    return (
      <PageLayout>
        <Skeleton height="350px" className="curasync-skeleton--card" />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="curasync-page-header">
        <div>
          <button
            type="button"
            className="curasync-back-btn"
            onClick={() => navigate('/patient/timeline')}
          >
            <ArrowLeft size={16} /> Back to Medical Timeline
          </button>
          <span className="curasync-page-header__eyebrow" style={{ marginTop: '0.5rem' }}>
            STRUCTURED CONSULTATION RECORD
          </span>
          <h1 className="curasync-page-header__title">{visit?.title}</h1>
          <p className="curasync-page-header__desc">
            Compiled on {new Date(visit?.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} via Carebridge Clinical Intake Assistant
          </p>
        </div>

        <div className="curasync-page-header__actions">
          <Button
            variant="accent"
            icon={Share2}
            onClick={() => navigate('/patient/share')}
          >
            Share with Doctor (Generate OTP)
          </Button>
        </div>
      </div>

      {/* Structured SOAP Clinical Summary */}
      <VisitSummaryCard
        summary={visit?.summary}
        redFlags={visit?.red_flags}
        patientDescription={visit?.summary?.patient_own_description}
      />

      {/* Pre-Consultation Precautions Guidance */}
      {(visit?.precautions || visit?.summary?.precautions) && (
        <PrecautionGuidanceCard
          precautions={visit?.precautions || visit?.summary?.precautions}
        />
      )}

      {/* Collapsible Chat Transcript */}
      <Card variant="default" padding="md" style={{ marginTop: '1.5rem' }}>
        <button
          type="button"
          className="curasync-accordion-toggle"
          onClick={() => setShowTranscript(!showTranscript)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} />
            <span style={{ fontWeight: '600' }}>
              View Intake Conversation Transcript ({visit?.messages?.length || 0} messages)
            </span>
          </div>
          {showTranscript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showTranscript && (
          <div className="curasync-transcript-list">
            {(visit?.messages || []).map((m, idx) => (
              <div
                key={idx}
                className={`curasync-transcript-item curasync-transcript-item--${m.role}`}
              >
                <span className="curasync-transcript-author">
                  {m.role === 'assistant' ? '🤖 Curasync Intake Assistant' : '👤 You (Patient)'}:
                </span>
                <p>{m.content}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageLayout>
  );
};
