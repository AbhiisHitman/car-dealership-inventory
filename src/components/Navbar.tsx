import { CarFront, LogOut, ShieldCheck, Warehouse } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-surface-3 text-fg' : 'text-muted hover:text-fg'
  }`;

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/70 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6" aria-label="Main">
        <Link to="/" aria-label="Driftline Motors home">
          <Logo />
        </Link>

        {user ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/inventory" className={linkClass}>
              <CarFront className="size-4" aria-hidden />
              <span className="hidden sm:inline">Showroom</span>
            </NavLink>
            <NavLink to="/garage" className={linkClass}>
              <Warehouse className="size-4" aria-hidden />
              <span className="hidden sm:inline">My garage</span>
            </NavLink>
            <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
            <span className="hidden items-center gap-2 text-sm md:flex">
              <span className="max-w-36 truncate text-fg">{user.name}</span>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
                  <ShieldCheck className="size-3" aria-hidden /> Admin
                </span>
              )}
            </span>
            <button onClick={signOut} className="icon-btn" aria-label="Sign out" title="Sign out">
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn px-3 text-muted hover:text-fg">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary px-3.5">
              Create account
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
