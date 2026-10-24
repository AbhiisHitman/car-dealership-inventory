import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-7xl font-semibold text-faint">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Wrong turn</h1>
      <p className="mt-2 text-muted">That page took a different exit. Let us get you back on the road.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to the start
      </Link>
    </main>
  );
}
