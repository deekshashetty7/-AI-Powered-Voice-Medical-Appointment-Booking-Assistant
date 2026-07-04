import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './screens.css';

export function SuccessScreen() {
  const { booking, goHome } = useApp();

  useEffect(() => {
    if (!booking) goHome();
  }, [booking, goHome]);

  if (!booking) return null;

  const refId = booking.referenceId || `MV-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="screen success-screen" role="main">
      <div className="screen__content">
        <div className="success-check" aria-hidden="true">
          <svg viewBox="0 0 80 80" width="80" height="80">
            <circle cx="40" cy="40" r="38" fill="#f0fdf4" stroke="#22c55e" strokeWidth="3"/>
            <path d="M24 40l10 10 22-22" stroke="#22c55e" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-display" style={{ textAlign: 'center', color: 'var(--success)' }}>Booked!</h1>
        <p className="text-body-sm" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          Your appointment has been confirmed via voice.
        </p>

        <div className="card card--elevated" style={{ marginTop: '1.5rem' }}>
          <p className="text-overline" style={{ color: 'var(--text-muted)' }}>Reference</p>
          <p className="text-h1" style={{ color: 'var(--primary)' }}>{refId}</p>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />
          <div className="confirm-row"><span className="text-caption">Doctor</span><span>{booking.doctorName}</span></div>
          <div className="confirm-row"><span className="text-caption">Date</span><span>{booking.date} at {booking.startTime}</span></div>
        </div>

        <div className="badge badge--success" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
          🔊 Audio confirmation sent
        </div>

        <button type="button" className="btn btn--outline btn--block btn--lg" style={{ marginTop: '1.5rem' }}>
          Add to calendar
        </button>
        <button type="button" className="btn btn--primary btn--block btn--lg" style={{ marginTop: '0.75rem' }} onClick={goHome}>
          Return home
        </button>
      </div>
    </div>
  );
}
