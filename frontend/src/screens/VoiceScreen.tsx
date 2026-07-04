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
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../types';
import { VoiceTechBar } from '../components/VoiceTechBar';
import './screens.css';
import './voice-screen.css';

function VoicePanel({ onEnd, intentionalEnd }: {
  onEnd: (error?: string) => void;
  intentionalEnd: React.MutableRefObject<boolean>;
}) {
  const connectionState = useConnectionState();
  const { state: agentState, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const { setNoiseFilterEnabled, isNoiseFilterEnabled } = useKrispNoiseFilter();
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [caption, setCaption] = useState('');
  const [bargeFlash, setBargeFlash] = useState(false);

  useEffect(() => {
    setNoiseFilterEnabled(true).catch(() => undefined);
  }, [setNoiseFilterEnabled]);

  useEffect(() => {
    const interval = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (agentTranscriptions.length) {
      const last = agentTranscriptions[agentTranscriptions.length - 1];
      if (last?.text) setCaption(last.text);
    }
  }, [agentTranscriptions]);

  useEffect(() => {
    if (agentState === 'listening' && caption) setBargeFlash(true);
    const t = setTimeout(() => setBargeFlash(false), 600);
    return () => clearTimeout(t);
  }, [agentState, caption]);

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const statusLabel = () => {
    if (connectionState === 'connecting') return 'Connecting';
    if (agentState === 'listening') return 'Listening';
    if (agentState === 'thinking') return 'Processing';
    if (agentState === 'speaking') return 'Speaking';
    return 'Connected';
  };

  const statusClass = agentState || (connectionState === 'connecting' ? 'connecting' : 'idle');
  const connectionQuality = connectionState === 'connected' ? 'Excellent' : connectionState === 'connecting' ? 'Connecting…' : 'Poor';

  const toggleMute = async () => {
    await localParticipant.setMicrophoneEnabled(muted);
    setMuted(!muted);
  };

  return (
    <div className={`voice-panel ${bargeFlash ? 'voice-panel--barge' : ''}`}>
      <div className="voice-panel__top">
        <span className="voice-panel__timer" aria-live="polite">{formatDuration(duration)}</span>
        <span className={`voice-panel__quality voice-panel__quality--${connectionState}`}>
          {connectionQuality}
        </span>
      </div>

      <div className={`voice-avatar voice-avatar--${statusClass}`}>
        <div className="voice-avatar__inner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 2v20M8 6h8M8 10h8M8 14h8" strokeLinecap="round" />
          </svg>
        </div>
        {agentState === 'speaking' && <div className="voice-avatar__pulse" aria-hidden="true" />}
      </div>

      <p className="voice-panel__role">AI Receptionist</p>

      {audioTrack && (
        <div className="voice-waveform" aria-hidden="true">
          <BarVisualizer state={agentState} barCount={7} trackRef={audioTrack} options={{ minHeight: 8 }} />
        </div>
      )}

      <div className={`voice-status voice-status--${statusClass}`} role="status" aria-live="polite">
        <span className="voice-status__dot" />
        {statusLabel()}
      </div>

      <VoiceTechBar agentState={agentState} noiseFilterOn={isNoiseFilterEnabled} />

      <div className="voice-caption" aria-live="polite" aria-atomic="true">
        {caption || (agentState === 'listening' ? 'Speak now…' : agentState === 'speaking' ? 'Assistant is speaking…' : 'Starting conversation…')}
      </div>

      {agentState === 'speaking' && (
        <p className="voice-barge-hint">You can interrupt at any time</p>
      )}

      <div className="voice-controls">
        <button
          type="button"
          className={`voice-ctrl-btn ${muted ? 'voice-ctrl-btn--active' : ''}`}
          onClick={toggleMute}
          aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
          aria-pressed={muted}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" aria-hidden="true">
            {muted ? (
              <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V5a3 3 0 00-5.94-.6M12 19v3M5 5l14 14" strokeLinecap="round" />
            ) : (
              <>
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08" />
              </>
            )}
          </svg>
        </button>
        <button
          type="button"
          className="voice-end-btn"
          onClick={() => { intentionalEnd.current = true; onEnd(); }}
          aria-label="End conversation"
        >
          End
        </button>
      </div>
    </div>
  );
}

export function VoiceScreen() {
  const { voiceSession, endVoice } = useApp();
  const intentionalEnd = useRef(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  if (!voiceSession) return null;

  const langLabel = LANGUAGES.find((l) => l.value === voiceSession.language)?.native;

  return (
    <div className="screen voice-screen" role="main" aria-label="Live voice conversation">
      <div className="voice-screen__header">
        <span className="badge badge--live"><span className="badge__dot" />Live</span>
        <span className="text-caption">{langLabel}</span>
      </div>

      {connectError && <div className="alert alert--error" role="alert">{connectError}</div>}

      <LiveKitRoom
        serverUrl={voiceSession.livekitUrl}
        token={voiceSession.token}
        connect
        audio
        video={false}
        onDisconnected={() => {
          if (!intentionalEnd.current) {
            endVoice(connectError || 'Connection lost');
          } else {
            endVoice();
          }
        }}
        onError={(err) => setConnectError(err.message)}
      >
        <VoicePanel
          onEnd={() => endVoice()}
          intentionalEnd={intentionalEnd}
        />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
