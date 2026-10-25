import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, RotateCw } from 'lucide-react';
import { Logo } from '../../components/shared/Logo';
import { Button } from '../../components/ui/Button';
import { OTPInput } from '../../components/ui/OTPInput';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth';
import './Auth.css';

export const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithOTP } = useAuth();
  const { addToast } = useToast();

  const phone = location.state?.phone || '9876543210';
  const initialDemoOtp = location.state?.demoOtp || '123456';

  const [otp, setOtp] = useState(initialDemoOtp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await loginWithOTP(phone, otp);
      addToast('Secure session established. Welcome to Carebridge!', 'success');
      navigate('/patient/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid or expired OTP code.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const data = await authService.sendOTP(phone, 'login');
      if (data.demo_otp) {
        setOtp(data.demo_otp);
      }
      addToast('New verification code dispatched.', 'info');
    } catch (err) {
      addToast('Failed to resend code.', 'error');
    }
  };

  return (
    <div className="curasync-auth-page">
      <div className="curasync-auth-card">
        <div className="curasync-auth-card__header">
          <Logo size="md" to="/" />
          <h2 className="curasync-auth-card__title">Enter 6-Digit OTP</h2>
          <p className="curasync-auth-card__subtitle">
            Dispatched to +91 {phone.slice(0, 3)}***{phone.slice(-2)}
          </p>
        </div>

        {/* Demo Helper Pill */}
        <div className="curasync-auth-demo-box">
          <p>
            Your demo verification code is <strong>{initialDemoOtp}</strong> (Auto-filled for testing)
          </p>
        </div>

        <form onSubmit={handleVerify} className="curasync-auth-form">
          <OTPInput
            length={6}
            value={otp}
            onChange={(val) => {
              setOtp(val);
              setError('');
            }}
            error={!!error}
          />

          {error && <p className="curasync-input-error" style={{ textAlign: 'center' }}>{error}</p>}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            fullWidth
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Verify & Enter Health Wallet
          </Button>
        </form>

        <div className="curasync-auth-footer">
          <button
            type="button"
            className="curasync-btn curasync-btn--ghost curasync-btn--sm"
            onClick={handleResend}
            style={{ margin: '0 auto', display: 'flex', gap: '6px' }}
          >
            <RotateCw size={14} />
            <span>Resend Code</span>
          </button>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/login" className="curasync-auth-link">
              ← Change mobile number
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
