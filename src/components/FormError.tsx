import { CircleAlert } from 'lucide-react';
import { ApiError } from '../lib/api';

/** Renders an API error, listing per-field validation messages when the server sent them. */
export function FormError({ error }: { error: unknown }) {
  if (!error) return null;
  const message = error instanceof Error ? error.message : 'Something went wrong';
  const details = error instanceof ApiError ? error.details : [];
  return (
    <div role="alert" className="flex gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-3 text-sm text-danger">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>
        <p className="font-medium">{message}</p>
        {details.length > 0 && (
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-danger/90">
            {details.map((issue, i) => (
              <li key={i}>{issue.message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
