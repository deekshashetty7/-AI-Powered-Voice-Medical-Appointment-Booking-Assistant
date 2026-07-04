import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchDoctors, fetchSpecialties, fetchAppointments, type Doctor, type Specialty } from '../api/client';
import { LANGUAGES } from '../types';
import './screens.css';
import './auth.css';

const QUICK_ACTIONS = [
  { id: 'book', label: 'Book Appointment', icon: 'calendar', intent: 'I would like to book an appointment' },
  { id: 'reschedule', label: 'Reschedule', icon: 'refresh', intent: 'I need to reschedule my appointment' },
  { id: 'cancel', label: 'Cancel', icon: 'x', intent: 'I want to cancel my appointment' },
  { id: 'doctors', label: 'Find Doctors', icon: 'search', action: 'doctors' as const },
  { id: 'timings', label: 'Clinic Timings', icon: 'clock', intent: 'What are your clinic hours?' },
];

function ActionIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
    refresh: 'M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006.34 6.34M4 15a8 8 0 0013.66 2.66',
    x: 'M18 6L6 18M6 6l12 12',
    search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35',
    clock: 'M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" aria-hidden="true">
      <path d={icons[type] || icons.calendar} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeScreen() {
  const {
    language, patientPhone, setPatientPhone, startVoice, voiceLoading, voiceError,
    setScreen, user, logout,
  } = useApp();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [appointmentCount, setAppointmentCount] = useState(0);

  const langLabel = LANGUAGES.find((l) => l.value === language)?.native || 'English';

  useEffect(() => {
    fetchDoctors().then(setDoctors);
    fetchSpecialties().then(setSpecialties);
    if (patientPhone) fetchAppointments(patientPhone).then((a) => setAppointmentCount(a.length));
  }, [patientPhone]);

  return (
    <div className="screen" role="main">
      <header className="home-header">
        <div>
          <p className="text-caption">Trikon Medical Center</p>
          <h1 className="text-h1">Hello{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
        </div>
        <span className="badge badge--live">
          <span className="badge__dot" />
          {langLabel}
        </span>
      </header>

      <div className="screen__content" style={{ paddingTop: 0 }}>
        {user && (
          <div className="auth-user-bar">
            <div className="auth-user-bar__info">
              <div className="auth-user-bar__name">{user.name}</div>
              <div className="auth-user-bar__email">{user.email}</div>
            </div>
            <button type="button" className="btn btn--ghost" style={{ minHeight: 'auto', padding: '0.5rem 0.75rem' }} onClick={logout}>
              Sign out
            </button>
          </div>
        )}

        <p className="home-greeting text-body-sm">
          Tap the microphone and speak naturally — like calling a hospital receptionist.
        </p>

        <div className="home-mic-section">
          <button
            type="button"
            className="mic-btn"
            onClick={() => startVoice()}
            disabled={voiceLoading}
            aria-label="Start voice conversation"
          >
            {voiceLoading ? <span className="spinner" /> : (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>
          <p className="text-caption" style={{ marginTop: '1rem', textAlign: 'center' }}>
            Tap to start speaking
          </p>
        </div>

        {voiceError && <div className="alert alert--error" role="alert" style={{ marginBottom: '1rem' }}>{voiceError}</div>}

        <section aria-label="Quick actions">
          <h2 className="text-overline" style={{ marginBottom: '0.75rem', color: 'var(--text-muted)' }}>Quick actions</h2>
          <div className="action-grid">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                className="action-chip"
                onClick={() => {
                  if ('action' in action && action.action === 'doctors') setScreen('doctors');
                  else startVoice(action.intent);
                }}
              >
                <span className="action-chip__icon"><ActionIcon type={action.icon} /></span>
                <span className="action-chip__label">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="card card--elevated" style={{ marginTop: '1.25rem' }}>
          <label className="text-caption" htmlFor="phone">Phone (for appointments)</label>
          <input
            id="phone"
            type="tel"
            className="home-input"
            placeholder="+91 98765 43210"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
            aria-label="Your phone number"
          />
          {appointmentCount > 0 && (
            <button type="button" className="btn btn--outline btn--block" style={{ marginTop: '0.75rem' }} onClick={() => setScreen('appointments')}>
              View {appointmentCount} upcoming appointment{appointmentCount > 1 ? 's' : ''}
            </button>
          )}
        </div>

        {specialties.length > 0 && (
          <section style={{ marginTop: '1.5rem' }} aria-label="Specialties">
            <h2 className="text-h3" style={{ marginBottom: '0.75rem' }}>Specialties</h2>
            <div className="specialty-scroll">
              {specialties.map((s) => (
                <span key={s.id} className="badge">{s.name}</span>
              ))}
            </div>
          </section>
        )}

        {doctors.length > 0 && (
          <section style={{ marginTop: '1.25rem' }} aria-label="Featured doctors">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 className="text-h3">Our doctors</h2>
              <button type="button" className="btn btn--ghost" style={{ minHeight: 'auto', padding: '0.5rem' }} onClick={() => setScreen('doctors')}>See all</button>
            </div>
            {doctors.slice(0, 2).map((d) => (
              <div key={d.id} className="doctor-card-mini card" style={{ marginBottom: '0.5rem' }}>
                <div className="doctor-card-mini__avatar" aria-hidden="true">{d.name.charAt(4) || 'D'}</div>
                <div>
                  <div className="text-h3">{d.name}</div>
                  <div className="text-caption">{d.specialty}</div>
                </div>
              </div>
            ))}
          </section>
        )}

      </div>
    </div>
  );
}
