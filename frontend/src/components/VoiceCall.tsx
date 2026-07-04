import { useEffect, useState, useRef } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useConnectionState,
  useVoiceAssistant,
  BarVisualizer,
  useLocalParticipant,
} from '@livekit/components-react';
import { useKrispNoiseFilter } from '@livekit/components-react/krisp';
import '@livekit/components-styles';
import type { TokenResponse } from '../types';
import { LANGUAGES, STT_PROVIDERS } from '../types';
import { Header } from './Header';
import { VoiceTechBar } from './VoiceTechBar';
import './VoiceCall.css';

interface VoiceCallProps {
  session: TokenResponse;
  onEnd: (error?: string) => void;
}

function CallPanel({
  onEnd,
  intentionalEnd,
}: {
  onEnd: (error?: string) => void;
  intentionalEnd: React.MutableRefObject<boolean>;
}) {
  const connectionState = useConnectionState();
  const { state: agentState, audioTrack } = useVoiceAssistant();
  const { isMicrophoneEnabled } = useLocalParticipant();
  const { setNoiseFilterEnabled, isNoiseFilterEnabled } = useKrispNoiseFilter();
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setNoiseFilterEnabled(true).catch(() => undefined);
  }, [setNoiseFilterEnabled]);

  useEffect(() => {
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const statusLabel = () => {
    if (connectionState === 'connecting') return 'Connecting';
    if (connectionState === 'disconnected') return 'Disconnected';
    switch (agentState) {
      case 'listening': return 'Listening';
      case 'thinking': return 'Processing';
      case 'speaking': return 'Speaking';
      default: return 'Connected';
    }
  };

  const hintText = () => {
    if (connectionState === 'connecting') return 'Establishing secure connection…';
    if (agentState === 'listening') return 'Speak now — the assistant is listening';
    if (agentState === 'speaking') return 'You may interrupt at any time';
    if (agentState === 'thinking') return 'Please wait…';
    if (connectionState === 'connected') return 'Virtual receptionist is ready';
    return '';
  };

  const statusClass = agentState || (connectionState === 'connecting' ? 'connecting' : 'idle');

  return (
    <div className="call-panel">
      <div className="call-panel__timer" aria-live="polite">{formatDuration(duration)}</div>

      <div className={`call-panel__avatar call-panel__avatar--${statusClass}`}>
        <div className="call-panel__avatar-inner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 2v20M8 6h8M8 10h8M8 14h8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {audioTrack && (
        <div className="call-panel__visualizer">
          <BarVisualizer
            state={agentState}
            barCount={5}
            trackRef={audioTrack}
            options={{ minHeight: 6 }}
          />
        </div>
      )}

      <div className={`call-panel__status call-panel__status--${statusClass}`}>
        <span className="call-panel__status-dot" />
        {statusLabel()}
      </div>

      <VoiceTechBar agentState={agentState} noiseFilterOn={isNoiseFilterEnabled} />

      <p className="call-panel__hint">{hintText()}</p>

      <div className="call-panel__meta">
        <span className={`call-panel__chip ${isMicrophoneEnabled ? 'call-panel__chip--on' : ''}`}>
          Mic {isMicrophoneEnabled ? 'on' : 'off'}
        </span>
        <span className="call-panel__chip call-panel__chip--on">Audio on</span>
      </div>

      <button
        type="button"
        className="btn btn--danger"
        onClick={() => { intentionalEnd.current = true; onEnd(); }}
      >
        End call
      </button>
    </div>
  );
}

export function VoiceCall({ session, onEnd }: VoiceCallProps) {
  const langLabel = LANGUAGES.find((l) => l.value === session.language)?.native || session.language;
  const sttLabel = STT_PROVIDERS.find((p) => p.value === session.sttProvider)?.label || session.sttProvider;
  const intentionalEnd = useRef(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const handleDisconnected = () => {
    if (intentionalEnd.current) {
      onEnd();
      return;
    }
    onEnd(
      connectError ||
        'Connection lost. Ensure the backend (port 3001) and voice agent (cd agent-node && npm run dev) are running.'
    );
  };

  return (
    <div className="page page--call">
      <Header />

      <main className="call-main">
        <div className="call-main__meta">
          <span>{langLabel}</span>
          <span className="call-main__sep">·</span>
          <span>{sttLabel}</span>
        </div>

        {connectError && (
          <div className="alert alert--error call-main__alert" role="alert">
            {connectError}
          </div>
        )}

        <div className="call-card animate-fade-in">
          <LiveKitRoom
            serverUrl={session.livekitUrl}
            token={session.token}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={handleDisconnected}
            onError={(err) => setConnectError(err.message)}
          >
            <CallPanel onEnd={onEnd} intentionalEnd={intentionalEnd} />
            <RoomAudioRenderer />
          </LiveKitRoom>
        </div>
      </main>
    </div>
  );
}
