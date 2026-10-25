import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';

// Public & Auth Pages
import { Landing } from './pages/Landing';
import { PatientLogin } from './pages/auth/PatientLogin';
import { PatientRegister } from './pages/auth/PatientRegister';
import { OTPVerification } from './pages/auth/OTPVerification';
import { DoctorLogin } from './pages/auth/DoctorLogin';

// Patient Pages
import { Dashboard } from './pages/patient/Dashboard';
import { Profile } from './pages/patient/Profile';
import { Reports } from './pages/patient/Reports';
import { ReportUpload } from './pages/patient/ReportUpload';
import { ReportDetail } from './pages/patient/ReportDetail';
import { Timeline } from './pages/patient/Timeline';
import { NewVisit } from './pages/patient/NewVisit';
import { AIIntake } from './pages/patient/AIIntake';
import { VisitDetail } from './pages/patient/VisitDetail';
import { SecureShare } from './pages/patient/SecureShare';
import { AccessHistory } from './pages/patient/AccessHistory';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorPatientWorkspace } from './pages/doctor/DoctorPatientWorkspace';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Route Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="curasync-app-loader">
        <div className="curasync-app-loader__spin">Loading Carebridge...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (allowedRoles.includes('doctor')) {
      return <Navigate to="/doctor/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to proper role dashboard
    if (user?.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PatientLogin />} />
            <Route path="/register" element={<PatientRegister />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/doctor/login" element={<DoctorLogin />} />

            {/* Patient Routes */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/profile"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/reports"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/upload"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <ReportUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/reports/:id"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <ReportDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/timeline"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Timeline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/new-visit"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <NewVisit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/visits/:id/chat"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <AIIntake />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/visits/:id"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <VisitDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/share"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <SecureShare />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/access-history"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <AccessHistory />
                </ProtectedRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patient/:tokenId"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorPatientWorkspace />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
