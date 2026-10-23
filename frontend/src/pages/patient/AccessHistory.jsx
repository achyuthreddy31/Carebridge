import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Eye, Lock } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { AccessLogTimeline } from '../../components/patient/AccessLogTimeline';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { accessService } from '../../services/access';
import '../app-pages.css';

export const AccessHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await accessService.getAccessHistory();
        setLogs(data);
      } catch (err) {
        // Handled
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <PageLayout>
      <div className="curasync-page-header">
        <div>
          <span className="curasync-page-header__eyebrow">SIGNATURE EXPERIENCE 4</span>
          <h1 className="curasync-page-header__title">Who Accessed My Health Data?</h1>
          <p className="curasync-page-header__desc">
            An auditable, immutable access trail. Every time a medical professional accesses your consultation notes or reports via your temporary OTP, it is permanently logged here.
          </p>
        </div>
      </div>

      {/* DPDP Alignment Notice */}
      <Card variant="privacy-tint" padding="md" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={24} color="var(--color-privacy)" />
          <div>
            <h4 style={{ color: 'var(--color-privacy)', fontWeight: '700', fontSize: '0.95rem' }}>
              Patient Consent & Purpose Limitation Architecture
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Conceptually designed around DPDP (Digital Personal Data Protection) and patient-owned data principles. Every read session is cryptographically validated and logged with timestamp and scope.
            </p>
          </div>
        </div>
      </Card>

      {/* Access Audit Timeline */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton height="110px" className="curasync-skeleton--card" />
          <Skeleton height="110px" className="curasync-skeleton--card" />
        </div>
      ) : logs.length > 0 ? (
        <AccessLogTimeline logs={logs} />
      ) : (
        <EmptyState
          icon={Eye}
          title="No healthcare provider has accessed your records yet"
          description="When you share a temporary 6-digit access code with a consulting doctor, the access event and parameters viewed will appear in this timeline."
        />
      )}
    </PageLayout>
  );
};
