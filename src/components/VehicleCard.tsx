import { PackagePlus, Pencil, ShoppingCart, Trash2 } from 'lucide-react';
import { formatPrice, stockLabel, stockLevel } from '../lib/format';
import type { Vehicle } from '../lib/types';
import { VehiclePhoto } from './VehiclePhoto';

interface VehicleCardProps {
  vehicle: Vehicle;
  isAdmin: boolean;
  onPurchase(vehicle: Vehicle): void;
  onEdit(vehicle: Vehicle): void;
  onRestock(vehicle: Vehicle): void;
  onDelete(vehicle: Vehicle): void;
}

/** Text colours only: the badge sits on a solid dark chip so it stays readable over any photo. */
const STOCK_STYLES = {
  in: 'text-success',
  low: 'text-warning',
  out: 'text-danger'
} as const;

export function VehicleCard({ vehicle, isAdmin, onPurchase, onEdit, onRestock, onDelete }: VehicleCardProps) {
  const soldOut = vehicle.quantity <= 0;
  const level = stockLevel(vehicle.quantity);
  const title = `${vehicle.make} ${vehicle.model}`;

  return (
    <article className="group panel flex flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-faint" aria-label={title}>
      <div className="relative">
        <VehiclePhoto vehicle={vehicle} className={`h-44 w-full ${soldOut ? 'opacity-55 grayscale' : ''}`} />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span className="rounded-full border border-white/10 bg-ink/75 px-2.5 py-1 text-xs font-medium text-fg backdrop-blur-sm">{vehicle.category}</span>
          <span className={`rounded-full border border-white/10 bg-ink/85 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${STOCK_STYLES[level]}`}>
            {stockLabel(vehicle.quantity)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-faint uppercase">{vehicle.make}</p>
          <h3 className="mt-0.5 text-lg leading-snug font-semibold">{vehicle.model}</h3>
          <p className="mt-1 text-sm text-muted">{[vehicle.year, vehicle.color].filter(Boolean).join(' · ') || 'Specs on request'}</p>
        </div>
        {vehicle.description && <p className="line-clamp-2 text-sm text-muted">{vehicle.description}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <p className="font-display text-2xl font-semibold tabular-nums">{formatPrice(vehicle.price)}</p>
          <button
            onClick={() => onPurchase(vehicle)}
            disabled={soldOut}
            className="btn-primary px-3.5"
            aria-label={soldOut ? `${title} is sold out` : `Purchase ${title}`}
          >
            <ShoppingCart className="size-4" aria-hidden />
            {soldOut ? 'Sold out' : 'Purchase'}
          </button>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 border-t border-line pt-3" role="group" aria-label={`Admin actions for ${title}`}>
            <button onClick={() => onEdit(vehicle)} className="btn-ghost flex-1 px-2 py-2 text-xs">
              <Pencil className="size-3.5" aria-hidden /> Edit
            </button>
            <button onClick={() => onRestock(vehicle)} className="btn-ghost flex-1 px-2 py-2 text-xs">
              <PackagePlus className="size-3.5" aria-hidden /> Restock
            </button>
            <button onClick={() => onDelete(vehicle)} className="btn-danger px-2.5 py-2 text-xs" aria-label={`Delete ${title}`}>
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="panel overflow-hidden" aria-hidden>
      <div className="skeleton h-40" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-5 w-40 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
        <div className="flex justify-between pt-4">
          <div className="skeleton h-7 w-24 rounded" />
          <div className="skeleton h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
