import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { changePassword } from '../services/auth.js';
import { useToast } from '../hooks/useToast.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { TextField } from '../components/FormField.jsx';

export default function Profile() {
  const { user, setMustChangePassword, mustChangePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      setMustChangePassword(false);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" description="Your admin account." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Account</h2>
          <p className="text-sm text-slate-700">Username: <span className="font-medium">{user?.username}</span></p>
          <p className="text-sm text-slate-700">Role: <span className="font-medium capitalize">{user?.role}</span></p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Change password</h2>
          {mustChangePassword && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              You're using a temporary password. Please set a new one now.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField label="Current password" type="password" value={form.currentPassword} onChange={set('currentPassword')} required />
            <TextField label="New password" type="password" hint="At least 10 characters" value={form.newPassword} onChange={set('newPassword')} required minLength={10} />
            <TextField label="Confirm new password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
            <button disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              {busy ? 'Saving…' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
