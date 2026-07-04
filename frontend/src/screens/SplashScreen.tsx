import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { postLoginScreen } from '../api/auth';
import './screens.css';

export function SplashScreen() {
  const { setScreen, user, authLoading } = useApp();

  useEffect(() => {
    if (authLoading) return;
    const t = setTimeout(() => {
      setScreen(user ? postLoginScreen(user.role) : 'login');
    }, 2500);
    return () => clearTimeout(t);
  }, [setScreen, user, authLoading]);

  return (
    <div className="screen splash" role="main" aria-label="Welcome">
      <div className="splash__content">
        <div className="splash__logo" aria-hidden="true">
          <svg viewBox="0 0 80 80" fill="none">
            <rect width="80" height="80" rx="20" fill="#2563EB"/>
            <circle cx="40" cy="32" r="12" fill="white" opacity="0.9"/>
            <path d="M28 52 Q40 44 52 52" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M40 20v8M40 56v4" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="splash__title">MediVoice</h1>
        <p className="splash__tagline">Book appointments naturally through conversation.</p>
        <p className="splash__clinic">Trikon Medical Center</p>
        <div className="splash__loader" aria-label="Loading">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
