import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { setupFirstAdmin } from '../services/auth.js';
import fallbackSettings from '../../data/settings.json';

export default function Login() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login'); // 'login' | 'setup'
  const [form, setForm] = useState({ username: '', password: '', setupToken: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (status === 'authenticated') {
    const redirectTo = location.state?.from || '/admin';
    return <Navigate to={redirectTo} replace />;
  }

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.username, form.password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await setupFirstAdmin(form.username, form.password, form.setupToken);
      await login(form.username, form.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Setup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={fallbackSettings.logo} alt={fallbackSettings.logoText} className="h-14 w-auto" />
          <p className="mt-4 text-sm font-semibold uppercase tracking-[.2em] text-slate-400">Admin</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Field label="Username" value={form.username} onChange={update('username')} autoFocus />
            <Field label="Password" type="password" value={form.password} onChange={update('password')} />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={busy} className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
            <button type="button" onClick={() => { setMode('setup'); setError(''); }} className="w-full text-center text-xs text-slate-400 hover:text-slate-600">
              First time here? Create the admin account
            </button>
          </form>
        ) : (
          <form onSubmit={handleSetup} className="space-y-4">
            <p className="text-xs text-slate-500">
              This one-time setup creates the first admin account. You need the setup token configured on the server
              (see INITIAL-ADMIN-SETUP.md).
            </p>
            <Field label="Setup token" value={form.setupToken} onChange={update('setupToken')} autoFocus />
            <Field label="Username" value={form.username} onChange={update('username')} />
            <Field label="Password" type="password" hint="At least 10 characters" value={form.password} onChange={update('password')} />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button disabled={busy} className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
              {busy ? 'Creating…' : 'Create admin account'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setError(''); }} className="w-full text-center text-xs text-slate-400 hover:text-slate-600">
              Back to sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, hint, ...props }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input {...props} required className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500" />
      {hint && <span className="mt-1 block text-xs font-normal text-slate-400">{hint}</span>}
    </label>
  );
}
