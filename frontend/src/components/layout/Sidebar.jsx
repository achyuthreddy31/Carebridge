import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Clock, 
  Bot, 
  Share2, 
  History, 
  User,
  ShieldCheck
} from 'lucide-react';
import './Sidebar.css';

const NAV_ITEMS = [
  { section: 'CLINICAL WALLET' },
  { path: '/patient/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { path: '/patient/timeline', label: 'Medical Timeline', icon: Clock },
  { path: '/patient/reports', label: 'Diagnostic Records', icon: FileText },
  
  { section: 'AI INTELLIGENCE' },
  { path: '/patient/new-visit', label: 'AI Intake Assistant', icon: Bot, badge: 'Smart' },
  
  { section: 'SECURITY & CONTROL' },
  { path: '/patient/share', label: 'Temporary Doctor Access', icon: Share2 },
  { path: '/patient/access-history', label: 'Access Audit History', icon: History },
  { path: '/patient/profile', label: 'Personal Health Profile', icon: User },
];

export const Sidebar = () => {
  return (
    <aside className="curasync-sidebar">
      <div className="curasync-sidebar__nav">
        {NAV_ITEMS.map((item, idx) => {
          if (item.section) {
            return (
              <div key={idx} className="curasync-sidebar__section-heading">
                {item.section}
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `curasync-sidebar__link ${isActive ? 'curasync-sidebar__link--active' : ''}`
              }
            >
              <Icon size={18} className="curasync-sidebar__icon" />
              <span className="curasync-sidebar__label">{item.label}</span>
              {item.badge && <span className="curasync-sidebar__badge">{item.badge}</span>}
            </NavLink>
          );
        })}
      </div>

      <div className="curasync-sidebar__footer">
        <div className="curasync-sidebar__privacy-guarantee">
          <ShieldCheck size={18} className="curasync-sidebar__shield" />
          <div className="curasync-sidebar__guarantee-text">
            <strong>Patient-Owned</strong>
            <span>Zero unauthorized sharing</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
