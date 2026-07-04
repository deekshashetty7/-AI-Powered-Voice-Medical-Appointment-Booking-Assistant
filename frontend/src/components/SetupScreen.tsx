import { useState } from 'react';
import type { Language, SttProvider } from '../types';
import { LANGUAGES, STT_PROVIDERS } from '../types';
import { Header } from './Header';
import './SetupScreen.css';

interface SetupScreenProps {
  onStart: (config: { language: Language; sttProvider: SttProvider; patientName: string }) => void;
  loading: boolean;
  error: string | null;
}

const CAPABILITIES = [
  'Book appointments',
  'Check availability',
  'Reschedule or cancel',
  'Doctor & clinic info',
];

export function SetupScreen({ onStart, loading, error }: SetupScreenProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [sttProvider, setSttProvider] = useState<SttProvider>('deepgram');
  const [patientName, setPatientName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ language, sttProvider, patientName: patientName.trim() || 'Patient' });
  };

  return (
    <div className="page">
      <Header />

      <main className="page__main">
        <div className="page__container animate-fade-in">
          <section className="hero">
            <h2 className="hero__title">Book appointments by voice</h2>
            <p className="hero__text">
              Speak naturally with our AI receptionist. No login required — just start a call
              and tell us what you need.
            </p>
            <ul className="hero__list">
              {CAPABILITIES.map((item) => (
                <li key={item}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <div className="card__header">
              <h3 className="card__title">Start voice session</h3>
              <p className="card__desc">Configure your preferences, then begin the call.</p>
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="form__field">
                <label htmlFor="patientName" className="form__label">Your name</label>
                <input
                  id="patientName"
                  type="text"
                  className="form__input"
                  placeholder="Optional"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div className="form__field">
                <label htmlFor="language" className="form__label">Language</label>
                <select
                  id="language"
                  className="form__select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label} ({lang.native})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form__field">
                <span className="form__label">Speech-to-text provider</span>
                <div className="provider-list">
                  {STT_PROVIDERS.map((provider) => (
                    <label
                      key={provider.value}
                      className={`provider-option ${sttProvider === provider.value ? 'provider-option--active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="sttProvider"
                        value={provider.value}
                        checked={sttProvider === provider.value}
                        onChange={() => setSttProvider(provider.value)}
                        className="provider-option__input"
                      />
                      <span className="provider-option__name">{provider.label}</span>
                      <span className="provider-option__desc">{provider.description}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="alert alert--error" role="alert">
                  {error}
                </div>
              )}

              <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
                {loading ? (
                  <>
                    <span className="btn__spinner" aria-hidden="true" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                    Start voice call
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </main>

      <footer className="page__footer">
        <p>© {new Date().getFullYear()} Trikon Medical Center · Open Mon–Sat, 9 AM – 5 PM</p>
      </footer>
    </div>
  );
}
