import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  Bot, 
  Activity, 
  Send, 
  ShieldCheck, 
  AlertTriangle, 
  Mic, 
  MicOff,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  User,
  RotateCcw
} from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { IntakeProgress } from '../../components/chat/IntakeProgress';
import { PrecautionGuidanceCard } from '../../components/patient/PrecautionGuidanceCard';
import { ChatMessage } from '../../components/chat/ChatMessage';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { visitService } from '../../services/visits';
import '../app-pages.css';

const QUICK_SUGGESTIONS = [
  {
    title: 'Throbbing Headache',
    text: 'Throbbing right-sided headache for 3 days, rated 6/10 intensity. Aggravated by bright screens and light, without nausea or fever.',
    isEmergency: false,
  },
  {
    title: 'Fever & Chills',
    text: 'Fever up to 101°F for 2 days with body aches and shivering. Drinking water at intervals, feeling fatigued.',
    isEmergency: false,
  },
  {
    title: 'Dry Cough & Cold',
    text: 'Persistent dry cough for 5 days with mild chest tickle and nasal congestion, worse when lying flat at night.',
    isEmergency: false,
  },
  {
    title: 'Abdominal Discomfort',
    text: 'Dull cramping stomach discomfort for 2 days after meals, mild nausea, no vomiting, maintaining fluid intake.',
    isEmergency: false,
  },
  {
    title: 'Joint Pain & Stiffness',
    text: 'Aching knee pain and morning joint stiffness for 2 weeks, exacerbated by climbing stairs or prolonged walking.',
    isEmergency: false,
  },
  {
    title: 'Chest Pain (Emergency Test)',
    text: 'Sudden severe crushing chest pain with pressure radiating to the left arm and cold sweating.',
    isEmergency: true,
  },
  {
    title: 'Severe Breathlessness (Emergency Test)',
    text: 'Sudden severe difficulty breathing and gasping for air, unable to complete a full sentence.',
    isEmergency: true,
  },
];

