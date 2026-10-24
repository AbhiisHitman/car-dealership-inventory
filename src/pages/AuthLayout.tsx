import type { ReactNode } from 'react';
import CrystalizedBall from '../components/reactbits/CrystalizedBall';

/** Two-column frame for the sign-in and sign-up forms, with the crystal ball on wide screens. */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-2">
      <div className="relative hidden aspect-square w-full max-w-[520px] lg:block" aria-hidden>
        <CrystalizedBall preset="abyss" color="#6f8dff" size={0.78} hoverStrength={0.75} />
      </div>
      <div className="rise-in panel mx-auto w-full max-w-md bg-surface/95 p-6 sm:p-8">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
