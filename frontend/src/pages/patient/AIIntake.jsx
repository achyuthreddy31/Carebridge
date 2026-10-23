import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, FileText, Bot } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { IntakeProgress } from '../../components/chat/IntakeProgress';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { visitService } from '../../services/visits';
import '../app-pages.css';

export const AIIntake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [visit, setVisit] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeOptions, setActiveOptions] = useState([]);
  const [currentStep, setCurrentStep] = useState('chief_complaint');

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        setLoading(true);
        const data = await visitService.getVisitDetail(id);
        setVisit(data);
        setMessages(data.messages || []);
        setCurrentStep(data.current_intake_step || 'chief_complaint');

        // Extract latest assistant message options
        if (data.messages && data.messages.length > 0) {
          const lastMsg = data.messages[data.messages.length - 1];
          if (lastMsg.role === 'assistant' && lastMsg.options) {
            setActiveOptions(lastMsg.options);
          }
        }
      } catch (err) {
        addToast('Failed to load intake session.', 'error');
        navigate('/patient/new-visit');
      } finally {
        setLoading(false);
      }
    };
    fetchVisit();
  }, [id, navigate, addToast]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || sending) return;

    // Optimistically add user's message
    const tempUserMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const assistantMsg = await visitService.sendMessage(id, text);
      setMessages((prev) => [...prev, assistantMsg]);
      setCurrentStep(assistantMsg.step || currentStep);
      setActiveOptions(assistantMsg.options || []);

      if (assistantMsg.step === 'complete') {
        addToast('Clinical intake completed! Generating structured SOAP summary.', 'success');
      }
    } catch (err) {
      addToast('Failed to deliver response. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleCompleteSummary = async () => {
    try {
      setSending(true);
      await visitService.completeVisit(id);
      addToast('Visit summary compiled successfully.', 'success');
      navigate(`/patient/visits/${id}`);
    } catch (err) {
      navigate(`/patient/visits/${id}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Skeleton height="500px" className="curasync-skeleton--card" />
      </PageLayout>
    );
  }

  const isComplete = currentStep === 'complete' || visit?.status === 'completed';

  return (
    <PageLayout>
      <div className="curasync-page-header">
        <div>
          <button
            type="button"
            className="curasync-back-btn"
            onClick={() => navigate('/patient/new-visit')}
          >
            <ArrowLeft size={16} /> Exit Consultation Intake
          </button>
          <span className="curasync-page-header__eyebrow" style={{ marginTop: '0.5rem' }}>
            CLINICAL INTAKE SESSION #{id}
          </span>
          <h1 className="curasync-page-header__title">{visit?.title}</h1>
        </div>

        {isComplete && (
          <div className="curasync-page-header__actions">
            <Button
              variant="accent"
              icon={FileText}
              onClick={() => navigate(`/patient/visits/${id}`)}
            >
              View Structured Summary
            </Button>
          </div>
        )}
      </div>

      <div className="curasync-intake-workspace">
        <div className="curasync-intake-workspace__chat">
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            activeOptions={activeOptions}
            loading={sending}
            isComplete={isComplete}
            onComplete={handleCompleteSummary}
          />
        </div>

        <div className="curasync-intake-workspace__sidebar">
          <IntakeProgress currentStep={currentStep} />
        </div>
      </div>
    </PageLayout>
  );
};
