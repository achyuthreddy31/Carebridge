import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../shared/Logo';
import { 
  LogOut, 
  User as UserIcon, 
  Shield, 
  Stethoscope, 
  Menu, 
  X, 
  LayoutDashboard, 
  Clock, 
  FileText, 
  Bot, 
  Share2, 
  History, 
  ShieldCheck 
} from 'lucide-react';
import './Navbar.css';

const PATIENT_NAV_ITEMS = [
  { section: 'CLINICAL WALLET' },
  { path: '/patient/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { path: '/patient/timeline', label: 'Medical Timeline', icon: Clock },
  { path: '/patient/reports', label: 'Diagnostic Records', icon: FileText },
  
  { section: 'AI INTELLIGENCE' },
  { path: '/patient/new-visit', label: 'AI Intake Assistant', icon: Bot, badge: 'Smart' },
  
  { section: 'SECURITY & CONTROL' },
  { path: '/patient/share', label: 'Temporary Doctor Access', icon: Share2 },
  { path: '/patient/access-history', label: 'Access Audit History', icon: History },
  { path: '/patient/profile', label: 'Personal Health Profile', icon: UserIcon },
];

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadge = () => {
    if (role === 'doctor') {
      return (
        <span className="curasync-nav-role curasync-nav-role--doctor">
          <Stethoscope size={13} /> Healthcare Provider
        </span>
      );
    }
    if (role === 'admin') {
      return (
        <span className="curasync-nav-role curasync-nav-role--admin">
          <Shield size={13} /> System Admin
        </span>
      );
    }
    return (
      <span className="curasync-nav-role curasync-nav-role--patient">
        <UserIcon size={13} /> Patient Owner
      </span>
    );
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="curasync-header">
      <div className="curasync-header__inner">
        <div className="curasync-header__left">
          {user && (
            <button
              type="button"
              className="curasync-header__mobile-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation"
              title="Open menu"
            >
              <Menu size={22} />
            </button>
          )}

          <div className="curasync-header__brand">
            <Logo size="md" to={role === 'doctor' ? '/doctor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/patient/dashboard'} />
          </div>
        </div>

        <div className="curasync-header__right">
          {user && (
            <div className="curasync-header__user-menu">
              <div className="curasync-header__user-info">
                <span className="curasync-header__user-name">{user.name}</span>
                {getRoleBadge()}
              </div>

              <button
                type="button"
                className="curasync-header__logout-btn"
                onClick={logout}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="curasync-mobile-drawer-backdrop" onClick={closeMenu}>
          <div className="curasync-mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="curasync-mobile-drawer__header">
              <Logo size="sm" to="/patient/dashboard" />
              <button
                type="button"
                className="curasync-mobile-drawer__close"
                onClick={closeMenu}
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>

            {user && (
              <div className="curasync-mobile-drawer__user-card">
                <div className="curasync-mobile-drawer__user-avatar">
                  <UserIcon size={20} />
                </div>
                <div className="curasync-mobile-drawer__user-meta">
                  <strong>{user.name}</strong>
                  {getRoleBadge()}
                </div>
              </div>
            )}

            <div className="curasync-mobile-drawer__nav">
              {role === 'patient' && PATIENT_NAV_ITEMS.map((item, idx) => {
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
                    onClick={closeMenu}
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

              {role === 'doctor' && (
                <>
                  <div className="curasync-sidebar__section-heading">PRACTICE</div>
                  <NavLink
                    to="/doctor/dashboard"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `curasync-sidebar__link ${isActive ? 'curasync-sidebar__link--active' : ''}`
                    }
                  >
                    <Stethoscope size={18} className="curasync-sidebar__icon" />
                    <span className="curasync-sidebar__label">Doctor Dashboard</span>
                  </NavLink>
                </>
              )}

              {role === 'admin' && (
                <>
                  <div className="curasync-sidebar__section-heading">GOVERNANCE</div>
                  <NavLink
                    to="/admin/dashboard"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `curasync-sidebar__link ${isActive ? 'curasync-sidebar__link--active' : ''}`
                    }
                  >
                    <Shield size={18} className="curasync-sidebar__icon" />
                    <span className="curasync-sidebar__label">System Administration</span>
                  </NavLink>
                </>
              )}
            </div>

            <div className="curasync-mobile-drawer__footer">
              <div className="curasync-sidebar__privacy-guarantee" style={{ marginBottom: '12px' }}>
                <ShieldCheck size={18} className="curasync-sidebar__shield" />
                <div className="curasync-sidebar__guarantee-text">
                  <strong>Patient-Owned Data</strong>
                  <span>Zero unauthorized sharing</span>
                </div>
              </div>

              <button
                type="button"
                className="curasync-btn curasync-btn--outline curasync-btn--full curasync-btn--sm"
                onClick={() => {
                  closeMenu();
                  logout();
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
