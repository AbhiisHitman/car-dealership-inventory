import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './Spinner';

/** Only signed-in users get past; everyone else is sent to /login and brought back afterwards. */
export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Login and register make no sense once signed in. */
export function RequireGuest() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to="/inventory" replace />;
  return <Outlet />;
}

function FullPageSpinner() {
  return (
    <div className="grid min-h-[60dvh] place-items-center">
      <Spinner label="Checking your session" />
    </div>
  );
}
