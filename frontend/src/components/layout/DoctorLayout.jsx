import React from 'react';
import { Navbar } from './Navbar';
import './PageLayout.css';

export const DoctorLayout = ({ children }) => {
  return (
    <div className="curasync-page-layout">
      <Navbar />
      <main className="curasync-page-layout__content" style={{ paddingBottom: '3rem' }}>
        <div className="curasync-page-layout__content-inner" style={{ maxWidth: '1240px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};
