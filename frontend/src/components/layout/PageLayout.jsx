import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import './PageLayout.css';

export const PageLayout = ({ children, hideSidebar = false }) => {
  return (
    <div className="curasync-page-layout">
      <Navbar />
      <div className="curasync-page-layout__main">
        {!hideSidebar && <Sidebar />}
        <main className="curasync-page-layout__content">
          <div className="curasync-page-layout__content-inner">
            {children}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
