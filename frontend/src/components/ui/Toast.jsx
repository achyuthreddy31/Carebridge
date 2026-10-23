import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} className="curasync-toast__icon curasync-toast__icon--success" />;
      case 'warning': return <AlertTriangle size={18} className="curasync-toast__icon curasync-toast__icon--warning" />;
      case 'error': return <AlertCircle size={18} className="curasync-toast__icon curasync-toast__icon--error" />;
      default: return <Info size={18} className="curasync-toast__icon curasync-toast__icon--info" />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="curasync-toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`curasync-toast curasync-toast--${t.type}`}>
            {getIcon(t.type)}
            <span className="curasync-toast__msg">{t.message}</span>
            <button
              type="button"
              className="curasync-toast__close"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
