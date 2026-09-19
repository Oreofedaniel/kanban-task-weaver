import { useState, FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import AuthShell from '../components/AuthShell';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setDone(true);
    } catch (err: any) {
      const m = err?.response?.data?.message;
      setError(Array.isArray(m) ? m.join(', ') : m || 'Could not reset your password.');
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Reset Password">
        <p className="text-red-500 text-center">This reset link is invalid.</p>
        <div className="text-center">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Request a new link
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password Updated">
        <p className="text-green-600 text-center font-medium">Your password has been reset.</p>
        <div className="text-center">
          <Link to="/auth" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset Password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">New password</label>
          <input
            type="password"
            required
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm password</label>
          <input
            type="password"
            required
            className="w-full p-2 border rounded"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {busy ? 'Saving...' : 'Reset password'}
        </button>
      </form>
      {error && <p className="text-red-500 text-center">{error}</p>}
    </AuthShell>
  );
}
