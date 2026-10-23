import React from 'react';

export const PageHeader = ({ eyebrow, title, description, actions }) => (
  <header className="curasync-page-header animate-fade-in">
    <div className="curasync-page-header__copy">
      {eyebrow && <p className="curasync-page-header__eyebrow">{eyebrow}</p>}
      <h1 className="curasync-page-header__title">{title}</h1>
      {description && <p className="curasync-page-header__desc">{description}</p>}
    </div>
    {actions && <div className="curasync-page-header__actions">{actions}</div>}
  </header>
);
