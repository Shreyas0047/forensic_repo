# AI-Powered Cybercrime Digital Forensics Platform with Blockchain Evidence Verification

## Project Overview

Production-grade monorepo for a digital forensics investigation platform that supports case-based workflows, evidence lifecycle tracking, AI-assisted analysis, blockchain-style evidence verification, and internal event traceability.

## Architecture

```text
root/
├── client/        React + Vite + Tailwind + React Router + Axios
├── server/        Express + MongoDB + JWT + Multer + SHA-256 + event logging
├── ai-service/    Flask AI microservice
├── package.json
└── README.md
```

### Investigation Flow

1. Investigators register and authenticate with JWT.
2. Investigators create cases with metadata, severity, and workflow stage.
3. Evidence is uploaded into a case, hashed with SHA-256, lifecycle-tracked, and linked to an internal blockchain ledger entry.
4. The backend triggers AI analysis requests to the Flask microservice.
5. Verification actions validate stored evidence hash integrity and produce immutable-style verification entries.
6. Every critical action is persisted to `EventLog` for auditability and traceability.

## Folder Structure

```text
client/
  src/
    components/
    context/
    layouts/
    pages/
    services/
    utils/
server/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  uploads/
  utils/
  app.js
  server.js
ai-service/
  routes/
  services/
  app.py
  requirements.txt
```

## Setup

### 1. Install root dependencies

```bash
npm install
```

### 2. Install client dependencies

```bash
cd client
npm install
```

### 3. Install server dependencies

```bash
cd ../server
npm install
```

### 4. Install Python dependencies

```bash
cd ../ai-service
pip install -r requirements.txt
```

## Environment Variables

### `server/.env`

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/forensics-platform
JWT_SECRET=replace-with-secure-secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://127.0.0.1:5001
```

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Run All Services

```bash
npm run dev
```

## Run Individually

```bash
npm run server
npm run client
npm run ai
```

## Core Capabilities

- Case-based investigation workflow
- Evidence lifecycle tracking
- AI-driven analysis orchestration
- Blockchain-backed evidence verification
- Event logging and audit traceability
- JWT authentication foundation
- Centralized error handling and request logging
