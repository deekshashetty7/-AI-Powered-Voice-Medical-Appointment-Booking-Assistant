import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { registerUser } from '../api/auth';
import './screens.css';
import './auth.css';

export function SignupScreen() {
  const { login, setScreen } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await registerUser({
        email,
        password,
        name,
        phone: phone || undefined,
        role: 'PATIENT',
      });
      login(token, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen auth-screen" role="main">
      <div className="screen__content">
        <div className="auth-card card card--elevated">
          <div className="auth-header">
            <div className="auth-logo" aria-hidden="true">MV</div>
            <h1 className="text-h1">Create account</h1>
            <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
              Join MediVoice to manage your medical appointments
            </p>
          </div>

          {error && <div className="alert alert--error" role="alert" style={{ marginBottom: '1rem' }}>{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="signup-phone">Phone (optional)</label>
              <input
                id="signup-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={loading}>
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <button type="button" className="auth-link" onClick={() => setScreen('login')}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
