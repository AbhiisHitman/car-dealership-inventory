import { Boxes, CarFront, CircleSlash, Layers, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatCompactPrice } from '../lib/format';
import type { InventoryStats } from '../lib/types';

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="panel flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-3.5">
      <span className="hidden size-10 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent min-[400px]:grid">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] leading-tight font-medium tracking-wide text-muted uppercase sm:text-xs">{label}</p>
        <p className="font-display text-xl font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export function StatsStrip({ stats, isAdmin }: { stats: InventoryStats | null; isAdmin: boolean }) {
  const show = (value: number | undefined, format: (n: number) => string = String) =>
    value === undefined ? <span className="skeleton inline-block h-6 w-12 rounded" /> : format(value);

  return (
    <section aria-label="Inventory summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat icon={<CarFront className="size-5" />} label="Models on the lot" value={show(stats?.models)} />
      <Stat icon={<Boxes className="size-5" />} label="Units available" value={show(stats?.unitsInStock)} />
      <Stat icon={<CircleSlash className="size-5" />} label="Sold out" value={show(stats?.outOfStock)} />
      {isAdmin ? (
        <Stat icon={<Wallet className="size-5" />} label="Stock value" value={show(stats?.inventoryValue, formatCompactPrice)} />
      ) : (
        <Stat icon={<Layers className="size-5" />} label="Categories" value={show(stats?.categories.length)} />
      )}
    </section>
  );
}
