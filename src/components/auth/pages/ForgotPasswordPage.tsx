import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import AuthShell from '../components/AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err: any) {
      const m = err?.response?.data?.message;
      setError(Array.isArray(m) ? m.join(', ') : m || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Forgot Password">
      <p className="text-sm text-gray-600 text-center">
        Enter your email and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {busy ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      {message && <p className="text-green-600 text-center">{message}</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div className="text-center">
        <Link to="/auth" className="text-blue-600 hover:underline text-sm">
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}
