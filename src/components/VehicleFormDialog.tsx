import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import type { Vehicle, VehicleInput } from '../lib/types';
import { FormError } from './FormError';
import { Modal } from './Modal';

interface VehicleFormDialogProps {
  open: boolean;
  /** When set the form edits this vehicle, otherwise it creates a new one. */
  vehicle: Vehicle | null;
  categories: string[];
  onClose(): void;
  onSaved(vehicle: Vehicle, created: boolean): void;
}

type FormState = Record<
  'make' | 'model' | 'category' | 'price' | 'quantity' | 'year' | 'color' | 'description' | 'imageUrl' | 'imageCredit' | 'imageSourceUrl',
  string
>;

const EMPTY: FormState = {
  make: '',
  model: '',
  category: '',
  price: '',
  quantity: '1',
  year: '',
  color: '',
  description: '',
  imageUrl: '',
  imageCredit: '',
  imageSourceUrl: ''
};

const toForm = (v: Vehicle): FormState => ({
  make: v.make,
  model: v.model,
  category: v.category,
  price: String(v.price),
  quantity: String(v.quantity),
  year: v.year ? String(v.year) : '',
  color: v.color ?? '',
  description: v.description ?? '',
  imageUrl: v.imageUrl ?? '',
  imageCredit: v.imageCredit ?? '',
  imageSourceUrl: v.imageSourceUrl ?? ''
});

/** Blank numeric inputs become NaN, which JSON sends as null so the API reports them as missing. */
const toNumber = (value: string) => (value.trim() === '' ? Number.NaN : Number(value));

/** Converts the text inputs into the API payload; blanks become null for optional fields. */
export function toPayload(form: FormState): VehicleInput {
  return {
    make: form.make.trim(),
    model: form.model.trim(),
    category: form.category.trim(),
    price: toNumber(form.price),
    quantity: toNumber(form.quantity),
    year: form.year ? Number(form.year) : null,
    color: form.color.trim() || null,
    description: form.description.trim() || null,
    imageUrl: form.imageUrl.trim() || null,
    imageCredit: form.imageCredit.trim() || null,
    imageSourceUrl: form.imageSourceUrl.trim() || null
  };
}

export function VehicleFormDialog({ open, vehicle, categories, onClose, onSaved }: VehicleFormDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(vehicle ? toForm(vehicle) : EMPTY);
    setError(null);
  }, [open, vehicle]);

  const field = (key: keyof FormState) => ({
    id: `vehicle-${key}`,
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [key]: e.target.value }))
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = toPayload(form);
      const { vehicle: saved } = vehicle ? await api.updateVehicle(vehicle.id, payload) : await api.createVehicle(payload);
      onSaved(saved, !vehicle);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={vehicle ? 'Edit vehicle' : 'Add a vehicle'}
      description={vehicle ? `${vehicle.make} ${vehicle.model}` : 'New stock goes live in the showroom immediately.'}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="vehicle-make" className="label">Make *</label>
            <input className="field" required maxLength={60} placeholder="Toyota" {...field('make')} />
          </div>
          <div>
            <label htmlFor="vehicle-model" className="label">Model *</label>
            <input className="field" required maxLength={60} placeholder="Corolla Hybrid" {...field('model')} />
          </div>
          <div>
            <label htmlFor="vehicle-category" className="label">Category *</label>
            <input className="field" required maxLength={40} list="vehicle-categories" placeholder="Sedan" {...field('category')} />
            <datalist id="vehicle-categories">
              {categories.map(c => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="vehicle-year" className="label">Year</label>
            <input className="field" type="number" inputMode="numeric" placeholder="2025" {...field('year')} />
          </div>
          <div>
            <label htmlFor="vehicle-price" className="label">Price (USD) *</label>
            <input className="field" type="number" inputMode="decimal" min={0} step="0.01" required placeholder="23500" {...field('price')} />
          </div>
          <div>
            <label htmlFor="vehicle-quantity" className="label">Quantity in stock *</label>
            <input className="field" type="number" inputMode="numeric" min={0} step={1} required {...field('quantity')} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="vehicle-color" className="label">Colour</label>
            <input className="field" maxLength={40} placeholder="Midnight Blue" {...field('color')} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="vehicle-imageUrl" className="label">Photo URL</label>
            <input className="field" type="url" inputMode="url" placeholder="https://upload.wikimedia.org/..." {...field('imageUrl')} />
          </div>
          <div>
            <label htmlFor="vehicle-imageCredit" className="label">Photo credit</label>
            <input className="field" maxLength={200} placeholder="Author, licence" {...field('imageCredit')} />
          </div>
          <div>
            <label htmlFor="vehicle-imageSourceUrl" className="label">Photo source page</label>
            <input className="field" type="url" inputMode="url" placeholder="https://commons.wikimedia.org/wiki/File:..." {...field('imageSourceUrl')} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="vehicle-description" className="label">Description</label>
            <textarea className="field min-h-24 resize-y" maxLength={1000} placeholder="What makes this car special?" {...field('description')} />
          </div>
        </div>

        <FormError error={error} />

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : vehicle ? 'Save changes' : 'Add vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
