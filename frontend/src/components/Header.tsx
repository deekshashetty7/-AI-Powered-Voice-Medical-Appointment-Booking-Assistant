import './Header.css';

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <div className="app-header__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v20M8 6h8M8 10h8M8 14h8" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="app-header__title">MediVoice</h1>
            <p className="app-header__subtitle">Trikon Medical Center</p>
          </div>
        </div>
        <span className="app-header__badge">Voice Assistant</span>
      </div>
    </header>
  );
}
