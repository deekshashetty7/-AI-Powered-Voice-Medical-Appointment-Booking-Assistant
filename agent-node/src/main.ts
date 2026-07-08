import './config.js';
import { ServerOptions, cli, defineAgent, inference, voice } from '@livekit/agents';
import { fileURLToPath } from 'node:url';
import { MedicalReceptionist } from './agent.js';
import { GREETINGS } from './config.js';
import { createSTT, createTTS } from './providers.js';

type SttProvider = 'deepgram' | 'sarvam' | 'elevenlabs';

type RoomMetadata = {
  language?: string;
  sttProvider?: SttProvider;
  patientName?: string;
  patientPhone?: string;
  intent?: string;
};

export default defineAgent({
  entry: async (ctx) => {
    let metadata: RoomMetadata = {};
    try {
      metadata = JSON.parse(ctx.room.metadata || '{}');
    } catch {
      metadata = {};
    }

    const language = metadata.language || 'en';
    const sttProvider = metadata.sttProvider || 'deepgram';
    const intent = metadata.intent?.trim() || '';
    const patientPhone = metadata.patientPhone?.trim() || '';

    await ctx.connect();
    await ctx.waitForParticipant();

    const session = new voice.AgentSession({
      vad: new inference.VAD(),
      stt: createSTT(sttProvider, language),
      tts: createTTS(sttProvider, language),
      turnHandling: {
        turnDetection: new inference.TurnDetector(),
        preemptiveGeneration: { enabled: true },
        interruption: { enabled: true },
        endpointing: { minDelay: 0.5, maxDelay: 3.0 },
      },
    });

    await session.start({
      agent: new MedicalReceptionist(language),
      room: ctx.room,
      inputOptions: {
        textEnabled: false,
        audioEnabled: true,
      },
    });

    const greeting = GREETINGS[language] || GREETINGS.en;

    if (intent) {
      session.generateReply({
        instructions: [
          `Greet the patient warmly. Say: ${greeting}`,
          `The patient already stated their request: "${intent}".`,
          patientPhone ? `Their phone number on file is ${patientPhone}.` : '',
          'Acknowledge their request and help them right away. Ask only what you still need.',
        ]
          .filter(Boolean)
          .join(' '),
      });
    } else {
      session.say(greeting);
    }
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: 'medivoice-agent',
  })
);
