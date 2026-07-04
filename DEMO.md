# Loom Demo Script — MediVoice

Record a **5–8 minute** walkthrough showing voice-only interaction (no typing during the call).

## Before recording

Start all services:
```bash
cd backend && npm run dev
cd agent-node && npm run dev
cd frontend && npm run dev
```

Open http://localhost:5173 · Allow microphone · Use headphones to avoid echo.

---

## 1. Architecture (30 sec)

Briefly explain:
- **Frontend** (React + LiveKit) — patient voice UI, no chat
- **Agent** (LiveKit Agents Node) — STT → LLM + tools → TTS
- **Backend** (Express + Neon PostgreSQL) — real scheduling data
- **LiveKit Cloud** — WebRTC, VAD, turn detection, Krisp noise filter

---

## 2. Voice-only booking flow (2–3 min)

1. Select **English** + **Deepgram** (or Sarvam for Hindi demo)
2. Click **Start voice call** — agent greets you **by voice**
3. Say naturally:
   > "I'd like to book an appointment with a cardiologist next Monday morning."
4. Answer follow-up questions by voice (name, phone, preferred time)
5. Agent checks **real availability** from database
6. Agent **confirms details aloud** before booking
7. Say **"Yes, confirm"** — agent books and **reads confirmation by voice**

Point out: **no text chat** — only status indicators and audio.

---

## 3. Continuous phone-call conversation (1 min)

Without ending the call:
- Ask: *"What are your clinic hours?"*
- Ask: *"Who are the pediatricians?"*
- Ask: *"Is Dr. Priya Sharma available on Tuesday?"*

Show the call stays open and **auto-listens** after each response (Listening state).

---

## 4. Voice technology demo (2 min)

| Feature | How to demonstrate |
|---------|-------------------|
| **VAD** | Show **VAD** badge lights up when you speak; status shows **Listening** |
| **Turn Detection** | Pause mid-sentence — agent waits; finish sentence — agent responds |
| **Noise Cancellation** | Play background noise / tap desk — **Noise Cancellation** badge on; speech still recognized |
| **Barge-in** | Interrupt agent while **Speaking** — agent stops and listens to you |
| **Booking confirmation** | Agent reads doctor, date, time, and confirmation **aloud** before and after booking |

---

## 5. Hindi / Kannada (optional, 1 min)

Switch language to **Hindi** or **Kannada**, use **Sarvam AI** STT, repeat a short booking query in that language.

---

## Checklist

- [ ] Voice-based (not chat-based)
- [ ] Continuous voice conversation
- [ ] Doctor selection & scheduling via voice
- [ ] Natural conversation handling
- [ ] VAD demonstrated
- [ ] Turn detection demonstrated
- [ ] Noise cancellation demonstrated
- [ ] Barge-in demonstrated
- [ ] Voice booking confirmation demonstrated
- [ ] Architecture explained
