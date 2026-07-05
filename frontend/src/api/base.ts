/** Backend origin only — e.g. https://your-app.onrender.com (no trailing /api) */
export function getApiBase(): string {
  let base = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (base.endsWith('/api')) {
    base = base.slice(0, -4);
  }
  return base;
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

export function apiConfigHint(): string {
  const base = getApiBase();
  if (import.meta.env.PROD && !base) {
    return 'Set VITE_API_URL=https://YOUR-RENDER-URL.onrender.com in Vercel (no /api), then redeploy.';
  }
  if (import.meta.env.PROD && base) {
    return `Verify ${base}/health works. VITE_API_URL must be the Render URL only, not .../api`;
  }
  return 'Start backend: cd backend && npm run dev';
}
