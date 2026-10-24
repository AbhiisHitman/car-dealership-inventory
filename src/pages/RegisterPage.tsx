import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { FormError } from '../components/FormError';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from './AuthLayout';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register(form.name, form.email, form.password);
      navigate('/inventory', { replace: true });
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="It takes ten seconds. Then the whole lot is yours to browse.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="register-name" className="label">Full name</label>
          <input id="register-name" className="field" autoComplete="name" required value={form.name} onChange={update('name')} />
        </div>
        <div>
          <label htmlFor="register-email" className="label">Email</label>
          <input id="register-email" className="field" type="email" autoComplete="email" required value={form.email} onChange={update('email')} />
        </div>
        <div>
          <label htmlFor="register-password" className="label">Password</label>
          <input
            id="register-password"
            className="field"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={form.password}
            onChange={update('password')}
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="mt-1.5 text-xs text-faint">At least 8 characters.</p>
        </div>
        <FormError error={error} />
        <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
