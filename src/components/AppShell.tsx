import { Outlet, useLocation } from 'react-router';
import PatternWaves from './reactbits/PatternWaves';
import { Navbar } from './Navbar';

/** Shared chrome: the animated dot-wave backdrop, the navigation bar and the routed page. */
export function AppShell() {
  const { pathname } = useLocation();
  const immersive = pathname === '/';

  return (
    <div className="relative isolate min-h-dvh">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <PatternWaves
          preset="silk"
          color="#8aa4ff"
          backgroundColor="#05060a"
          spacing={11}
          opacity={immersive ? 0.85 : 0.4}
          fade={immersive ? 'edges' : 'top'}
          fadeSize={immersive ? 0.6 : 0.9}
          cursorSize={60}
          cursorStrength={0.5}
        />
      </div>
      <Navbar />
      <Outlet />
    </div>
  );
}
