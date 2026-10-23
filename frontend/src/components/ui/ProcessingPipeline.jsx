import React from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';
import './ProcessingPipeline.css';

const STAGES = [
  { id: 'uploaded', label: 'Document Received' },
  { id: 'ocr_processing', label: 'OCR Processing' },
  { id: 'ocr_completed', label: 'Text Structured' },
  { id: 'ai_extracting', label: 'AI Extraction' },
  { id: 'completed', label: 'Saving to Timeline' },
];

export const ProcessingPipeline = ({ currentStatus = 'uploaded', error = null }) => {
  // Map backend status to pipeline stage index
  const getStageIndex = (status) => {
    switch (status) {
      case 'uploaded': return 0;
      case 'ocr_processing': return 1;
      case 'ocr_completed': return 2;
      case 'ai_extracting': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  const activeIndex = getStageIndex(currentStatus);
  const isCompleted = currentStatus === 'completed';

  return (
    <div className="curasync-pipeline">
      <div className="curasync-pipeline__track">
        {STAGES.map((stage, idx) => {
          let state = 'pending'; // completed, active, pending
          if (idx < activeIndex || isCompleted) {
            state = 'completed';
          } else if (idx === activeIndex && !isCompleted) {
            state = 'active';
          }

          return (
            <div key={stage.id} className={`curasync-pipeline__stage curasync-pipeline__stage--${state}`}>
              <div className="curasync-pipeline__indicator">
                {state === 'completed' ? (
                  <Check size={16} className="curasync-pipeline__icon curasync-pipeline__icon--done" />
                ) : state === 'active' ? (
                  <Loader2 size={16} className="curasync-pipeline__icon curasync-pipeline__icon--spin" />
                ) : (
                  <Circle size={10} className="curasync-pipeline__icon curasync-pipeline__icon--dim" />
                )}
              </div>
              <span className="curasync-pipeline__label">{stage.label}</span>
              {idx < STAGES.length - 1 && <div className="curasync-pipeline__connector" />}
            </div>
          );
        })}
      </div>
      {error && (
        <div className="curasync-pipeline__error">
          <span>Processing interrupted: {error}</span>
        </div>
      )}
    </div>
  );
};
