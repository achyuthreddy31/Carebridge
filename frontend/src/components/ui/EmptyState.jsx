import React from 'react';
import { Button } from './Button';
import './EmptyState.css';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className = '',
}) => {
  return (
    <div className={`curasync-empty-state ${className}`}>
      {Icon && (
        <div className="curasync-empty-state__icon-wrap">
          <Icon size={36} className="curasync-empty-state__icon" />
        </div>
      )}
      <h3 className="curasync-empty-state__title">{title}</h3>
      {description && <p className="curasync-empty-state__desc">{description}</p>}
      {actionLabel && onAction && (
        <div className="curasync-empty-state__action">
          <Button variant="accent" onClick={onAction} icon={ActionIcon}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
