import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, ShieldCheck, Sparkles } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { Button } from '../ui/Button';
import './ChatWindow.css';

export const ChatWindow = ({
  messages = [],
  onSendMessage,
  activeOptions = [],
  loading = false,
  isComplete = false,
  onComplete,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleChipClick = (option) => {
    if (loading) return;
    onSendMessage(option);
  };

  return (
    <div className="curasync-chat-window">
      {/* Branded Clinical Intake Header */}
      <div className="curasync-chat-window__header">
        <div className="curasync-chat-window__header-left">
          <div className="curasync-chat-window__bot-avatar">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="curasync-chat-window__title">AI Intake Assistant</h3>
            <p className="curasync-chat-window__subtitle">"Let's prepare your visit."</p>
          </div>
        </div>

        <div className="curasync-chat-window__disclaimer-pill">
          <ShieldCheck size={14} />
          <span>Non-diagnostic intake</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="curasync-chat-window__messages">
        {messages.map((msg, idx) => (
          <ChatMessage key={msg.id || idx} message={msg} />
        ))}

        {loading && (
          <div className="curasync-chat-window__typing">
            <div className="curasync-chat-window__typing-dot" />
            <div className="curasync-chat-window__typing-dot" />
            <div className="curasync-chat-window__typing-dot" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Option Chips */}
      {activeOptions && activeOptions.length > 0 && !isComplete && (
        <div className="curasync-chat-window__chips-bar">
          <span className="curasync-chat-window__chips-hint">Suggested responses:</span>
          <div className="curasync-chat-window__chips">
            {activeOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                className="curasync-chat-chip"
                onClick={() => handleChipClick(opt)}
                disabled={loading}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Complete State CTA */}
      {isComplete && onComplete && (
        <div className="curasync-chat-window__complete-banner">
          <div className="curasync-chat-window__complete-text">
            <Sparkles size={18} className="curasync-chat-window__sparkle" />
            <span>Consultation questions completed. Ready to compile structured summary.</span>
          </div>
          <Button variant="accent" onClick={onComplete}>
            View Structured Visit Summary
          </Button>
        </div>
      )}

      {/* Chat Input Bar */}
      {!isComplete && (
        <form className="curasync-chat-window__input-bar" onSubmit={handleSubmit}>
          <textarea
            placeholder="Type your response or select an option above (Shift+Enter for newline)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={loading}
            rows={2}
            className="curasync-chat-window__textarea"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="curasync-chat-window__send-btn"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
};
