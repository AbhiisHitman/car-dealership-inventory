import { useState } from 'react';
import { FormError } from './FormError';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm(): Promise<void>;
  onClose(): void;
}

/** Asks before destructive actions and keeps the dialog open if the action fails. */
export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-muted">{message}</p>
      <div className="mt-4">
        <FormError error={error} />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost">Keep it</button>
        <button onClick={confirm} disabled={busy} className="btn bg-danger text-ink hover:brightness-110">
          {busy ? 'Working...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
