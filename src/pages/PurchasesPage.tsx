import { Receipt, Warehouse } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { FormError } from '../components/FormError';
import { Spinner } from '../components/Spinner';
import { api } from '../lib/api';
import { formatDate, formatPrice } from '../lib/format';
import type { Purchase } from '../lib/types';

export function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    api
      .purchases()
      .then(({ purchases }) => setPurchases(purchases))
      .catch(setError);
  }, []);

  const total = purchases?.reduce((sum, p) => sum + p.total, 0) ?? 0;
  const units = purchases?.reduce((sum, p) => sum + p.quantity, 0) ?? 0;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <p className="text-sm text-muted">Everything you have driven off the lot</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">My garage</h1>
      </header>

      {error ? <FormError error={error} /> : null}
      {!purchases && !error && <Spinner label="Opening the garage doors" />}

      {purchases && purchases.length === 0 && (
        <div className="panel flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-surface-3 text-muted">
            <Warehouse className="size-6" aria-hidden />
          </span>
          <h2 className="text-lg font-semibold">Your garage is empty</h2>
          <p className="text-sm text-muted">Find something you like in the showroom.</p>
          <Link to="/inventory" className="btn-primary mt-2">
            Browse the showroom
          </Link>
        </div>
      )}

      {purchases && purchases.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="panel px-4 py-3.5">
              <p className="text-xs font-medium tracking-wide text-muted uppercase">Vehicles owned</p>
              <p className="font-display text-2xl font-semibold tabular-nums">{units}</p>
            </div>
            <div className="panel px-4 py-3.5">
              <p className="text-xs font-medium tracking-wide text-muted uppercase">Total spent</p>
              <p className="font-display text-2xl font-semibold tabular-nums">{formatPrice(total)}</p>
            </div>
          </div>
          <ul className="panel divide-y divide-line" aria-label="Purchase history">
            {purchases.map(p => (
              <li key={p.id} className="flex items-center gap-4 px-4 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
                  <Receipt className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.vehicleLabel}</p>
                  <p className="text-sm text-muted">
                    {formatDate(p.createdAt)} · {p.quantity} × {formatPrice(p.unitPrice)}
                    {p.vehicleId === null && ' · no longer listed'}
                  </p>
                </div>
                <p className="font-display font-semibold tabular-nums">{formatPrice(p.total)}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
