# CredNova

AI-Powered Alternative Credit Intelligence for MSMEs. Premium fintech frontend built with Next.js (App Router), GSAP, and Three.js.

## Features

- **Landing page**: Hero with 3D Three.js background (floating data nodes), GSAP headline/subtext/button animations, security badges (AES-256, RBI-Aligned, DPDP Compliant)
- **MSME Login**: Aadhaar/Business ID + OTP, glassmorphism card, animated focus
- **Bank Login**: Email, password, 2FA, institutional-style UI
- **MSME Dashboard**: NovaScore circular meter (300–900), GST/UPI/Utility scores, cash flow chart, bank recommendations, animated counters
- **Bank Dashboard**: MSME list with filters (risk band, industry, turnover), detailed MSME view with SHAP explanation, cash flow trends, credit insights
- **UI**: Dark theme, electric blue + emerald accents, glassmorphism, loading screen with 3D-style logo, scroll-triggered animations

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- GSAP (animations, ScrollTrigger)
- Three.js (@react-three/fiber, @react-three/drei)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing (hero, 3D background, login buttons) |
| `/msme/login` | MSME login |
| `/msme/dashboard` | MSME dashboard (after login) |
| `/bank/login` | Bank / lender login |
| `/bank/dashboard` | Bank portfolio (MSME list, filters) |
| `/bank/msme/[id]` | MSME detail (NovaScore, SHAP, cash flow, insights) |

## Project Structure

```
Frontend/               # Next.js 14 Frontend (App Router)
Backend/                # Node.js/Express Intelligence Engine
  server.js             # Ingestion, Validation, and Scoring logic
  package.json          # Backend dependencies
```

## Backend Engine (Intelligence Layer)

The backend implements a multi-stage credit underwriting pipeline:

1. **Ingestion Layer**: Mocked API integration for NPCI (UPI), GSTN, and Bank Account Aggregators.
2. **Validation Layer**: Multi-layered rules and AI anomaly detection to prevent MSME fraud.
3. **Scoring Layer (NovaScore)**: Ensemble model providing a credit score (300-900).
4. **Explainable AI**: SHAP-style impact analysis for transparency.
5. **Blockchain Audit**: Cryptographic proof of every scoring computation.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/process-credit` | `GET` | Run the full intelligence pipeline |

## Getting Started

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Backend
```bash
cd Backend
npm install
node server.js
```

## Build

```bash
# Frontend
cd Frontend
npm run build
npm start
```
