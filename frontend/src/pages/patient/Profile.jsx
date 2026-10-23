import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Heart, AlertCircle, Save, ShieldCheck } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { patientService } from '../../services/patients';
import '../app-pages.css';

export const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    blood_group: '',
    allergies_text: '',
    medications_text: '',
    chronic_text: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await patientService.getProfile();
        setProfile(res);
        setFormData({
          name: res.name || '',
          age: res.age || '',
          gender: res.gender || 'Male',
          blood_group: res.blood_group || '',
          allergies_text: (res.allergies || []).join(', '),
          medications_text: (res.medications || []).join(', '),
          chronic_text: (res.chronic_conditions || []).join(', '),
          emergency_contact_name: res.emergency_contact_name || '',
          emergency_contact_phone: res.emergency_contact_phone || '',
        });
      } catch (err) {
        addToast('Failed to load profile details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [addToast]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender,
        blood_group: formData.blood_group,
        allergies: formData.allergies_text
          ? formData.allergies_text.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        medications: formData.medications_text
          ? formData.medications_text.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        chronic_conditions: formData.chronic_text
          ? formData.chronic_text.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
      };

      const updated = await patientService.updateProfile(payload);
      setProfile(updated);
      addToast('Health profile successfully updated.', 'success');
    } catch (err) {
      addToast('Failed to save profile changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Skeleton height="200px" className="curasync-skeleton--card" />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="curasync-page-header">
        <div>
          <span className="curasync-page-header__eyebrow">PATIENT PROFILE & MEDICAL HISTORY</span>
          <h1 className="curasync-page-header__title">Personal Health Profile</h1>
          <p className="curasync-page-header__desc">
            Keep your clinical background updated so your AI consultation summaries and doctor shares are comprehensive.
          </p>
        </div>

        <div className="curasync-profile-completion-badge">
          <span>Profile Completeness:</span>
          <strong>{profile?.profile_completion || 50}%</strong>
        </div>
      </div>

      <form onSubmit={handleSave} className="curasync-form-layout">
        {/* Core Demographics Card */}
        <Card variant="bordered" padding="lg">
          <h3 className="curasync-card-heading">
            <User size={18} /> Demographics & Identity
          </h3>
          <div className="curasync-grid-2">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
            <Input
              label="Mobile Number (Verified Login)"
              value={profile?.phone || ''}
              disabled
              helperText="Primary cryptographic identifier"
            />
            <div className="curasync-grid-2">
              <Input
                label="Age"
                type="number"
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
            <div className="curasync-input-group">
              <label className="curasync-input-label">Blood Group</label>
              <select
                className="curasync-input"
                value={formData.blood_group}
                onChange={(e) => handleChange('blood_group', e.target.value)}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Clinical Parameters Card */}
        <Card variant="bordered" padding="lg">
          <h3 className="curasync-card-heading">
            <Heart size={18} /> Clinical History & Alerts
          </h3>
          <div className="curasync-grid-1">
            <Input
              label="Known Drug / Environmental Allergies (comma separated)"
              placeholder="e.g. Penicillin, Sulfa drugs, Peanuts"
              value={formData.allergies_text}
              onChange={(e) => handleChange('allergies_text', e.target.value)}
              helperText="Critical for doctor consultation red-flag checks"
            />
            <Input
              label="Current Regular Prescription Medications (comma separated)"
              placeholder="e.g. Metformin 500mg daily, Amlodipine 5mg"
              value={formData.medications_text}
              onChange={(e) => handleChange('medications_text', e.target.value)}
            />
            <Input
              label="Known Chronic Conditions (comma separated)"
              placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
              value={formData.chronic_text}
              onChange={(e) => handleChange('chronic_text', e.target.value)}
            />
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card variant="bordered" padding="lg">
          <h3 className="curasync-card-heading">
            <Phone size={18} /> Emergency Contact
          </h3>
          <div className="curasync-grid-2">
            <Input
              label="Emergency Contact Name"
              placeholder="e.g. Spouse, Parent, Relative"
              value={formData.emergency_contact_name}
              onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
            />
            <Input
              label="Emergency Contact Phone"
              placeholder="10-digit mobile number"
              value={formData.emergency_contact_phone}
              onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
            />
          </div>
        </Card>

        <div className="curasync-form-actions">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            loading={saving}
            icon={Save}
          >
            Save Health Profile
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};
