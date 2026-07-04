import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchAppointments, type Appointment } from '../api/client';
import './screens.css';

export function AppointmentsScreen() {
  const { setScreen, patientPhone, setPatientPhone, startVoice } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    if (!patientPhone) return;
    setLoading(true);
    fetchAppointments(patientPhone).then((a) => {
      setAppointments(a);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [patientPhone]);

  return (
    <div className="screen" role="main">
      <header className="screen-header screen-header--row">
        <button type="button" className="btn btn--ghost" onClick={() => setScreen('home')} aria-label="Go back">← Back</button>
        <h1 className="text-h1">My appointments</h1>
      </header>

      <div className="screen__content" style={{ paddingTop: 0 }}>
        <div className="card">
          <label className="text-caption" htmlFor="apt-phone">Phone number</label>
          <input id="apt-phone" type="tel" className="home-input" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="+91…" />
          <button type="button" className="btn btn--primary btn--block" style={{ marginTop: '0.75rem' }} onClick={load} disabled={loading}>
            {loading ? 'Loading…' : 'Load appointments'}
          </button>
        </div>

        {appointments.length === 0 && !loading && (
          <p className="text-body-sm" style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
            No upcoming appointments found.
          </p>
        )}

        {appointments.map((apt) => (
          <article key={apt.id} className="card card--elevated" style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 className="text-h3">{apt.doctorName}</h2>
                <p className="text-caption">{apt.specialty}</p>
              </div>
              <span className="badge badge--success">{apt.status}</span>
            </div>
            <p className="text-body-sm" style={{ marginTop: '0.75rem' }}>
              {apt.date} · {apt.startTime} – {apt.endTime}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn--outline" style={{ flex: 1, minHeight: 'var(--touch-min)' }} onClick={() => startVoice(`Reschedule appointment ${apt.id}`)}>
                Reschedule
              </button>
              <button type="button" className="btn btn--ghost" style={{ flex: 1, minHeight: 'var(--touch-min)' }} onClick={() => startVoice(`Cancel appointment ${apt.id}`)}>
                Cancel
              </button>
            </div>
            <button type="button" className="btn btn--ghost btn--block" style={{ marginTop: '0.5rem' }} aria-label="Replay audio confirmation">
              🔊 Replay confirmation
            </button>
          </article>
        ))}

        <button type="button" className="btn btn--secondary btn--block btn--lg" style={{ marginTop: '1.5rem' }} onClick={() => startVoice('I want to book a new appointment')}>
          Book new appointment by voice
        </button>
      </div>
    </div>
  );
}
