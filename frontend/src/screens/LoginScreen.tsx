import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { loginUser } from '../api/auth';
import './screens.css';
import './auth.css';

export function LoginScreen() {
  const { login, setScreen } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await loginUser(email, password);
      login(token, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
            <h1 className="text-h1">Welcome back</h1>
            <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign in to MediVoice — for patients and clinic staff
            </p>
          </div>

          {error && <div className="alert alert--error" role="alert" style={{ marginBottom: '1rem' }}>{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account?{' '}
            <button type="button" className="auth-link" onClick={() => setScreen('signup')}>
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
