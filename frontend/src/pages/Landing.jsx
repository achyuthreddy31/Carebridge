import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Bot, 
  FileText, 
  Clock, 
  Lock, 
  Eye, 
  Share2, 
  XCircle, 
  ArrowRight, 
  CheckCircle2, 
  Activity,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { Logo } from '../components/shared/Logo';
import { Button } from '../components/ui/Button';
import './Landing.css';

export const Landing = () => {
  return (
    <div className="curasync-landing">
      {/* Top Navbar */}
      <nav className="curasync-landing__nav">
        <div className="container curasync-landing__nav-inner">
          <Logo size="md" showTagline />
          <div className="curasync-landing__nav-actions">
            <Link to="/doctor/login" className="curasync-landing__doctor-link">
              <Stethoscope size={16} />
              <span>Doctor Portal</span>
            </Link>
            <Link to="/login">
              <Button variant="primary" size="sm">Patient Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="curasync-landing__hero">
        <div className="container curasync-landing__hero-inner">
          <h1 className="curasync-landing__hero-title">
            Your health data.<br />
            <span className="curasync-landing__hero-highlight">Your control.</span><br />
            Smarter clinical visits.
          </h1>

          <p className="curasync-landing__hero-desc">
            Carebridge empowers patients to own and organize diagnostic records, prepare for doctor consultations with an AI clinical intake assistant, and securely share records with healthcare providers via temporary patient-controlled OTP access.
          </p>

          <div className="curasync-landing__hero-cta">
            <Link to="/register">
              <Button variant="accent" size="lg" icon={ArrowRight} iconPosition="right">
                Get Started
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Animated Healthcare Data Flow Visualization */}
          <div className="curasync-dataflow">
            <span className="curasync-dataflow__label">CLINICAL INTELLIGENCE PIPELINE</span>
            <div className="curasync-dataflow__track">
              <div className="curasync-dataflow__step">
                <div className="curasync-dataflow__node curasync-dataflow__node--1">
                  <FileText size={20} />
                </div>
                <span>Medical Report</span>
              </div>

              <div className="curasync-dataflow__arrow">→</div>

              <div className="curasync-dataflow__step">
                <div className="curasync-dataflow__node curasync-dataflow__node--2">
                  <Activity size={20} />
                </div>
                <span>Document OCR</span>
              </div>

              <div className="curasync-dataflow__arrow">→</div>

              <div className="curasync-dataflow__step">
                <div className="curasync-dataflow__node curasync-dataflow__node--3">
                  <Bot size={20} />
                </div>
                <span>AI Processing</span>
              </div>

              <div className="curasync-dataflow__arrow">→</div>

              <div className="curasync-dataflow__step">
                <div className="curasync-dataflow__node curasync-dataflow__node--4">
                  <CheckCircle2 size={20} />
                </div>
                <span>Structured Data</span>
              </div>

              <div className="curasync-dataflow__arrow">→</div>

              <div className="curasync-dataflow__step">
                <div className="curasync-dataflow__node curasync-dataflow__node--5">
                  <Clock size={20} />
                </div>
                <span>Patient Timeline</span>
              </div>

              <div className="curasync-dataflow__arrow">→</div>

              <div className="curasync-dataflow__step">
                <div className="curasync-dataflow__node curasync-dataflow__node--6">
                  <Lock size={20} />
                </div>
                <span>Temporary Doctor Access</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Signature Section: "YOUR DATA. YOUR CONTROL." */}
      <section className="curasync-ownership-section">
        <div className="container">
          <div className="curasync-section-header">
            <span className="curasync-section-eyebrow">PATIENT SOVEREIGNTY</span>
            <h2 className="curasync-section-title">Your Data. Your Control.</h2>
            <p className="curasync-section-sub">
              Healthcare data belongs to the patient. Carebridge replaces permanent fragmented copies with temporary, auditable, patient-authorized access.
            </p>
          </div>

          <div className="curasync-ownership-grid">
            <div className="curasync-ownership-card curasync-ownership-card--feature">
              <div className="curasync-ownership-icon-wrap">
                <Lock size={22} />
              </div>
              <h3>🔐 You Control Access</h3>
              <p>No hospital, clinic, or third party can access your health records without your explicit, real-time cryptographic authorization.</p>
            </div>

            <div className="curasync-ownership-card curasync-ownership-card--feature">
              <div className="curasync-ownership-icon-wrap">
                <Clock size={22} />
              </div>
              <h3>⏱ Temporary Sharing</h3>
              <p>Generate a 6-digit access OTP valid strictly for 15 minutes during your consultation. Tokens automatically expire server-side.</p>
            </div>

            <div className="curasync-ownership-card curasync-ownership-card--center">
              <div className="curasync-health-wallet-badge">CAREBRIDGE HEALTH WALLET</div>
              <div className="curasync-health-wallet-chip">🔒 100% PRIVATE</div>
              <h4>Arjun Mehta</h4>
              <p>Blood Group: O+ | Age: 29</p>
              <div className="curasync-health-wallet-stats">
                <div>
                  <strong>7</strong>
                  <span>Lab Reports</span>
                </div>
                <div>
                  <strong>3</strong>
                  <span>Visits</span>
                </div>
                <div>
                  <strong>0</strong>
                  <span>Permanent Leaks</span>
                </div>
              </div>
            </div>

            <div className="curasync-ownership-card curasync-ownership-card--feature">
              <div className="curasync-ownership-icon-wrap">
                <Eye size={22} />
              </div>
              <h3>👁 Complete Access Visibility</h3>
              <p>Inspect exactly who opened your medical information, at what exact minute, and which parameters were viewed in your personal audit timeline.</p>
            </div>

            <div className="curasync-ownership-card curasync-ownership-card--feature">
              <div className="curasync-ownership-icon-wrap">
                <XCircle size={22} />
              </div>
              <h3>✕ Instant Revocation</h3>
              <p>Revoke active doctor access with a single tap. The temporary authorization token is immediately invalidated on the backend.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Innovation Matrix: The Problem vs Carebridge Solution */}
      <section id="how-it-works" className="curasync-comparison-section">
        <div className="container">
          <div className="curasync-section-header">
            <span className="curasync-section-eyebrow">THE PARADIGM SHIFT</span>
            <h2 className="curasync-section-title">Re-architecting Healthcare Intake</h2>
          </div>

          <div className="curasync-comparison-grid">
            <div className="curasync-comparison-col curasync-comparison-col--legacy">
              <h3 className="curasync-comparison-col-title">Today's Healthcare Reality</h3>
              <ul className="curasync-comparison-list">
                <li>❌ Physical paper reports lost between clinic visits</li>
                <li>❌ 10-15 minutes wasted reciting basic medical history repeatedly</li>
                <li>❌ Unstructured symptoms difficult for doctors to quickly synthesize</li>
                <li>❌ Reports shared over unsecure messaging without audit logs</li>
                <li>❌ Permanent copies stored without patient consent or revocation rights</li>
              </ul>
            </div>

            <div className="curasync-comparison-col curasync-comparison-col--curasync">
              <h3 className="curasync-comparison-col-title">The Carebridge Model</h3>
              <ul className="curasync-comparison-list">
                <li>✓ Intelligent OCR structures PDF and image reports into clean data tables</li>
                <li>✓ AI Intake Assistant compiles clinical SOAP summaries before consultation</li>
                <li>✓ Red-flag symptom screening highlights acute clinical concerns</li>
                <li>✓ 6-digit temporary OTP access ensures purpose-bound doctor viewing</li>
                <li>✓ Complete audit timeline shows who accessed what, when, and where</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Signature Moments Showcase */}
      <section className="curasync-moments-section">
        <div className="container">
          <div className="curasync-section-header">
            <span className="curasync-section-eyebrow">SIGNATURE CAPABILITIES</span>
            <h2 className="curasync-section-title">Engineered for Clinical Precision</h2>
          </div>

          <div className="curasync-moments-grid">
            <div className="curasync-moment-card">
              <div className="curasync-moment-num">01</div>
              <h4>Medical Document Intelligence</h4>
              <p>Upload pathology lab reports in PDF or image formats. Automated OCR extracts tests, units, and ranges into an organized timeline.</p>
            </div>

            <div className="curasync-moment-card">
              <div className="curasync-moment-num">02</div>
              <h4>AI Consultation Intake</h4>
              <p>Conversational digital intake asks structured symptom, onset, duration, and medication questions, screening for clinical red flags.</p>
            </div>

            <div className="curasync-moment-card">
              <div className="curasync-moment-num">03</div>
              <h4>Patient-Controlled OTP Access</h4>
              <p>Share records during in-person visits using a 6-digit code valid for 15 minutes. No unencrypted links or permanent access granted.</p>
            </div>

            <div className="curasync-moment-card">
              <div className="curasync-moment-num">04</div>
              <h4>Transparent Access Audit</h4>
              <p>Patients inspect a privacy-centric timeline showing doctor name, clinic affiliation, timestamps, and accessed parameters.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="curasync-landing__footer">
        <div className="container curasync-landing__footer-inner">
          <div className="curasync-landing__footer-brand">
            <Logo size="md" showTagline theme="light" />
            <p>Smart India Hackathon 2026 • AICTE Problem Statement 26198</p>
          </div>
          <div className="curasync-landing__footer-links">
            <Link to="/login">Patient Portal</Link>
            <Link to="/doctor/login">Doctor Portal</Link>
            <Link to="/register">Register Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
