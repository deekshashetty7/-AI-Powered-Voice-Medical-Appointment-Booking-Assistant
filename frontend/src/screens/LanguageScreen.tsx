import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../types';
import type { Language } from '../types';
import './screens.css';

const FLAGS: Record<Language, string> = { en: '🇬🇧', hi: '🇮🇳', kn: '🇮🇳' };

export function LanguageScreen() {
  const {
    language, setLanguage, setScreen,
    allowLanguageSwitch, setAllowLanguageSwitch,
  } = useApp();

  return (
    <div className="screen" role="main">
      <div className="screen__content">
        <header className="screen-header">
          <h1 className="text-h1">Choose your language</h1>
          <p className="text-body-sm" style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            The assistant will speak with you in this language throughout your visit.
          </p>
        </header>

        <div className="lang-grid" role="radiogroup" aria-label="Conversation language">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              type="button"
              role="radio"
              aria-checked={language === lang.value}
              className={`lang-card ${language === lang.value ? 'lang-card--selected' : ''}`}
              onClick={() => setLanguage(lang.value)}
            >
              <span className="lang-card__flag" aria-hidden="true">{FLAGS[lang.value]}</span>
              <div>
                <div className="lang-card__native">{lang.native}</div>
                <div className="lang-card__label">{lang.label}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="toggle-row" style={{ marginTop: '1.25rem' }}>
          <div>
            <div className="text-h3">Allow language switching</div>
            <div className="text-caption">Switch between English, Hindi, or Kannada mid-conversation</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={allowLanguageSwitch}
              onChange={(e) => setAllowLanguageSwitch(e.target.checked)}
              aria-label="Allow language switching during conversation"
            />
            <span className="toggle__slider" />
          </label>
        </div>

        <button
          type="button"
          className="btn btn--primary btn--block btn--lg"
          style={{ marginTop: '1.5rem' }}
          onClick={() => setScreen('home')}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
