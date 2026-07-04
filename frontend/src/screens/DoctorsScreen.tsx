import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchDoctors, type Doctor } from '../api/client';
import './screens.css';

export function DoctorsScreen() {
  const { setScreen, startVoice } = useApp();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchDoctors(filter || undefined).then(setDoctors);
  }, [filter]);

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const specialties = [...new Set(doctors.map((d) => d.specialty))];

  return (
    <div className="screen" role="main">
      <header className="screen-header screen-header--row">
        <button type="button" className="btn btn--ghost" onClick={() => setScreen('home')} aria-label="Go back">← Back</button>
        <h1 className="text-h1">Find doctors</h1>
      </header>

      <div className="screen__content" style={{ paddingTop: 0 }}>
        <input
          type="search"
          className="home-input"
          placeholder="Search by name or specialty…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search doctors"
        />

        <div className="specialty-scroll" style={{ margin: '0.75rem 0' }}>
          <button type="button" className={`badge ${!filter ? 'badge--active' : ''}`} onClick={() => setFilter('')}>All</button>
          {specialties.map((s) => (
            <button key={s} type="button" className={`badge ${filter === s ? 'badge--active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>

        <div className="doctor-list">
          {filtered.map((d) => (
            <article key={d.id} className="doctor-card card card--elevated">
              <div className="doctor-card__header">
                <div className="doctor-card__avatar" aria-hidden="true">
                  {d.name.replace('Dr. ', '').charAt(0)}
                </div>
                <div>
                  <h2 className="text-h3">{d.name}</h2>
                  <p className="text-caption">{d.specialty}</p>
                </div>
              </div>
              {d.bio && <p className="text-body-sm" style={{ color: 'var(--text-secondary)', margin: '0.75rem 0' }}>{d.bio}</p>}
              <div className="doctor-card__meta">
                <span className="badge">★ 4.8</span>
                <span className="badge">EN · HI</span>
                <span className="badge badge--success">Mon–Sat 9–5</span>
              </div>
              <button
                type="button"
                className="btn btn--secondary btn--block"
                style={{ marginTop: '1rem' }}
                onClick={() => startVoice(`I want to book an appointment with ${d.name}`)}
              >
                Book by voice
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
