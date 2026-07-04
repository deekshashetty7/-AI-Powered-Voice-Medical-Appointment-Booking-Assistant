# MediVoice - AI-Powered Voice Medical Appointment Booking Assistant

A fully voice-based AI assistant for hospitals and clinics. Patients can book, manage, and inquire about medical appointments using natural speech — like calling a real hospital receptionist.

## Architecture

```
┌─────────────┐     WebRTC      ┌──────────────────┐     HTTP Tools    ┌─────────────┐
│   React     │ ◄──────────────►│  LiveKit Cloud   │◄─────────────────►│   Backend   │
│  Frontend   │   Voice Stream  │  + Voice Agent   │   Scheduling API  │  Express +  │
│  (Vercel)   │                 │  (agent-node)    │                   │  Prisma     │
└─────────────┘                 └──────────────────┘                   │  (Neon PG)  │
       │                                │                              └─────────────┘
       │                                │
       │         STT → LLM → TTS        │
       │    Deepgram / Sarvam /         │
       │    ElevenLabs                  │
       └────────────────────────────────┘
```

### Voice Pipeline

```
User speaks → VAD (Silero) → STT → AI + Scheduling Tools → TTS → Voice playback → Auto-listen
```

**Features:**
- Voice Activity Detection (Silero VAD)
- Turn Detection (Multilingual Model / STT-based for Sarvam)
- Noise Cancellation (LiveKit WebRTC)
- Interruption / Barge-in handling
- Low-latency streaming via LiveKit

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + LiveKit Components |
| Backend | Node.js + Express + Prisma |
| Database | Neon PostgreSQL |
| Voice Agent | LiveKit Agents (Node.js — `agent-node/`) |
| STT | Deepgram (default) / Sarvam / ElevenLabs |
| TTS | Deepgram Aura / Sarvam Bulbul / ElevenLabs |
| LLM | Groq (llama-3.3-70b) |
| Auth | JWT + bcrypt (patient + admin) |
| Hosting | Vercel (frontend) + Render/Railway (backend + agent) |

## Languages Supported

- English
- Hindi (हिन्दी)
- Kannada (ಕನ್ನಡ)

## Quick Start

### Prerequisites

- Node.js 20+
- [Neon](https://neon.com) PostgreSQL database
- [LiveKit Cloud](https://cloud.livekit.io) account
- API keys: Groq (LLM), Deepgram (STT), and optional Sarvam/ElevenLabs

### 1. Database Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Neon DATABASE_URL

npm install
npm run db:generate
npm run db:push
npm run db:seed
```

### 2. Backend

```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

### 3. Voice Agent (agent-node)

```bash
cd agent-node
cp .env.example .env
# Edit .env — copy keys from agent/.env or set manually

npm install
npm run dev
```

> On Windows, use `agent-node` (not the Python `agent/` folder).

### 4. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# Runs on http://localhost:5173
```

Open http://localhost:5173 — sign in or create a patient account, then tap the microphone.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clinic` | Clinic info and hours |
| GET | `/api/specialties` | List specialties |
| GET | `/api/doctors` | List doctors (optional `?specialty=`) |
| GET | `/api/availability/:doctorId?date=` | Doctor availability |
| GET | `/api/availability?date=&specialty=` | Search availability |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments?phone=` | Patient appointments |
| POST | `/api/appointments/:id/cancel` | Cancel appointment |
| POST | `/api/appointments/:id/reschedule` | Reschedule appointment |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user (JWT) |
| GET | `/api/admin/stats` | Admin dashboard stats |
| POST | `/api/livekit/token` | Get LiveKit room token |

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for full production setup on Vercel + Render/Railway.

Quick summary:

1. **Neon** — PostgreSQL `DATABASE_URL`
2. **Render** — deploy `backend/` + `agent-node/` worker (use `render.yaml`)
3. **Vercel** — deploy `frontend/` with `VITE_API_URL=<backend-url>`
4. Run `npm run db:seed` once on the database

## Demo Walkthrough (Loom)

Record a Loom video demonstrating:

1. **Setup** — Select language (Hindi/Kannada/English) and STT provider
2. **Voice booking** — Book appointment via natural speech
3. **Availability check** — Ask about doctor slots
4. **VAD/Turn detection** — Show listening/speaking states
5. **Barge-in** — Interrupt the agent mid-response
6. **Confirmation** — Voice confirmation of booking details
7. **Architecture** — Brief explanation of the stack

## AI Safety Rules

The agent strictly:
- Never hallucinates doctor availability
- Always uses backend API tools for scheduling
- Confirms details before booking
- Says "I don't have that information" when data is missing
- Says "No clinic data configured" when clinic DB is empty

## License

MIT
