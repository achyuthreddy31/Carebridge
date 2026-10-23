# Curasync

**Your health data. Your control. Smarter clinical visits.**

Curasync is a patient-owned, AI-powered clinical intelligence platform that helps patients organize their medical information, prepare for healthcare visits, and securely share selected information with healthcare professionals through temporary patient-controlled access.

## Core Innovation

- **Patient Ownership** — Patients own and control their health data
- **Document Intelligence** — OCR + AI extraction from medical reports
- **AI Intake Assistant** — Structured pre-visit clinical intake
- **Temporary Access** — Time-bounded OTP-based doctor access
- **Auditability** — Complete access history and transparency

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Python FastAPI |
| Database | SQLite (dev) / PostgreSQL (prod) |
| AI | Gemini / OpenAI (abstracted) |
| OCR | Tesseract / PyPDF2 (abstracted) |
| Auth | JWT + OTP |

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

### Setup

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your settings

# 2. Backend
cd backend
pip install -r requirements.txt
python seed_data.py
python run.py

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Demo Credentials
| Role | Phone/Email | Password |
|------|------------|----------|
| Patient | 9876543210 | (OTP: 123456) |
| Doctor | doctor@curasync.com | Doctor@123 |
| Admin | admin@curasync.com | Admin@123 |

## Project Structure

```
SIH2026/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── design-system/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── contexts/
│   └── package.json
├── backend/           # FastAPI
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── auth/
│   └── requirements.txt
├── .env.example
└── README.md
```

## SIH 2026

**Problem Statement ID**: 26198  
**Organization**: AICTE  
**Theme**: MedTech / BioTech / HealthTech  
**Category**: Software

## License

Built for Smart India Hackathon 2026.
