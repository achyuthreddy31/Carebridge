import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../shared/Logo';
import { LogOut, User as UserIcon, Shield, Stethoscope } from 'lucide-react';
import './Navbar.css';

export const Navbar = () => {
  const { user, role, logout } = useAuth();

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

  return (
    <header className="curasync-header">
      <div className="curasync-header__inner">
        <div className="curasync-header__brand">
          <Logo size="md" to={role === 'doctor' ? '/doctor/dashboard' : role === 'admin' ? '/admin/dashboard' : '/patient/dashboard'} />
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
    </header>
  );
};
