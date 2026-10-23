import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, ShieldCheck, ArrowRight, Clock, Plus } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { visitService } from '../../services/visits';
import '../app-pages.css';

export const NewVisit = () => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [pastVisits, setPastVisits] = useState([]);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchPast = async () => {
      try {
        const visits = await visitService.getVisits();
        setPastVisits(visits);
      } catch (err) {
        // Handled
      }
    };
    fetchPast();
  }, []);

  const handleStart = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const visit = await visitService.createVisit(title || 'Clinical Consultation Intake');
      addToast('Intake session initiated.', 'success');
      navigate(`/patient/visits/${visit.id}/chat`);
    } catch (err) {
      addToast('Failed to start intake session.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="curasync-page-header">
        <div>
          <span className="curasync-page-header__eyebrow">SIGNATURE EXPERIENCE 2</span>
          <h1 className="curasync-page-header__title">AI Intake Assistant</h1>
          <p className="curasync-page-header__desc">
            "Let's prepare your visit." Curasync guides you through structured clinical questions to compile a clear SOAP summary for your doctor, saving 10-15 minutes of consultation time.
          </p>
        </div>
      </div>

      <div className="curasync-grid-2">
        {/* Start Intake Card */}
        <Card variant="bordered" padding="lg">
          <div className="curasync-intake-start-header">
            <div className="curasync-action-card__icon-wrap" style={{ background: '#ECFDF5', color: '#059669' }}>
              <Bot size={28} />
            </div>
            <div>
              <h3>Start New Consultation Preparation</h3>
              <p className="curasync-card-sub">
                Answers are kept private and structured into a clinical summary you control.
              </p>
            </div>
          </div>

          <form onSubmit={handleStart} style={{ marginTop: '1.5rem' }}>
            <Input
              label="Consultation Title / Purpose"
              placeholder="e.g. Follow-up: Recurrent Migraine & Light Sensitivity"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              helperText="Give your visit a recognizable label"
            />

            <div className="curasync-intake-feature-list">
              <div className="curasync-intake-feature-item">
                <Sparkles size={16} color="var(--color-accent)" />
                <span>Structured questions covering symptoms, duration, and past history</span>
              </div>
              <div className="curasync-intake-feature-item">
                <ShieldCheck size={16} color="var(--color-accent)" />
                <span>Real-time red-flag symptom safety screening</span>
              </div>
              <div className="curasync-intake-feature-item">
                <Clock size={16} color="var(--color-accent)" />
                <span>Non-diagnostic: structured SOAP format designed for physicians</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              fullWidth
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Begin Conversational Intake
            </Button>
          </form>
        </Card>

        {/* Past Consultation Records */}
        <Card variant="default" padding="lg">
          <h3 className="curasync-card-heading">Previous Intake Sessions</h3>
          <p className="curasync-card-sub">
            Review summaries compiled from prior doctor preparations.
          </p>

          <div className="curasync-past-visits-list" style={{ marginTop: '1rem' }}>
            {pastVisits.length > 0 ? (
              pastVisits.map((v) => (
                <div
                  key={v.id}
                  className="curasync-past-visit-item"
                  onClick={() => navigate(`/patient/visits/${v.id}`)}
                >
                  <div className="curasync-past-visit-info">
                    <h4>{v.title}</h4>
                    <span>
                      {new Date(v.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`curasync-badge curasync-badge--${v.status === 'completed' ? 'success' : 'neutral'} curasync-badge--sm`}>
                      {v.status === 'completed' ? 'Summary Ready' : 'In Progress'}
                    </span>
                    <ArrowRight size={14} color="var(--color-text-muted)" />
                  </div>
                </div>
              ))
            ) : (
              <p className="curasync-muted-text">No previous intake sessions recorded.</p>
            )}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};
