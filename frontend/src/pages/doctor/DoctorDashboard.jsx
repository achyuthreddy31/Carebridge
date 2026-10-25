import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Lock, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { DoctorLayout } from '../../components/layout/DoctorLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OTPInput } from '../../components/ui/OTPInput';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { accessService } from '../../services/access';
import '../app-pages.css';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFillDemoCode = () => {
    setOtpCode('482910');
    setError('');
  };

  const handleAccessPatient = async (e) => {
    if (e) e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit temporary patient access code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const session = await accessService.validateDoctorAccess(otpCode);
      addToast(`Access granted to patient record: ${session.patient_name}`, 'success');
      navigate(`/doctor/patient/${session.token_id}`, {
        state: { session },
      });
    } catch (err) {
      const msg = err.response?.data?.detail || 'That access code is invalid or has expired.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DoctorLayout>
      <div className="curasync-page-header">
        <div>
          <span className="curasync-page-header__eyebrow">CLINICAL PRACTICE WORKSPACE</span>
          <h1 className="curasync-page-header__title">
            Welcome, {user?.name || 'Doctor'}
          </h1>
          <p className="curasync-page-header__desc">
            Enter a patient-provided temporary 6-digit OTP code to unlock read-only consultation summaries and pathology reports.
          </p>
        </div>
      </div>

      <div className="curasync-doctor-access-container">
        <Card variant="bordered" padding="lg" className="curasync-doctor-access-card">
          <div className="curasync-doctor-access-header">
            <div className="curasync-doctor-icon-wrap">
              <KeyRound size={28} />
            </div>
            <h2>SECURE PATIENT ACCESS</h2>
            <p>Ask patient for the 6-digit access code from their Carebridge wallet</p>
          </div>

          {/* Fast Demo Fill */}
          <div className="curasync-auth-demo-box" onClick={handleFillDemoCode} style={{ margin: '1rem 0' }}>
            <p>Click here to auto-fill seeded patient access code: <strong>482910</strong></p>
          </div>

          <form onSubmit={handleAccessPatient}>
            <OTPInput
              length={6}
              value={otpCode}
              onChange={(val) => {
                setOtpCode(val);
                setError('');
              }}
              error={!!error}
            />

            {error && (
              <p className="curasync-input-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              ACCESS PATIENT RECORD
            </Button>
          </form>

          <div className="curasync-doctor-security-note">
            <ShieldCheck size={16} />
            <span>
              Access is strictly temporary (15 minutes), purpose-limited, and recorded in the patient's privacy audit log.
            </span>
          </div>
        </Card>
      </div>
    </DoctorLayout>
  );
};
