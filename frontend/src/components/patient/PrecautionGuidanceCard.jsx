import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  PhoneCall, 
  Clock, 
  ArrowRight, 
  HeartHandshake,
  Activity,
  FileQuestion,
  ShieldCheck
} from 'lucide-react';
import { Card } from '../ui/Card';
import './PrecautionGuidanceCard.css';

export const PrecautionGuidanceCard = ({ precautions, className = '' }) => {
  if (!precautions) return null;

  const isEmergency = precautions.is_emergency || precautions.urgency_level === 'emergency';
  const urgency = precautions.urgency_level || (isEmergency ? 'emergency' : 'routine');

  const getUrgencyBadge = () => {
    switch (urgency) {
      case 'emergency':
        return (
          <span className="curasync-precaution-badge curasync-precaution-badge--emergency">
            <PhoneCall size={14} /> EMERGENCY CARE NOW (CALL 112)
          </span>
        );
      case 'urgent':
        return (
          <span className="curasync-precaution-badge curasync-precaution-badge--urgent">
            <AlertTriangle size={14} /> URGENT MEDICAL ASSESSMENT
          </span>
        );
      case 'prompt':
        return (
          <span className="curasync-precaution-badge curasync-precaution-badge--prompt">
            <Clock size={14} /> PROMPT APPOINTMENT (24-48H)
          </span>
        );
      default:
        return (
          <span className="curasync-precaution-badge curasync-precaution-badge--routine">
            <ShieldCheck size={14} /> ROUTINE PRE-CONSULTATION
          </span>
        );
    }
  };

  return (
    <div className={`curasync-precaution-container ${isEmergency ? 'curasync-precaution-container--emergency' : ''} ${className}`}>
      {/* Emergency Priority Alert Banner */}
      {isEmergency && (
        <div className="curasync-emergency-banner" role="alert">
          <div className="curasync-emergency-banner__icon">
            <PhoneCall size={28} />
          </div>
          <div className="curasync-emergency-banner__content">
            <div className="curasync-emergency-banner__tag">CRITICAL MEDICAL EMERGENCY PROTOCOL</div>
            <h3 className="curasync-emergency-banner__title">Immediate Emergency Medical Attention Required</h3>
            <p className="curasync-emergency-banner__desc">
              Your reported symptoms suggest a potentially life-threatening clinical situation. 
              <strong> Do NOT delay seeking emergency hospital care to wait for an AI response or complete an online form.</strong>
            </p>
            <div className="curasync-emergency-banner__action">
              <a href="tel:112" className="curasync-emergency-banner__btn">
                <PhoneCall size={18} /> DIAL 112 (INDIA EMERGENCY HELPLINE)
              </a>
              <span className="curasync-emergency-banner__subnote">
                Or proceed immediately to the nearest hospital emergency department (Casualty).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Precaution Card */}
      <Card variant="bordered" padding="lg" className="curasync-precaution-card">
        {/* Header */}
        <div className="curasync-precaution-card__header">
          <div className="curasync-precaution-card__title-group">
            <div className="curasync-precaution-card__icon-wrap">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="curasync-precaution-card__title">
                Personalized Pre-Consultation Precautions
              </h3>
              <p className="curasync-precaution-card__subtitle">
                Conservative guidance while arranging appropriate clinical evaluation
              </p>
            </div>
          </div>
          <div className="curasync-precaution-card__badge-wrap">
            {getUrgencyBadge()}
          </div>
        </div>

        {/* Section A: Understanding Reported Symptoms */}
        {precautions.understanding && (
          <div className="curasync-precaution-section curasync-precaution-section--understanding">
            <div className="curasync-precaution-section__header">
              <Info size={18} className="curasync-precaution-icon curasync-precaution-icon--info" />
              <h4>A. Understanding the Reported Symptoms</h4>
            </div>
            <div className="curasync-precaution-section__body">
              <p className="curasync-precaution-understanding-text">
                {precautions.understanding.summary}
              </p>
              {precautions.understanding.missing_information && (
                <div className="curasync-precaution-missing-alert">
                  <FileQuestion size={16} />
                  <span>{precautions.understanding.missing_information}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="curasync-precaution-grid">
          {/* Section B: Precautions to Follow */}
          {precautions.precautions && precautions.precautions.length > 0 && (
            <div className="curasync-precaution-section curasync-precaution-section--dos">
              <div className="curasync-precaution-section__header">
                <CheckCircle2 size={18} className="curasync-precaution-icon curasync-precaution-icon--success" />
                <h4>B. Precautions to Follow</h4>
              </div>
              <ul className="curasync-precaution-list">
                {precautions.precautions.map((item, idx) => (
                  <li key={idx} className="curasync-precaution-item">
                    <span className="curasync-precaution-item__dot curasync-precaution-item__dot--success">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section C: Things to Avoid */}
          {precautions.things_to_avoid && precautions.things_to_avoid.length > 0 && (
            <div className="curasync-precaution-section curasync-precaution-section--donts">
              <div className="curasync-precaution-section__header">
                <XCircle size={18} className="curasync-precaution-icon curasync-precaution-icon--danger" />
                <h4>C. Things to Avoid</h4>
              </div>
              <ul className="curasync-precaution-list">
                {precautions.things_to_avoid.map((item, idx) => (
                  <li key={idx} className="curasync-precaution-item">
                    <span className="curasync-precaution-item__dot curasync-precaution-item__dot--danger">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Section D: Warning Signs to Watch For */}
        {precautions.warning_signs && precautions.warning_signs.length > 0 && (
          <div className="curasync-precaution-section curasync-precaution-section--warnings">
            <div className="curasync-precaution-section__header">
              <AlertTriangle size={18} className="curasync-precaution-icon curasync-precaution-icon--warning" />
              <h4>D. Warning Signs That Require Prompt Medical Care</h4>
            </div>
            <ul className="curasync-precaution-list">
              {precautions.warning_signs.map((item, idx) => (
                <li key={idx} className="curasync-precaution-item curasync-precaution-item--warning">
                  <AlertTriangle size={15} className="curasync-warning-bullet" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section E: Recommended Next Step */}
        {precautions.recommended_next_step && (
          <div className="curasync-precaution-section curasync-precaution-section--nextstep">
            <div className="curasync-precaution-section__header">
              <ArrowRight size={18} className="curasync-precaution-icon curasync-precaution-icon--step" />
              <h4>E. Recommended Next Step</h4>
            </div>
            <div className="curasync-precaution-nextstep-box">
              <p className="curasync-precaution-nextstep-text">
                {precautions.recommended_next_step}
              </p>
            </div>
          </div>
        )}

        {/* Medical Safety Disclaimer Footer */}
        <div className="curasync-precaution-disclaimer">
          <ShieldAlert size={16} />
          <span>
            <strong>Healthcare Safety Notice:</strong> This pre-consultation guidance is provided for informational and clinical preparation purposes only. It is not a medical diagnosis or treatment plan, and serious conditions have not been ruled out. Always consult a qualified physician for clinical evaluation.
          </span>
        </div>
      </Card>
    </div>
  );
};