export const AIIntake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const [visit, setVisit] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeOptions, setActiveOptions] = useState([]);
  const [currentStep, setCurrentStep] = useState('chief_complaint');
  const [symptomInput, setSymptomInput] = useState('');
  const [precautions, setPrecautions] = useState(null);
  const [showTranscript, setShowTranscript] = useState(true);
  const [isListening, setIsListening] = useState(false);

  // Natural auto-expanding textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 120), 380);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [symptomInput]);

  // Web Speech API voice input
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setSymptomInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        // Voice recognition setup failed gracefully
      }
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      addToast('Speech recognition is not supported in this browser. Please type your symptoms.', 'info');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        addToast('Voice input active. Speak your symptoms clearly...', 'info');
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        setLoading(true);
        const data = await visitService.getVisitDetail(id);
        setVisit(data);
        setMessages(data.messages || []);
        setCurrentStep(data.current_intake_step || 'chief_complaint');

        // Extract existing precautions
        if (data.precautions) {
          setPrecautions(data.precautions);
        } else if (data.summary && data.summary.precautions) {
          setPrecautions(data.summary.precautions);
        } else if (data.messages && data.messages.length > 0) {
          for (let i = data.messages.length - 1; i >= 0; i--) {
            if (data.messages[i].precautions) {
              setPrecautions(data.messages[i].precautions);
              break;
            }
          }
        }

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
    if (!text || !text.trim() || sending) return;

    const trimmed = text.trim();
    const tempUserMsg = {
      id: Date.now(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSending(true);

    try {
      const assistantMsg = await visitService.sendMessage(id, trimmed);
      setMessages((prev) => [...prev, assistantMsg]);
      setCurrentStep(assistantMsg.step || currentStep);
      setActiveOptions(assistantMsg.options || []);

      if (assistantMsg.precautions) {
        setPrecautions(assistantMsg.precautions);
        if (assistantMsg.precautions.is_emergency) {
          addToast('⚠️ Critical emergency symptoms detected. Please review emergency protocol immediately.', 'error');
        } else {
          addToast('Personalized pre-consultation precautions generated.', 'info');
        }
      } else {
        try {
          const directPrecautions = await visitService.analyzePrecautions({ symptoms: trimmed });
          if (directPrecautions) setPrecautions(directPrecautions);
        } catch (e) {
          // Silent fallback
        }
      }

      if (assistantMsg.step === 'complete') {
        addToast('Clinical intake completed! Generating structured SOAP summary.', 'success');
      }
    } catch (err) {
      addToast('Failed to deliver response. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleHorizontalSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!symptomInput.trim() || sending) return;

    const textToSubmit = symptomInput.trim();
    setSymptomInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '120px';
    }
    await handleSendMessage(textToSubmit);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleHorizontalSubmit();
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSymptomInput(suggestion.text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSelectOption = (option) => {
    setSymptomInput((prev) => (prev ? `${prev}, ${option}` : option));
    if (textareaRef.current) {
      textareaRef.current.focus();
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

  // Extract latest inquiry from assistant
  const latestAssistantMsg = messages && messages.length > 0 
    ? [...messages].reverse().find((m) => m.role === 'assistant')
    : null;
  const latestAssistantQuestion = latestAssistantMsg ? latestAssistantMsg.content : null;

  return (
    <PageLayout>
      {/* Top Header Bar */}
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
          <h1 className="curasync-page-header__title">{visit?.title || 'Clinical Consultation Intake'}</h1>
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

      {/* 1. Main Wide Horizontal AI Intake Assistant Card */}
      <div className="curasync-horizontal-intake-card">
        {/* Header with Title and Description */}
        <div className="curasync-horizontal-intake-header">
          <div className="curasync-horizontal-intake-icon">
            <Bot size={26} />
          </div>
          <div className="curasync-horizontal-intake-title-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <h2 className="curasync-horizontal-intake-title">AI Intake Assistant</h2>
              <div className="curasync-intake-disclaimer-badge">
                <ShieldCheck size={14} />
                <span>Non-diagnostic clinical intake</span>
              </div>
            </div>
            <p className="curasync-horizontal-intake-instructions">
              Describe your symptoms, how long you've felt them, severity (1-10), and relevant details below. Carebridge organizes your clinical report, provides conservative pre-consultation precautions, screens for red flags, and compiles a structured SOAP summary for your physician.
            </p>
          </div>
        </div>

        {/* Horizontal Milestone Tracker */}
        <IntakeProgress currentStep={currentStep} variant="horizontal" />

        {/* Current Clinical Question Banner */}
        {latestAssistantQuestion && (
          <div className="curasync-intake-current-prompt">
            <div className="curasync-intake-current-prompt__badge">
              <Sparkles size={14} /> CURRENT CLINICAL INQUIRY
            </div>
            <p className="curasync-intake-current-prompt__text">{latestAssistantQuestion}</p>
          </div>
        )}

        {/* Interactive Option Chips */}
        {activeOptions && activeOptions.length > 0 && !isComplete && (
          <div className="curasync-horizontal-intake-chips" style={{ marginBottom: '0.75rem' }}>
            <span className="curasync-chips-label">Suggested responses:</span>
            {activeOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                className="curasync-intake-chip curasync-intake-chip--active-option"
                onClick={() => handleSelectOption(opt)}
                disabled={sending}
              >
                + {opt}
              </button>
            ))}
          </div>
        )}

        {/* Quick Symptom Profiles */}
        <div className="curasync-horizontal-intake-chips" style={{ marginBottom: '1rem' }}>
          <span className="curasync-chips-label">Common profiles:</span>
          {QUICK_SUGGESTIONS.map((sugg, i) => (
            <button
              key={i}
              type="button"
              className={`curasync-intake-chip ${sugg.isEmergency ? 'curasync-intake-chip--emergency' : ''}`}
              onClick={() => handleSelectSuggestion(sugg)}
              disabled={sending}
            >
              {sugg.title}
            </button>
          ))}
        </div>

        {/* Large Multi-line Symptom Input Area */}
        <form onSubmit={handleHorizontalSubmit} className="curasync-horizontal-intake-form">
          <div className="curasync-horizontal-intake-textarea-wrap">
            <textarea
              ref={textareaRef}
              className="curasync-horizontal-intake-textarea"
              rows={4}
              placeholder="Describe your symptoms in detail — for example: 'Throbbing headache on right side for 3 days, rated 6/10 intensity, aggravated by bright screens and light. Taking paracetamol with mild relief. No fever or vomiting...'"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
          </div>

          {/* Action Row */}
          <div className="curasync-horizontal-intake-actions-bar">
            <div className="curasync-horizontal-intake-left-controls">
              <button
                type="button"
                className={`curasync-voice-btn ${isListening ? 'curasync-voice-btn--active' : ''}`}
                onClick={toggleVoiceInput}
                disabled={sending}
                title="Click to dictate symptoms with your microphone"
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                <span>{isListening ? 'Listening (Speak now)...' : 'Voice Input'}</span>
              </button>

              <span className="curasync-intake-input-hint">
                Press Enter to submit, Shift+Enter for newline
              </span>
            </div>

            <div className="curasync-horizontal-intake-submit-wrap">
              {isComplete ? (
                <Button
                  type="button"
                  variant="accent"
                  size="lg"
                  icon={FileText}
                  onClick={() => navigate(`/patient/visits/${id}`)}
                >
                  View Structured Summary
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  icon={Activity}
                  loading={sending}
                  disabled={!symptomInput.trim() || sending}
                >
                  Analyze Symptoms & Continue
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* 2. Personalized Pre-Consultation Precautions Card */}
      {precautions && (
        <PrecautionGuidanceCard precautions={precautions} />
      )}

      {/* 3. Integrated Full-Width Consultation Stream */}
      {messages && messages.length > 0 && (
        <div className="curasync-intake-stream-container">
          <div className="curasync-intake-stream-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="var(--color-accent-dark)" />
              <h3 className="curasync-intake-stream-title">
                Consultation Dialogue History ({messages.length} messages)
              </h3>
            </div>
            <button
              type="button"
              className="curasync-intake-toggle-btn"
              onClick={() => setShowTranscript(!showTranscript)}
            >
              {showTranscript ? 'Hide Dialogue History' : 'Show Dialogue History'}
            </button>
          </div>

          {showTranscript && (
            <div className="curasync-intake-stream-messages">
              {messages.map((msg, idx) => (
                <ChatMessage key={msg.id || idx} message={msg} />
              ))}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
};
