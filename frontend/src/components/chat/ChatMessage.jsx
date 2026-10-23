import React from 'react';
import { Bot, User, AlertTriangle } from 'lucide-react';
import './ChatMessage.css';

export const ChatMessage = ({ message }) => {
  const isAssistant = message.role === 'assistant';
  const isUser = message.role === 'user';
  const isRedFlag = message.is_red_flag;

  return (
    <div className={`curasync-chat-msg ${isAssistant ? 'curasync-chat-msg--assistant' : 'curasync-chat-msg--user'}`}>
      <div className="curasync-chat-msg__avatar">
        {isAssistant ? (
          <Bot size={18} className="curasync-chat-msg__bot-icon" />
        ) : (
          <User size={18} className="curasync-chat-msg__user-icon" />
        )}
      </div>

      <div className="curasync-chat-msg__bubble-wrap">
        <div className={`curasync-chat-msg__bubble ${isRedFlag ? 'curasync-chat-msg__bubble--red-flag' : ''}`}>
          {isRedFlag && (
            <div className="curasync-chat-msg__red-flag-notice">
              <AlertTriangle size={16} />
              <span>POSSIBLE URGENT SYMPTOM IDENTIFIED</span>
            </div>
          )}

          <div className="curasync-chat-msg__text">
            {message.content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        <span className="curasync-chat-msg__time">
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
        </span>
      </div>
    </div>
  );
};
