import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import AuthShell from '../components/AuthShell';

type State =
  | { kind: 'loading' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setState({ kind: 'error', message: 'This verification link is invalid.' });
      return;
    }

    let cancelled = false;
    api
      .post<{ message: string }>('/auth/verify-email', { token })
      .then(({ data }) => !cancelled && setState({ kind: 'success', message: data.message }))
      .catch((err) => {
        if (cancelled) return;
        const detail: string = err?.response?.data?.message || '';
        setState({
          kind: 'error',
          message: /invalid|expired/i.test(detail)
            ? 'This verification link is invalid or has expired.'
            : detail || 'Verification failed. Please try again.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <AuthShell title="Email Verification">
      {state.kind === 'loading' && <p className="text-center text-gray-600">Verifying your email...</p>}

      {state.kind === 'success' && (
        <div className="space-y-4 text-center">
          <p className="text-green-600 font-medium">{state.message}</p>
          <Link to="/auth" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Continue to login
          </Link>
        </div>
      )}

      {state.kind === 'error' && (
        <div className="space-y-4 text-center">
          <p className="text-red-500 font-medium">{state.message}</p>
          <Link
            to="/resend-verification"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Send me a new link
          </Link>
          <div>
            <Link to="/auth" className="text-blue-600 hover:underline text-sm">
              Back to login
            </Link>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
