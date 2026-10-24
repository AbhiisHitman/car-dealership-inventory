import { Gauge, Search, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import CrystalizedBall from '../components/reactbits/CrystalizedBall';
import FlyingButton from '../components/reactbits/FlyingButton';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: Search, title: 'Search that keeps up', text: 'Filter by make, model, category and price, with results as you type.' },
  { icon: Gauge, title: 'Live stock levels', text: 'Every purchase updates inventory instantly. Two buyers never get the last car.' },
  { icon: ShieldCheck, title: 'Admin control', text: 'Staff add, edit, restock and retire vehicles from the same showroom.' }
];

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const destination = user ? '/inventory' : '/register';

  // Let the button finish lifting off before the page changes.
  const enter = () => window.setTimeout(() => navigate(destination), 700);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <section className="grid items-center gap-8 pt-10 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[1.1fr_1fr] lg:pt-0">
        <div className="rise-in">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-medium text-muted">
            <span className="size-1.5 rounded-full bg-success" /> Live inventory, updated with every sale
          </p>
          <h1 className="mt-5 text-4xl leading-[1.05] font-semibold sm:text-6xl">
            See your next car
            <br />
            <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">before you drive it.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
            Driftline Motors is a live dealership inventory. Browse the showroom, filter down to the one, and buy it in two clicks.
          </p>

          <div className="mt-6 h-56 max-w-md overflow-hidden rounded-2xl border border-line bg-ink/60 sm:h-60">
            <FlyingButton size="large" altitude={150} hoverTime={2.2} buttonColor="#1a2033" thrustColor="#8ec5ff" onClick={enter}>
              {user ? 'Enter the showroom' : 'Get the keys'}
            </FlyingButton>
          </div>
          <p className="mt-3 text-sm text-faint">
            Hover the button to lift off.{' '}
            {user ? (
              <Link className="text-accent hover:underline" to="/inventory">
                Or go straight to the showroom.
              </Link>
            ) : (
              <>
                Already a customer?{' '}
                <Link className="text-accent hover:underline" to="/login">
                  Sign in
                </Link>
                .
              </>
            )}
          </p>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[560px]" aria-hidden>
          <CrystalizedBall preset="nebula" color="#8b7bff" size={0.82} fill={0.45} hoverStrength={0.8} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Features">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="panel p-5">
            <span className="grid size-10 place-items-center rounded-xl bg-accent/12 text-accent">
              <Icon className="size-5" aria-hidden />
            </span>
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
