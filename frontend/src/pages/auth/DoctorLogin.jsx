import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Stethoscope, ArrowRight, Sparkles } from 'lucide-react';
import { Logo } from '../../components/shared/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export const DoctorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleFillDemoDoctor = () => {
    setEmail('doctor@curasync.com');
    setPassword('Doctor@123');
    setError('');
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@curasync.com');
    setPassword('Admin@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profile = await loginWithPassword(email, password);
      addToast(`Welcome, ${profile.name}`, 'success');
      if (profile.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/doctor/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="curasync-auth-page">
      <div className="curasync-auth-card">
        <div className="curasync-auth-card__header">
          <Logo size="md" to="/" />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0369A1', marginTop: '1rem', fontWeight: '700', fontSize: '0.8rem', background: '#E0F2FE', padding: '3px 10px', borderRadius: '9999px' }}>
            <Stethoscope size={14} /> HEALTHCARE CLINICAL PORTAL
          </div>
          <h2 className="curasync-auth-card__title">Provider Authentication</h2>
          <p className="curasync-auth-card__subtitle">
            Sign in to access patient-authorized clinical records
          </p>
        </div>

        {/* Demo Fast Fills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' }}>
          <div className="curasync-auth-demo-box" onClick={handleFillDemoDoctor} style={{ margin: 0 }}>
            <div className="curasync-auth-demo-header">
              <Sparkles size={14} />
              <span>SIH DEMO: DOCTOR LOGIN</span>
            </div>
            <p>Click to auto-fill: <strong>doctor@curasync.com</strong> / <strong>Doctor@123</strong></p>
          </div>

          <div className="curasync-auth-demo-box" onClick={handleFillDemoAdmin} style={{ margin: 0, backgroundColor: '#FAF5FF', borderColor: '#DDD6FE' }}>
            <div className="curasync-auth-demo-header" style={{ color: '#7C3AED' }}>
              <Sparkles size={14} />
              <span>SIH DEMO: ADMIN LOGIN</span>
            </div>
            <p style={{ color: '#6D28D9' }}>Click to auto-fill: <strong>admin@curasync.com</strong> / <strong>Admin@123</strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="curasync-auth-form">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="doctor@hospital.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="curasync-input-error">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Access Clinical Workspace
          </Button>
        </form>

        <div className="curasync-auth-footer">
          <Link to="/login" className="curasync-auth-link">
            ← Back to Patient Login
          </Link>
        </div>
      </div>
    </div>
  );
};
