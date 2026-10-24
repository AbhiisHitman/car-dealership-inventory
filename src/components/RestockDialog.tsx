import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import type { Vehicle } from '../lib/types';
import { FormError } from './FormError';
import { Modal } from './Modal';

interface RestockDialogProps {
  vehicle: Vehicle | null;
  onClose(): void;
  onRestocked(vehicle: Vehicle): void;
}

export function RestockDialog({ vehicle, onClose, onRestocked }: RestockDialogProps) {
  const [amount, setAmount] = useState('5');
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAmount('5');
    setError(null);
  }, [vehicle?.id]);

  if (!vehicle) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { vehicle: updated } = await api.restock(vehicle.id, Number(amount));
      onRestocked(updated);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Restock" description={`${vehicle.make} ${vehicle.model} · ${vehicle.quantity} in stock now`}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="restock-amount" className="label">Units to add</label>
          <input id="restock-amount" className="field" type="number" min={1} max={1000} step={1} value={amount} onChange={e => setAmount(e.target.value)} />
          <div className="mt-2 flex gap-2">
            {[1, 5, 10, 25].map(n => (
              <button key={n} type="button" className="chip" aria-pressed={amount === String(n)} onClick={() => setAmount(String(n))}>
                +{n}
              </button>
            ))}
          </div>
        </div>
        <FormError error={error} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Restocking...' : `Add ${amount || 0} units`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
