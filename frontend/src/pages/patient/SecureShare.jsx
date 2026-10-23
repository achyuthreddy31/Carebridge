import React, { useState, useEffect } from 'react';
import { Share2, Lock, Clock, ShieldCheck, Plus, AlertCircle } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { AccessTokenCard } from '../../components/patient/AccessTokenCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { accessService } from '../../services/access';
import '../app-pages.css';

export const SecureShare = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedScope, setSelectedScope] = useState([
    'visit_summary',
    'recent_reports',
    'lab_data',
  ]);
  const [expiryMinutes, setExpiryMinutes] = useState(15);
  const { addToast } = useToast();

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const data = await accessService.getTokens();
      setTokens(data);
    } catch (err) {
      addToast('Failed to load access tokens.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleScopeToggle = (key) => {
    if (selectedScope.includes(key)) {
      if (selectedScope.length === 1) {
        addToast('At least one clinical resource must be included.', 'warning');
        return;
      }
      setSelectedScope(selectedScope.filter((s) => s !== key));
    } else {
      setSelectedScope([...selectedScope, key]);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newToken = await accessService.createToken(selectedScope, expiryMinutes);
      addToast(`New doctor access code generated: ${newToken.code}`, 'success');
      // Prepend
      setTokens((prev) => [newToken, ...prev]);
    } catch (err) {
      addToast('Failed to generate temporary access code.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (tokenId) => {
    try {
      await accessService.revokeToken(tokenId);
      addToast('Access code revoked immediately. Healthcare provider access terminated.', 'info');
      fetchTokens();
    } catch (err) {
      addToast('Failed to revoke access token.', 'error');
    }
  };

  const activeTokens = tokens.filter((t) => t.is_active && !t.is_revoked);
  const pastTokens = tokens.filter((t) => !t.is_active || t.is_revoked);

  return (
    <PageLayout>
      <div className="curasync-page-header">
        <div>
          <span className="curasync-page-header__eyebrow">SIGNATURE EXPERIENCE 3</span>
          <h1 className="curasync-page-header__title">Patient-Controlled Doctor Access</h1>
          <p className="curasync-page-header__desc">
            Generate a secure, cryptographically random 6-digit OTP code for your doctor. Sessions automatically expire after 15 minutes and can be revoked at any time.
          </p>
        </div>
      </div>

      <div className="curasync-grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Token Generator Form Card */}
        <Card variant="bordered" padding="lg">
          <div className="curasync-share-form-header">
            <div className="curasync-action-card__icon-wrap" style={{ background: '#FAF5FF', color: '#7C3AED' }}>
              <Lock size={26} />
            </div>
            <div>
              <h3>Configure Temporary Access</h3>
              <p className="curasync-card-sub">Select which clinical information you permit the doctor to view.</p>
            </div>
          </div>

          {/* Granular Scope Selectors */}
          <div className="curasync-scope-selection-group">
            <label className="curasync-input-label">Permitted Clinical Resources</label>

            <label className="curasync-checkbox-label">
              <input
                type="checkbox"
                checked={selectedScope.includes('visit_summary')}
                onChange={() => handleScopeToggle('visit_summary')}
              />
              <div>
                <strong>Latest Consultation Intake Summary</strong>
                <span>SOAP clinical notes, symptoms, and red flags</span>
              </div>
            </label>

            <label className="curasync-checkbox-label">
              <input
                type="checkbox"
                checked={selectedScope.includes('recent_reports')}
                onChange={() => handleScopeToggle('recent_reports')}
              />
              <div>
                <strong>Recent Diagnostic Investigation Documents</strong>
                <span>Original laboratory PDFs and pathology sheets</span>
              </div>
            </label>

            <label className="curasync-checkbox-label">
              <input
                type="checkbox"
                checked={selectedScope.includes('lab_data')}
                onChange={() => handleScopeToggle('lab_data')}
              />
              <div>
                <strong>OCR Structured Numerical Lab Parameters</strong>
                <span>Values, units, and physiological reference ranges</span>
              </div>
            </label>
          </div>

          {/* Expiry selector */}
          <div className="curasync-input-group" style={{ margin: '1.25rem 0' }}>
            <label className="curasync-input-label">Session Duration</label>
            <select
              className="curasync-input"
              value={expiryMinutes}
              onChange={(e) => setExpiryMinutes(parseInt(e.target.value, 10))}
            >
              <option value={10}>10 Minutes (Quick Consultation)</option>
              <option value={15}>15 Minutes (Standard Clinical Visit)</option>
              <option value={30}>30 Minutes (Extended Review)</option>
            </select>
          </div>

          <Button
            variant="accent"
            size="lg"
            fullWidth
            loading={generating}
            onClick={handleGenerate}
            icon={Plus}
          >
            Generate 6-Digit Doctor Access Code
          </Button>
        </Card>

        {/* Active & Historical Codes Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 className="curasync-card-heading">Active Temporary Access Codes</h3>
            <p className="curasync-card-sub" style={{ marginBottom: '1rem' }}>
              Share this 6-digit code with your consulting healthcare provider.
            </p>

            {loading ? (
              <Skeleton height="180px" className="curasync-skeleton--card" />
            ) : activeTokens.length > 0 ? (
              activeTokens.map((tok) => (
                <AccessTokenCard
                  key={tok.id}
                  token={tok}
                  onRevoke={handleRevoke}
                />
              ))
            ) : (
              <EmptyState
                icon={Lock}
                title="Your data is currently 100% private"
                description="No active temporary access codes. Generate a code when you are in the clinic with your doctor."
              />
            )}
          </div>

          {pastTokens.length > 0 && (
            <div>
              <h4 className="curasync-card-heading" style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Expired / Revoked Code History
              </h4>
              {pastTokens.slice(0, 3).map((tok) => (
                <AccessTokenCard
                  key={tok.id}
                  token={tok}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
