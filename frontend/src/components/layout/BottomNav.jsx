import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Bot, Share2, User } from 'lucide-react';
import './BottomNav.css';

export const BottomNav = () => {
  const tabs = [
    { path: '/patient/dashboard', label: 'Home', icon: LayoutDashboard },
    { path: '/patient/timeline', label: 'Records', icon: FileText },
    { path: '/patient/new-visit', label: 'AI Intake', icon: Bot, isHighlight: true },
    { path: '/patient/share', label: 'Share', icon: Share2 },
    { path: '/patient/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="curasync-bottom-nav" aria-label="Mobile Navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `curasync-bottom-nav__item ${isActive ? 'curasync-bottom-nav__item--active' : ''} ${tab.isHighlight ? 'curasync-bottom-nav__item--highlight' : ''}`
            }
          >
            <div className="curasync-bottom-nav__icon-wrap">
              <Icon size={20} />
            </div>
            <span className="curasync-bottom-nav__label">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
