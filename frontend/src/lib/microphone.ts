const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export function microphoneBlockedHint(): string {
  return 'Use https://localhost:5173 or your Vercel HTTPS URL — not an IP address like http://192.168.x.x';
}

export function isMicrophoneSecureContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext;
}

export function microphonePermissionDeniedHelp(): string {
  return [
    'How to fix microphone permission denied:',
    '1. Click the lock/tune icon in the browser address bar → Microphone → Allow.',
    '2. Windows: Settings → Privacy & security → Microphone → allow access for your browser.',
    '3. Close Zoom, Teams, or other apps that may be using the mic.',
    '4. Use Chrome or Edge on http://localhost:5173 (local) or your Vercel HTTPS URL.',
    '5. If you clicked Block before, reset site permissions and tap the mic again.',
  ].join(' ');
}

export function parseMicrophoneError(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return `Microphone access denied. ${microphonePermissionDeniedHelp()}`;
    }
    if (err.name === 'NotFoundError') {
      return 'No microphone found. Connect a microphone and try again.';
    }
    if (err.name === 'NotReadableError') {
      return 'Microphone is busy or unavailable. Close other apps using the mic and try again.';
    }
  }
  if (err instanceof Error) return err.message;
  return `Could not access microphone. ${microphoneBlockedHint()}`;
}

/** Start mic capture immediately on user gesture — do not await anything before calling this. */
export function requestMicrophoneStream(): Promise<MediaStream> {
  if (!isMicrophoneSecureContext()) {
    return Promise.reject(
      new Error(
        'Microphone requires a secure page. Open http://localhost:5173 on this PC, or use your Vercel HTTPS URL — not http://192.168.x.x.',
      ),
    );
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return Promise.reject(
      new Error('Microphone is not supported in this browser. Use Chrome or Edge on HTTPS.'),
    );
  }
  return navigator.mediaDevices.getUserMedia({ audio: AUDIO_CONSTRAINTS });
}

export function stopMicrophoneStream(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((track) => track.stop());
}
