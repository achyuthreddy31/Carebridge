import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, ArrowRight } from 'lucide-react';
import { Logo } from '../../components/shared/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export const PatientRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registerPatient } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await registerPatient({
        name: formData.name,
        phone: cleanPhone,
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender,
        email: formData.email || null,
      });
      addToast('Account created successfully! Welcome to Carebridge.', 'success');
      navigate('/patient/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Mobile may already exist.';
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
          <h2 className="curasync-auth-card__title">Create Patient Wallet</h2>
          <p className="curasync-auth-card__subtitle">
            Take full ownership of your personal health information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="curasync-auth-form">
          <Input
            label="Full Name"
            icon={User}
            placeholder="e.g. Arjun Mehta"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />

          <Input
            label="Mobile Number"
            type="tel"
            icon={Phone}
            placeholder="10-digit phone number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Input
              label="Age"
              type="number"
              placeholder="e.g. 29"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
            />

            <div className="curasync-input-group">
              <label className="curasync-input-label">Gender</label>
              <select
                className="curasync-input"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {error && <p className="curasync-input-error">{error}</p>}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            fullWidth
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Create My Health Wallet
          </Button>
        </form>

        <div className="curasync-auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="curasync-auth-link">
              Log in with OTP
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
