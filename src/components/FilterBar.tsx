import { RotateCcw, Search } from 'lucide-react';
import type { SearchFilters } from '../lib/types';

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';

export interface ViewOptions {
  inStockOnly: boolean;
  sort: SortKey;
}

interface FilterBarProps {
  filters: SearchFilters;
  options: ViewOptions;
  categories: string[];
  onFiltersChange(filters: SearchFilters): void;
  onOptionsChange(options: ViewOptions): void;
  onReset(): void;
}

/** Server-side filters (make, model, category, price) plus client-side view options (stock, sort). */
export function FilterBar({ filters, options, categories, onFiltersChange, onOptionsChange, onReset }: FilterBarProps) {
  const set = (key: keyof SearchFilters) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onFiltersChange({ ...filters, [key]: event.target.value });
  const active = Object.values(filters).some(v => v && String(v).trim()) || options.inStockOnly;

  return (
    <section className="panel space-y-4 p-4" aria-label="Search and filter vehicles">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.3fr_1fr_1fr]">
        <div>
          <label htmlFor="filter-make" className="label">
            Make
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" aria-hidden />
            <input id="filter-make" className="field pl-9" placeholder="Toyota, Porsche..." value={filters.make ?? ''} onChange={set('make')} />
          </div>
        </div>
        <div>
          <label htmlFor="filter-model" className="label">
            Model
          </label>
          <input id="filter-model" className="field" placeholder="Corolla, 911..." value={filters.model ?? ''} onChange={set('model')} />
        </div>
        <div>
          <label htmlFor="filter-min" className="label">
            Min price
          </label>
          <input id="filter-min" className="field" type="number" inputMode="numeric" min={0} step={1000} placeholder="$0" value={filters.minPrice ?? ''} onChange={set('minPrice')} />
        </div>
        <div>
          <label htmlFor="filter-max" className="label">
            Max price
          </label>
          <input id="filter-max" className="field" type="number" inputMode="numeric" min={0} step={1000} placeholder="Any" value={filters.maxPrice ?? ''} onChange={set('maxPrice')} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Category">
        {['', ...categories].map(category => (
          <button
            key={category || 'all'}
            className="chip"
            aria-pressed={(filters.category ?? '') === category}
            onClick={() => onFiltersChange({ ...filters, category })}
          >
            {category || 'All'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-muted select-none">
          <input
            type="checkbox"
            className="size-4 rounded accent-[var(--color-accent)]"
            checked={options.inStockOnly}
            onChange={event => onOptionsChange({ ...options, inStockOnly: event.target.checked })}
          />
          In stock only
        </label>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-muted">
            Sort
          </label>
          <select
            id="sort"
            className="field w-auto py-2"
            value={options.sort}
            onChange={event => onOptionsChange({ ...options, sort: event.target.value as SortKey })}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Make &amp; model</option>
          </select>
          <button onClick={onReset} disabled={!active} className="btn-ghost px-3 py-2">
            <RotateCcw className="size-4" aria-hidden /> Reset
          </button>
        </div>
      </div>
    </section>
  );
}
