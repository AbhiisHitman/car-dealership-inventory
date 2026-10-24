import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { FormError } from '../components/FormError';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from './AuthLayout';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/inventory', { replace: true });
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to browse the showroom and manage your orders.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="login-email" className="label">Email</label>
          <input id="login-email" className="field" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="login-password" className="label">Password</label>
          <input id="login-password" className="field" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <FormError error={error} />
        <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New here?{' '}
        <Link to="/register" className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
