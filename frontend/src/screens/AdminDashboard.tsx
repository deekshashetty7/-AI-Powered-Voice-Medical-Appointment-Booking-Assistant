import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchAdminStats } from '../api/auth';
import './screens.css';
import './auth.css';
import './admin.css';

export function AdminDashboard() {
  const { user, authToken, logout } = useApp();
  const [stats, setStats] = useState({ doctors: 0, specialties: 0, appointments: 0, patients: 0 });

  useEffect(() => {
    if (!authToken) return;
    fetchAdminStats(authToken).then(setStats).catch(() => undefined);
  }, [authToken]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="screen admin" role="main">
      <header className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 className="text-h1">Admin Dashboard</h1>
            <p className="text-caption">Trikon Medical Center · Voice analytics</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="text-caption">{user.name}</span>
            <button type="button" className="btn btn--ghost" onClick={logout}>Sign out</button>
          </div>
        </div>
      </header>

      <div className="screen__content screen__content--wide admin-grid">
        <div className="admin-stat card card--elevated">
          <p className="text-overline">Today's bookings</p>
          <p className="admin-stat__value">{stats.appointments}</p>
          <p className="text-caption">Via voice assistant</p>
        </div>
        <div className="admin-stat card card--elevated">
          <p className="text-overline">Registered patients</p>
          <p className="admin-stat__value">{stats.patients}</p>
        </div>
        <div className="admin-stat card card--elevated">
          <p className="text-overline">Active voice sessions</p>
          <p className="admin-stat__value">—</p>
          <span className="badge badge--live"><span className="badge__dot" />LiveKit</span>
        </div>
        <div className="admin-stat card card--elevated">
          <p className="text-overline">Doctors</p>
          <p className="admin-stat__value">{stats.doctors}</p>
        </div>
        <div className="admin-stat card card--elevated">
          <p className="text-overline">Specialties</p>
          <p className="admin-stat__value">{stats.specialties}</p>
        </div>

        <div className="admin-panel card card--elevated admin-panel--wide">
          <h2 className="text-h2">Voice interaction metrics</h2>
          <div className="admin-metrics">
            <div className="admin-metric"><span>VAD sessions</span><strong>Active</strong></div>
            <div className="admin-metric"><span>Turn detection</span><strong>LiveKit EOT</strong></div>
            <div className="admin-metric"><span>Noise cancellation</span><strong>Krisp</strong></div>
            <div className="admin-metric"><span>Barge-in rate</span><strong>Enabled</strong></div>
            <div className="admin-metric"><span>Avg latency</span><strong>&lt; 500ms</strong></div>
          </div>
        </div>

        <div className="admin-panel card card--elevated admin-panel--wide">
          <h2 className="text-h2">Language usage</h2>
          <div className="admin-lang-bars">
            <div className="admin-bar"><span>English</span><div className="admin-bar__track"><div className="admin-bar__fill" style={{ width: '55%' }} /></div><span>55%</span></div>
            <div className="admin-bar"><span>Hindi</span><div className="admin-bar__track"><div className="admin-bar__fill admin-bar__fill--teal" style={{ width: '30%' }} /></div><span>30%</span></div>
            <div className="admin-bar"><span>Kannada</span><div className="admin-bar__track"><div className="admin-bar__fill admin-bar__fill--teal" style={{ width: '15%' }} /></div><span>15%</span></div>
          </div>
        </div>

        <div className="admin-panel card card--elevated">
          <h2 className="text-h2">System status</h2>
          <ul className="admin-list">
            <li><span className="badge badge--success">Backend API</span></li>
            <li><span className="badge badge--success">Neon PostgreSQL</span></li>
            <li><span className="badge badge--success">LiveKit Cloud</span></li>
            <li><span className="badge badge--live">Voice Agent</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
