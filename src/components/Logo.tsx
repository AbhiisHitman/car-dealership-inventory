export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 64 64" className="size-8" aria-hidden>
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c9dff" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="#121624" />
        <path d="M14 40c6-14 14-20 26-20h10l-6 8h-5c-7 0-11 4-14 12z" fill="url(#logo-gradient)" />
        <circle cx="22" cy="44" r="4" fill="#e8ecf5" />
        <circle cx="44" cy="44" r="4" fill="#e8ecf5" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight">
        Driftline<span className="text-muted"> Motors</span>
      </span>
    </span>
  );
}
