import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, HeartPulse, User } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import './VisitSummaryCard.css';

export const VisitSummaryCard = ({ summary, redFlags = [], patientDescription = null }) => {
  if (!summary) return null;

  return (
    <div className="curasync-visit-summary">
      {/* Patient Ownership & Disclaimer Banner */}
      <div className="curasync-visit-summary__disclaimer-banner">
        <ShieldCheck size={16} className="curasync-visit-summary__shield-icon" />
        <div className="curasync-visit-summary__disclaimer-text">
          <strong>Pre-Consultation Intake Record</strong>
          <span>
            Verified patient self-reported information organized by Carebridge AI. Not a medical diagnosis.
          </span>
        </div>
      </div>

      {/* Red Flags Alert if detected */}
      {redFlags && redFlags.length > 0 && (
        <div className="curasync-visit-summary__red-flags">
          <div className="curasync-visit-summary__red-flag-header">
            <AlertTriangle size={18} className="curasync-visit-summary__warning-icon" />
            <h4>POTENTIAL URGENT SYMPTOMS FLAGGED</h4>
          </div>
          <p className="curasync-visit-summary__red-flag-sub">
            The patient mentioned symptoms requiring prompt clinical triage during consultation:
          </p>
          <ul className="curasync-visit-summary__red-flag-list">
            {redFlags.map((flag, idx) => (
              <li key={idx}>
                <strong>{flag.symptom || flag.label}</strong>: {flag.note || 'Requires prompt clinical review.'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SOAP Structured Grid */}
      <Card variant="default" padding="lg" className="curasync-visit-summary__card">
        <div className="curasync-visit-summary__section">
          <span className="curasync-visit-summary__label">CHIEF COMPLAINT</span>
          <p className="curasync-visit-summary__value curasync-visit-summary__value--primary">
            {summary.chief_complaint || 'General Consultation Intake'}
          </p>
        </div>

        <div className="curasync-visit-summary__grid-row">
          <div className="curasync-visit-summary__cell">
            <span className="curasync-visit-summary__label">ONSET & PATTERN</span>
            <p className="curasync-visit-summary__value">{summary.onset || 'Gradual onset'}</p>
          </div>
          <div className="curasync-visit-summary__cell">
            <span className="curasync-visit-summary__label">DURATION</span>
            <p className="curasync-visit-summary__value">{summary.duration || 'Not specified'}</p>
          </div>
          <div className="curasync-visit-summary__cell">
            <span className="curasync-visit-summary__label">SEVERITY RATING</span>
            <p className="curasync-visit-summary__value">
              <Badge variant="warning" size="sm">{summary.severity || 'Moderate'}</Badge>
            </p>
          </div>
        </div>

        {summary.associated_symptoms && summary.associated_symptoms.length > 0 && (
          <div className="curasync-visit-summary__section">
            <span className="curasync-visit-summary__label">ASSOCIATED SYMPTOMS</span>
            <div className="curasync-visit-summary__tags">
              {summary.associated_symptoms.map((sym, idx) => (
                <span key={idx} className="curasync-visit-summary__tag">{sym}</span>
              ))}
            </div>
          </div>
        )}

        <div className="curasync-visit-summary__grid-row">
          <div className="curasync-visit-summary__cell">
            <span className="curasync-visit-summary__label">PAST MEDICAL CONDITIONS</span>
            {summary.past_medical_history && summary.past_medical_history.length > 0 ? (
              <div className="curasync-visit-summary__tags">
                {summary.past_medical_history.map((h, idx) => (
                  <span key={idx} className="curasync-visit-summary__tag">{h}</span>
                ))}
              </div>
            ) : (
              <p className="curasync-visit-summary__muted">No chronic conditions declared</p>
            )}
          </div>

          <div className="curasync-visit-summary__cell">
            <span className="curasync-visit-summary__label">CURRENT MEDICATIONS</span>
            {summary.current_medications && summary.current_medications.length > 0 ? (
              <div className="curasync-visit-summary__tags">
                {summary.current_medications.map((m, idx) => (
                  <span key={idx} className="curasync-visit-summary__tag">{m}</span>
                ))}
              </div>
            ) : (
              <p className="curasync-visit-summary__muted">None reported</p>
            )}
          </div>

          <div className="curasync-visit-summary__cell">
            <span className="curasync-visit-summary__label">KNOWN ALLERGIES</span>
            {summary.allergies && summary.allergies.length > 0 ? (
              <div className="curasync-visit-summary__tags">
                {summary.allergies.map((a, idx) => (
                  <span key={idx} className="curasync-visit-summary__tag curasync-visit-summary__tag--alert">{a}</span>
                ))}
              </div>
            ) : (
              <p className="curasync-visit-summary__muted">No known allergies</p>
            )}
          </div>
        </div>

        {/* Patient's Own Words */}
        <div className="curasync-visit-summary__patient-words">
          <div className="curasync-visit-summary__patient-words-header">
            <User size={14} />
            <span>PATIENT'S DIRECT DESCRIPTION</span>
          </div>
          <p className="curasync-visit-summary__patient-quote">
            "{patientDescription || summary.patient_own_description || summary.symptom_description || 'Patient completed structured digital intake.'}"
          </p>
        </div>
      </Card>
    </div>
  );
};
