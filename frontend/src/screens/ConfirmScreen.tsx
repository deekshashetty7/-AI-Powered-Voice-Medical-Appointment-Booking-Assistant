import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './screens.css';

export function ConfirmScreen() {
  const { booking, setScreen, startVoice } = useApp();

  useEffect(() => {
    if (!booking) setScreen('home');
  }, [booking, setScreen]);

  if (!booking) return null;

  return (
    <div className="screen" role="main">
      <div className="screen__content">
        <div className="confirm-icon" aria-hidden="true">🎙️</div>
        <h1 className="text-h1" style={{ textAlign: 'center' }}>Confirm appointment</h1>
        <p className="text-body-sm" style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          The assistant will confirm these details with you by voice.
        </p>

        <div className="card card--elevated confirm-details">
          <div className="confirm-row"><span className="text-caption">Doctor</span><span className="text-h3">{booking.doctorName}</span></div>
          <div className="confirm-row"><span className="text-caption">Specialty</span><span>{booking.specialty}</span></div>
          <div className="confirm-row"><span className="text-caption">Date</span><span>{booking.date}</span></div>
          <div className="confirm-row"><span className="text-caption">Time</span><span>{booking.startTime}</span></div>
          <div className="confirm-row"><span className="text-caption">Patient</span><span>{booking.patientName}</span></div>
        </div>

        <div className="voice-prompt card" style={{ marginTop: '1rem', background: 'var(--primary-light)' }}>
          <p className="text-body-sm" style={{ fontStyle: 'italic' }}>
            "Would you like me to confirm this appointment?"
          </p>
        </div>

        <button type="button" className="btn btn--primary btn--block btn--lg" style={{ marginTop: '1.5rem' }} onClick={() => startVoice('Yes, please confirm my appointment')}>
          Confirm by voice
        </button>
        <button type="button" className="btn btn--outline btn--block" style={{ marginTop: '0.75rem' }} onClick={() => startVoice('I need to modify my appointment details')}>
          Modify details
        </button>
        <button type="button" className="btn btn--ghost btn--block" style={{ marginTop: '0.5rem' }} onClick={() => setScreen('home')}>
          Cancel
        </button>
      </div>
    </div>
  );
}
