import type { AgentState } from '@livekit/components-react';

const FEATURES: {
  id: string;
  label: string;
  activeWhen: 'always' | AgentState[];
}[] = [
  { id: 'vad', label: 'VAD', activeWhen: ['listening', 'thinking'] },
  { id: 'turn', label: 'Turn Detection', activeWhen: 'always' },
  { id: 'noise', label: 'Noise Cancellation', activeWhen: 'always' },
  { id: 'barge', label: 'Barge-in', activeWhen: ['speaking'] },
];

interface VoiceTechBarProps {
  agentState?: AgentState;
  noiseFilterOn: boolean;
}

export function VoiceTechBar({ agentState, noiseFilterOn }: VoiceTechBarProps) {
  const isActive = (feature: (typeof FEATURES)[number]) => {
    if (feature.activeWhen === 'always') {
      return feature.id === 'noise' ? noiseFilterOn : true;
    }
    return !!agentState && feature.activeWhen.includes(agentState);
  };

  return (
    <div className="voice-tech" aria-label="Voice technology status">
      {FEATURES.map((f) => (
        <span
          key={f.id}
          className={`voice-tech__item ${isActive(f) ? 'voice-tech__item--on' : ''}`}
          title={f.label}
        >
          <span className="voice-tech__dot" />
          {f.label}
        </span>
      ))}
    </div>
  );
}
