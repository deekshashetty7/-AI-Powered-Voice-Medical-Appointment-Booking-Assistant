import { apiUrl, apiConfigHint } from './api/base';

export type Language = 'en' | 'hi' | 'kn';
export type SttProvider = 'deepgram' | 'sarvam' | 'elevenlabs';

export interface SessionConfig {
  language: Language;
  sttProvider: SttProvider;
  patientName: string;
}

export interface TokenResponse {
  token: string;
  roomName: string;
  livekitUrl: string;
  language: Language;
  sttProvider: SttProvider;
}

export const LANGUAGES: { value: Language; label: string; native: string }[] = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { value: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export const STT_PROVIDERS: { value: SttProvider; label: string; description: string }[] = [
  { value: 'deepgram', label: 'Deepgram', description: 'Nova-3 with low latency' },
  { value: 'sarvam', label: 'Sarvam AI', description: 'Best for Indian languages' },
  { value: 'elevenlabs', label: 'ElevenLabs', description: 'High accuracy STT' },
];

export async function getLiveKitToken(config: SessionConfig): Promise<TokenResponse> {
  const url = apiUrl('/api/livekit/token');
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
  } catch {
    throw new Error(`Cannot reach backend. ${apiConfigHint()}`);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to get session token (${res.status})`);
  }
  return res.json();
}
