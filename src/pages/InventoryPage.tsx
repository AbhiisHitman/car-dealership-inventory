import { CarFront, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FilterBar, type ViewOptions } from '../components/FilterBar';
import { FormError } from '../components/FormError';
import { PurchaseDialog } from '../components/PurchaseDialog';
import { RestockDialog } from '../components/RestockDialog';
import { StatsStrip } from '../components/StatsStrip';
import { VehicleCard, VehicleCardSkeleton } from '../components/VehicleCard';
import { VehicleFormDialog } from '../components/VehicleFormDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useInventory, useVisibleVehicles } from '../hooks/useInventory';
import { api } from '../lib/api';
import { formatPrice } from '../lib/format';
import type { SearchFilters, Vehicle } from '../lib/types';

const NO_FILTERS: SearchFilters = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };
const DEFAULT_OPTIONS: ViewOptions = { inStockOnly: false, sort: 'featured' };

type Dialog =
  | { kind: 'purchase'; vehicle: Vehicle }
  | { kind: 'edit'; vehicle: Vehicle | null }
  | { kind: 'restock'; vehicle: Vehicle }
  | { kind: 'delete'; vehicle: Vehicle }
  | null;

export function InventoryPage() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [filters, setFilters] = useState<SearchFilters>(NO_FILTERS);
  const [options, setOptions] = useState<ViewOptions>(DEFAULT_OPTIONS);
  const [dialog, setDialog] = useState<Dialog>(null);
  const { vehicles, stats, loading, error, replace, remove, reload } = useInventory(filters);
  const visible = useVisibleVehicles(vehicles, options.inStockOnly, options.sort);
  const close = () => setDialog(null);
  const firstName = user?.name.split(' ')[0];

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Welcome back{firstName ? `, ${firstName}` : ''}</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">The showroom</h1>
        </div>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setDialog({ kind: 'edit', vehicle: null })}>
            <Plus className="size-4" aria-hidden /> Add vehicle
          </button>
        )}
      </header>

      <StatsStrip stats={stats} isAdmin={isAdmin} />

      <FilterBar
        filters={filters}
        options={options}
        categories={stats?.categories ?? []}
        onFiltersChange={setFilters}
        onOptionsChange={setOptions}
        onReset={() => {
          setFilters(NO_FILTERS);
          setOptions(DEFAULT_OPTIONS);
        }}
      />

      <section aria-label="Vehicles" aria-busy={loading}>
        <p className="mb-3 text-sm text-muted" aria-live="polite">
          {loading ? 'Searching the lot...' : `${visible.length} ${visible.length === 1 ? 'vehicle' : 'vehicles'}`}
        </p>

        {error ? (
          <div className="panel space-y-4 p-6">
            <FormError error={error} />
            <button className="btn-ghost" onClick={reload}>
              <RefreshCw className="size-4" aria-hidden /> Try again
            </button>
          </div>
        ) : loading && vehicles.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="panel flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-surface-3 text-muted">
              <CarFront className="size-6" aria-hidden />
            </span>
            <h2 className="text-lg font-semibold">No cars match those filters</h2>
            <p className="max-w-sm text-sm text-muted">Try a wider price range or a different category.</p>
          </div>
        ) : (
          <div className={`grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${loading ? 'opacity-60' : ''}`}>
            {visible.map(vehicle => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isAdmin={isAdmin}
                onPurchase={v => setDialog({ kind: 'purchase', vehicle: v })}
                onEdit={v => setDialog({ kind: 'edit', vehicle: v })}
                onRestock={v => setDialog({ kind: 'restock', vehicle: v })}
                onDelete={v => setDialog({ kind: 'delete', vehicle: v })}
              />
            ))}
          </div>
        )}
      </section>

      <PurchaseDialog
        vehicle={dialog?.kind === 'purchase' ? dialog.vehicle : null}
        onClose={close}
        onPurchased={(vehicle, purchase) => {
          replace(vehicle);
          setDialog({ kind: 'purchase', vehicle });
          toast.success(`Purchased ${purchase.quantity} × ${purchase.vehicleLabel} for ${formatPrice(purchase.total)}`);
        }}
      />

      {isAdmin && (
        <>
          <VehicleFormDialog
            open={dialog?.kind === 'edit'}
            vehicle={dialog?.kind === 'edit' ? dialog.vehicle : null}
            categories={stats?.categories ?? []}
            onClose={close}
            onSaved={(vehicle, created) => {
              close();
              if (created) reload();
              else replace(vehicle);
              toast.success(created ? `${vehicle.make} ${vehicle.model} added to the lot` : 'Changes saved');
            }}
          />
          <RestockDialog
            vehicle={dialog?.kind === 'restock' ? dialog.vehicle : null}
            onClose={close}
            onRestocked={vehicle => {
              close();
              replace(vehicle);
              toast.success(`${vehicle.make} ${vehicle.model} now has ${vehicle.quantity} in stock`);
            }}
          />
          <ConfirmDialog
            open={dialog?.kind === 'delete'}
            title="Delete this vehicle?"
            message={
              dialog?.kind === 'delete'
                ? `${dialog.vehicle.make} ${dialog.vehicle.model} will be removed from the showroom. Past purchases stay in customers' history.`
                : ''
            }
            confirmLabel="Delete vehicle"
            onClose={close}
            onConfirm={async () => {
              if (dialog?.kind !== 'delete') return;
              await api.deleteVehicle(dialog.vehicle.id);
              remove(dialog.vehicle.id);
              toast.success(`${dialog.vehicle.make} ${dialog.vehicle.model} deleted`);
              close();
            }}
          />
        </>
      )}
    </main>
  );
}
