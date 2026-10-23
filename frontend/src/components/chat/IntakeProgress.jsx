import React from 'react';
import { Check, Circle } from 'lucide-react';
import './IntakeProgress.css';

const INTAKE_STEPS = [
  { id: 'chief_complaint', label: 'Chief Complaint' },
  { id: 'symptom_details', label: 'Symptom Details' },
  { id: 'duration', label: 'Duration & Onset' },
  { id: 'severity', label: 'Severity Scale' },
  { id: 'medical_history', label: 'Medical History' },
  { id: 'current_medications', label: 'Medications' },
  { id: 'allergies', label: 'Allergies' },
  { id: 'red_flag_check', label: 'Urgent Red Flags' },
  { id: 'complete', label: 'Structured Summary' },
];

export const IntakeProgress = ({ currentStep = 'chief_complaint' }) => {
  const currentIndex = INTAKE_STEPS.findIndex((s) => s.id === currentStep);
  const activeIdx = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="curasync-intake-progress">
      <div className="curasync-intake-progress__header">
        <span className="curasync-intake-progress__eyebrow">CONSULTATION PREPARATION</span>
        <h4 className="curasync-intake-progress__title">Intake Milestones</h4>
      </div>

      <div className="curasync-intake-progress__steps">
        {INTAKE_STEPS.map((step, idx) => {
          const isDone = idx < activeIdx || currentStep === 'complete';
          const isCurrent = idx === activeIdx && currentStep !== 'complete';

          return (
            <div
              key={step.id}
              className={`curasync-intake-progress__step ${isDone ? 'curasync-intake-progress__step--done' : ''} ${isCurrent ? 'curasync-intake-progress__step--current' : ''}`}
            >
              <div className="curasync-intake-progress__marker">
                {isDone ? (
                  <Check size={12} className="curasync-intake-progress__check" />
                ) : isCurrent ? (
                  <div className="curasync-intake-progress__dot animate-pulse-glow" />
                ) : (
                  <Circle size={8} className="curasync-intake-progress__circle" />
                )}
              </div>
              <span className="curasync-intake-progress__label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
