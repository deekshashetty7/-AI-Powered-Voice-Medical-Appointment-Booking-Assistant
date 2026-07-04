import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as elevenlabs from '@livekit/agents-plugin-elevenlabs';
import * as sarvam from '@livekit/agents-plugin-sarvam';
import { LANGUAGE_MAP } from './config.js';

type SttProvider = 'deepgram' | 'sarvam' | 'elevenlabs';

export function createSTT(provider: SttProvider, language: string) {
  const lang = LANGUAGE_MAP[language as keyof typeof LANGUAGE_MAP] || LANGUAGE_MAP.en;

  if (provider === 'sarvam') {
    return new sarvam.STT({
      model: 'saaras:v3',
      languageCode: lang.sarvam,
      mode: 'transcribe',
    });
  }
  if (provider === 'elevenlabs') {
    return new elevenlabs.STT({ languageCode: lang.elevenlabs });
  }
  return new deepgram.STT({
    model: 'nova-3',
    language: lang.deepgram,
    punctuate: true,
    smartFormat: true,
    interimResults: true,
  });
}

export function createTTS(provider: SttProvider, language: string) {
  const lang = LANGUAGE_MAP[language as keyof typeof LANGUAGE_MAP] || LANGUAGE_MAP.en;

  if (provider === 'sarvam') {
    return new sarvam.TTS({
      targetLanguageCode: lang.sarvam,
      model: 'bulbul:v3',
      speaker: 'priya',
    });
  }
  if (provider === 'elevenlabs') {
    return new elevenlabs.TTS({
      voiceId: 'pNInz6obpgDQGcFmaJgB',
      model: 'eleven_turbo_v2_5',
    });
  }
  const voiceMap: Record<string, string> = {
    en: 'aura-2-thalia-en',
    hi: 'aura-2-asteria-en',
    kn: 'aura-2-thalia-en',
  };
  return new deepgram.TTS({ model: voiceMap[language] || 'aura-2-thalia-en' });
}
