import { CheckCircle2, Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { formatPrice } from '../lib/format';
import type { Purchase, Vehicle } from '../lib/types';
import { VehiclePhoto } from './VehiclePhoto';
import { FormError } from './FormError';
import { Modal } from './Modal';
import FlyingButton from './reactbits/FlyingButton';

interface PurchaseDialogProps {
  vehicle: Vehicle | null;
  onClose(): void;
  onPurchased(vehicle: Vehicle, purchase: Purchase): void;
}

const MAX_PER_ORDER = 5;

/** Checkout for one vehicle. The confirm button takes off when the order goes through. */
export function PurchaseDialog({ vehicle, onClose, onPurchased }: PurchaseDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<unknown>(null);
  const [done, setDone] = useState<Purchase | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    setQuantity(1);
    setError(null);
    setDone(null);
    busy.current = false;
  }, [vehicle?.id]);

  if (!vehicle) return null;
  const max = Math.min(vehicle.quantity, MAX_PER_ORDER);
  const title = `${vehicle.year ?? ''} ${vehicle.make} ${vehicle.model}`.trim();

  const confirm = async () => {
    if (busy.current || done) return;
    busy.current = true;
    setError(null);
    try {
      const result = await api.purchase(vehicle.id, quantity);
      setDone(result.purchase);
      onPurchased(result.vehicle, result.purchase);
    } catch (err) {
      setError(err);
      busy.current = false;
    }
  };

  return (
    <Modal open onClose={onClose} title={done ? 'It is yours.' : 'Confirm purchase'} description={title}>
      <div className="flex items-center gap-4 rounded-xl border border-line bg-surface-2 p-3">
        <VehiclePhoto vehicle={vehicle} showCredit={false} className="h-16 w-28 shrink-0 rounded-lg" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{title}</p>
          <p className="text-sm text-muted">
            {formatPrice(vehicle.price)} each · {vehicle.quantity} available
          </p>
        </div>
      </div>

      {done ? (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
          <p>
            Order placed for {done.quantity} × {done.vehicleLabel}, total <strong>{formatPrice(done.total)}</strong>. You can find it in
            your garage.
          </p>
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-sm text-muted" id="qty-label">
            Quantity
          </span>
          <div className="flex items-center gap-2" role="group" aria-labelledby="qty-label">
            <button className="icon-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
              <Minus className="size-4" />
            </button>
            <output className="w-8 text-center font-display text-lg font-semibold tabular-nums" aria-live="polite">
              {quantity}
            </output>
            <button className="icon-btn" onClick={() => setQuantity(q => Math.min(max, q + 1))} disabled={quantity >= max} aria-label="Increase quantity">
              <Plus className="size-4" />
            </button>
          </div>
          <p className="font-display text-xl font-semibold tabular-nums">{formatPrice(vehicle.price * quantity)}</p>
        </div>
      )}

      {error ? (
        <div className="mt-4">
          <FormError error={error} />
        </div>
      ) : null}

      <div className="mt-5 h-56 overflow-hidden rounded-xl border border-line bg-ink/80">
        <FlyingButton
          theme="dark"
          size="large"
          trigger="click"
          carryCursor={false}
          altitude={140}
          hoverTime={1.6}
          buttonColor="#1a2033"
          thrustColor="#8ec5ff"
          onClick={confirm}
        >
          {done ? 'Sold. Enjoy the ride' : `Confirm · ${formatPrice(vehicle.price * quantity)}`}
        </FlyingButton>
      </div>
      <p className="mt-2 text-center text-xs text-faint">{done ? 'Close this window whenever you are ready.' : 'Click the button to place your order.'}</p>
    </Modal>
  );
}
