import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const AppLoader = ({ label = 'Restoring secure session' }) => (
  <div className="curasync-app-loader" role="status" aria-live="polite">
    <Loader2 size={28} className="curasync-app-loader__spin" />
    <p>{label}</p>
  </div>
);

const homeForRole = (role) => {
  if (role === 'doctor') return '/doctor/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/patient/dashboard';
};

const loginForRoles = (roles = []) => {
  if (roles.includes('doctor') || roles.includes('admin')) return '/doctor/login';
  return '/login';
};

export const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) return <AppLoader />;
  if (!isAuthenticated) return <Navigate to={loginForRoles(roles)} replace />;
  if (roles?.length && !roles.includes(role)) {
    return <Navigate to={homeForRole(role)} replace />;
  }

  return <Outlet />;
};

export const GuestOnly = () => {
  const { isAuthenticated, loading, role } = useAuth();
  if (loading) return <AppLoader />;
  if (isAuthenticated) return <Navigate to={homeForRole(role)} replace />;
  return <Outlet />;
};
