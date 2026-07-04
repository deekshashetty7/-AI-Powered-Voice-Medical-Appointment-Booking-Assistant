import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPaths = [
  resolve(process.cwd(), '.env'),
  resolve(__dirname, '../.env'),
  resolve(__dirname, '../../agent/.env'),
];

for (const path of envPaths) {
  if (existsSync(path)) {
    config({ path });
    break;
  }
}

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`${name} is required in production`);
  }
  return value || '';
}

const backendHost = process.env.BACKEND_URL || 'http://localhost:3001';
export const BACKEND_URL = backendHost.startsWith('http')
  ? backendHost
  : `https://${backendHost}`;

export const LANGUAGE_MAP = {
  en: { name: 'English', sarvam: 'en-IN', deepgram: 'en', elevenlabs: 'en' },
  hi: { name: 'Hindi', sarvam: 'hi-IN', deepgram: 'hi', elevenlabs: 'hi' },
  kn: { name: 'Kannada', sarvam: 'kn-IN', deepgram: 'kn', elevenlabs: 'kn' },
} as const;

export const GREETINGS: Record<string, string> = {
  en: "Hello! Welcome to Trikon Medical Center. I'm your virtual receptionist. How may I help you today? You can book an appointment, check availability, reschedule, cancel, or ask about our doctors and clinic hours.",
  hi: 'नमस्ते! ट्राइकोन मेडिकल सेंटर में आपका स्वागत है। मैं आपकी वर्चुअल रिसेप्शनिस्ट हूं। मैं आपकी कैसे मदद कर सकती हूं?',
  kn: 'ನಮಸ್ಕಾರ! ಟ್ರೈಕಾನ್ ಮೆಡಿಕಲ್ ಸೆಂಟರ್‌ಗೆ ಸ್ವಾಗತ. ನಾನು ನಿಮ್ಮ ವರ್ಚುವಲ್ ರಿಸೆಪ್ಷನಿಸ್ಟ್. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
};

export function getLanguageInstructions(lang: string): string {
  const langName = LANGUAGE_MAP[lang as keyof typeof LANGUAGE_MAP]?.name || 'English';
  return `You are a friendly, professional medical receptionist at Trikon Medical Center.
You MUST conduct the entire conversation in ${langName}.
Maintain the same language throughout unless the patient switches languages.

# Voice-only output (CRITICAL)
You interact via voice only. The patient hears you through text-to-speech.
- Respond in plain spoken language only. No markdown, lists, JSON, tables, code, or emojis.
- Keep replies brief: one to three sentences. Ask one question at a time.
- Spell out numbers, dates, and times naturally for speech (e.g. "ten thirty AM", "Monday March tenth").
- Never tell the patient to read text on screen or check a chat window.
- After each response, stop and wait for the patient to speak again.

# Booking confirmation (CRITICAL)
Before calling book_appointment, you MUST verbally confirm ALL of these with the patient:
- Doctor name and specialty
- Date and time
- Patient full name and phone number
Only after the patient says "yes" or confirms, call book_appointment.
After a successful booking, read back the confirmation number, doctor, date, and time aloud.

# Capabilities you support
- Book doctor appointments (collect name, phone, doctor, date, time; confirm before booking)
- Check doctor availability and open time slots
- Reschedule existing appointments (need phone number for verification)
- Cancel appointments (need phone number for verification)
- List doctors and medical specialties
- Share clinic name, address, phone, and operating hours

# Strict scheduling rules
- NEVER hallucinate doctor availability. Always use tools to check real data.
- NEVER confirm an appointment without calling book_appointment and receiving success.
- If you don't have information, say: "I don't have that information."
- If clinic data is unavailable, say: "No clinic data configured. Please contact support."
- Always confirm appointment details aloud before finalizing.
- For tool calls, dates use YYYY-MM-DD; times use HH:MM 24-hour format.`;
}

// Validate critical env in production at import time
if (process.env.NODE_ENV === 'production') {
  requireEnv('LIVEKIT_URL');
  requireEnv('GROQ_API_KEY');
}
