import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Bot, 
  Lock, 
  Activity, 
  CheckCircle2, 
  XCircle,
  Clock
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { adminService } from '../../services/admin';
import '../app-pages.css';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, logs
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [s, u, l] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getAuditLogs(),
      ]);
      setStats(s);
      setUsers(u);
      setAuditLogs(l);
    } catch (err) {
      addToast('Failed to load administrative analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleUser = async (userId, currentStatus) => {
    try {
      await adminService.toggleUserStatus(userId, !currentStatus);
      addToast(`Account status updated to ${!currentStatus ? 'Active' : 'Suspended'}.`, 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to change user status.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="curasync-page-header">
        <div>
          <span className="curasync-page-header__eyebrow">PLATFORM GOVERNANCE & AUDIT</span>
          <h1 className="curasync-page-header__title">System Administration</h1>
          <p className="curasync-page-header__desc">
            Monitor platform metrics, user access permissions, and cryptographic access logs. Routine clinical data remains encrypted and isolated from administrative access.
          </p>
        </div>
      </div>

      {/* Operational Metrics Cards */}
      <div className="curasync-stat-grid">
        <Card variant="bordered" padding="md" className="curasync-stat-card">
          <span className="curasync-stat-card__label">Registered Patients</span>
          <span className="curasync-stat-card__value">{loading ? '...' : stats?.total_patients || 0}</span>
          <span className="curasync-stat-card__hint">Personal health wallets</span>
        </Card>

        <Card variant="bordered" padding="md" className="curasync-stat-card">
          <span className="curasync-stat-card__label">Verified Doctors</span>
          <span className="curasync-stat-card__value">{loading ? '...' : stats?.total_doctors || 0}</span>
          <span className="curasync-stat-card__hint">Consultation practitioners</span>
        </Card>

        <Card variant="bordered" padding="md" className="curasync-stat-card">
          <span className="curasync-stat-card__label">Processed Reports</span>
          <span className="curasync-stat-card__value">{loading ? '...' : stats?.total_reports || 0}</span>
          <span className="curasync-stat-card__hint">OCR & AI structured</span>
        </Card>

        <Card variant="bordered" padding="md" className="curasync-stat-card">
          <span className="curasync-stat-card__label">Active OTP Tokens</span>
          <span className="curasync-stat-card__value" style={{ color: 'var(--color-privacy)' }}>
            {loading ? '...' : stats?.active_tokens || 0}
          </span>
          <span className="curasync-stat-card__hint">Live temporary shares</span>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="curasync-tabs-bar">
        <button
          className={`curasync-tab-btn ${activeTab === 'overview' ? 'curasync-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          System Health
        </button>
        <button
          className={`curasync-tab-btn ${activeTab === 'users' ? 'curasync-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Governance ({users.length})
        </button>
        <button
          className={`curasync-tab-btn ${activeTab === 'logs' ? 'curasync-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Platform Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: System Health */}
      {activeTab === 'overview' && (
        <div className="curasync-grid-2">
          <Card variant="bordered" padding="lg">
            <h3 className="curasync-card-heading">Platform Service Status</h3>
            <div className="curasync-status-list">
              <div className="curasync-status-item">
                <div>
                  <strong>FastAPI REST Gateway</strong>
                  <span>Port 8000 / JSON Schema v1.0</span>
                </div>
                <Badge variant="success" dot size="sm">OPERATIONAL</Badge>
              </div>

              <div className="curasync-status-item">
                <div>
                  <strong>SQLAlchemy Database Layer</strong>
                  <span>SQLite / PostgreSQL Ready</span>
                </div>
                <Badge variant="success" dot size="sm">CONNECTED</Badge>
              </div>

              <div className="curasync-status-item">
                <div>
                  <strong>Clinical NLP & AI Extraction</strong>
                  <span>Carebridge Rule Engine / Gemini Fallback</span>
                </div>
                <Badge variant="success" dot size="sm">ACTIVE</Badge>
              </div>

              <div className="curasync-status-item">
                <div>
                  <strong>PyPDF2 / Pillow Document OCR</strong>
                  <span>Multi-format diagnostic parser</span>
                </div>
                <Badge variant="success" dot size="sm">READY</Badge>
              </div>
            </div>
          </Card>

          <Card variant="privacy-tint" padding="lg">
            <h3 className="curasync-card-heading" style={{ color: 'var(--color-privacy)' }}>
              <ShieldCheck size={20} /> Privacy-by-Design Compliance
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', lineHeight: '1.6' }}>
              In accordance with Section 49 of the product specification, the Carebridge System Admin dashboard has access only to operational metadata (timestamps, IP addresses, token expiration statuses). Clinical content, patient notes, and diagnostic reports remain exclusively encrypted and viewable only by patient authorization.
            </p>
          </Card>
        </div>
      )}

      {/* Tab 2: User Governance */}
      {activeTab === 'users' && (
        <Card variant="bordered" padding="lg">
          <h3 className="curasync-card-heading">User Account Governance</h3>
          <p className="curasync-card-sub" style={{ marginBottom: '1rem' }}>
            Inspect registered accounts and manage authorization statuses.
          </p>

          <div className="curasync-table-container">
            <table className="curasync-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email || u.phone || 'N/A'}</td>
                    <td>
                      <Badge variant={u.role === 'doctor' ? 'info' : u.role === 'admin' ? 'privacy' : 'neutral'} size="sm">
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={u.is_active ? 'success' : 'error'} dot size="sm">
                        {u.is_active ? 'Active' : 'Suspended'}
                      </Badge>
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          type="button"
                          className={`curasync-btn curasync-btn--sm ${u.is_active ? 'curasync-btn--danger' : 'curasync-btn--secondary'}`}
                          onClick={() => handleToggleUser(u.id, u.is_active)}
                        >
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: System Audit Logs */}
      {activeTab === 'logs' && (
        <Card variant="bordered" padding="lg">
          <h3 className="curasync-card-heading">System-Wide Access Logs</h3>
          <p className="curasync-card-sub" style={{ marginBottom: '1rem' }}>
            Immutable audit record of all doctor access sessions and token validations.
          </p>

          <div className="curasync-table-container">
            <table className="curasync-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Practitioner</th>
                  <th>Clinic</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                  <th>Scope</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>#{log.id}</td>
                    <td><strong>{log.doctor_name}</strong></td>
                    <td>{log.clinic_name || 'In-Person Consultation'}</td>
                    <td><code>{log.ip_address}</code></td>
                    <td>
                      {new Date(log.accessed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} •{' '}
                      {new Date(log.accessed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {(log.resources || []).map((r, i) => (
                          <span key={i} className="curasync-badge curasync-badge--neutral curasync-badge--sm">
                            {typeof r === 'string' ? r.replace(/_/g, ' ') : 'Record'}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AdminLayout>
  );
};
