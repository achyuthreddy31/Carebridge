import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import { Logo } from '../../components/shared/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { authService } from '../../services/auth';
import './Auth.css';

export const PatientLogin = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setPhone('9876543210');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.sendOTP(cleanPhone, 'login');
      addToast(data.message, 'success');
      navigate('/verify-otp', {
        state: {
          phone: cleanPhone,
          demoOtp: data.demo_otp,
        },
      });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to dispatch OTP. Please try again.';
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
          <h2 className="curasync-auth-card__title">Patient Portal Access</h2>
          <p className="curasync-auth-card__subtitle">
            Enter your mobile number to receive a secure 6-digit OTP
          </p>
        </div>

        {/* Demo Autofill Helper */}
        <div className="curasync-auth-demo-box" onClick={handleFillDemo}>
          <p>Click here to auto-fill sample patient mobile (<strong>9876543210</strong>)</p>
        </div>

        <form onSubmit={handleSubmit} className="curasync-auth-form">
          <Input
            label="Mobile Number"
            type="tel"
            icon={Phone}
            placeholder="10-digit phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={error}
            required
            autoFocus
          />

          <Button
            type="submit"
            variant="accent"
            size="lg"
            fullWidth
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Send Secure OTP
          </Button>
        </form>

        <div className="curasync-auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="curasync-auth-link">
              Register as new patient
            </Link>
          </p>
          <div className="curasync-auth-doctor-link-wrap">
            <Link to="/doctor/login" className="curasync-auth-doctor-link">
              Are you a doctor? Healthcare Provider Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
