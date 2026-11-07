import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { SlidersHorizontal, PackageSearch, RotateCcw } from 'lucide-react';
import type { Listing, ListingType } from '@/types';
import { useStore } from '@/context/AppStore';
import { useListingFilters, type Filters, type SortKey } from '@/hooks/useListingFilters';
import { Btn, Chips, EmptyState, Input, SearchBar, Select, SkeletonGrid } from '@/components/kit';
import { ListingGrid } from '@/components/ListingCard';
import { CAMPUSES, CATEGORIES, CONDITIONS } from '@/utils/format';
import { cn } from '@/lib/utils';

const TYPE_CHIPS: { value: 'all' | ListingType; label: string }[] = [
  { value: 'all', label: 'All Items' }, { value: 'sell', label: 'Buy' }, { value: 'borrow', label: 'Borrow' }, { value: 'giveaway', label: 'Give Away' }, { value: 'exchange', label: 'Exchange' },
];

export function useFakeLoad(ms = 320) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), ms); return () => clearTimeout(t); }, [ms]);
  return ready;
}

interface Props {
  listings: Listing[];
  initial?: Partial<Filters>;
  lockType?: boolean;
  showPrice?: boolean;
  showFriendsToggle?: boolean;
  searchPlaceholder?: string;
  emptyAction?: ReactNode;
  renderGrid?: (items: Listing[]) => ReactNode;
}

export function Marketplace({ listings, initial, lockType, showPrice = true, showFriendsToggle, searchPlaceholder, emptyAction, renderGrid }: Props) {
  const { friendsOf, me } = useStore();
  const friendIds = useMemo(() => friendsOf(me), [friendsOf, me]);
  const { f, set, reset, results, activeCount } = useListingFilters(listings, initial, friendIds);
  const [panel, setPanel] = useState(false);
  const ready = useFakeLoad();

  useEffect(() => { if (initial?.q !== undefined) set('q', initial.q); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [initial?.q]);

  return (
    <div>
      {!lockType && <Chips items={TYPE_CHIPS} value={f.type} onChange={(v) => set('type', v)} className="mb-4" />}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <SearchBar value={f.q} onChange={(v) => set('q', v)} placeholder={searchPlaceholder ?? 'Search by name or description'} className="flex-1" />
        <div className="flex gap-2.5">
          <Select value={f.sort} onChange={(e) => set('sort', e.target.value as SortKey)} className="w-auto min-w-[170px]" data-testid="select-sort">
            <option value="recent">Recently Added</option>
            {showPrice && <option value="price-asc">Price: Low to High</option>}
            {showPrice && <option value="price-desc">Price: High to Low</option>}
            <option value="relevant">Most Relevant</option>
          </Select>
          <Btn variant={panel || activeCount ? 'sage' : 'secondary'} onClick={() => setPanel((p) => !p)} className="h-11" data-testid="button-toggle-filters">
            <SlidersHorizontal className="w-4 h-4" /> Filters{activeCount ? ` (${activeCount})` : ''}
          </Btn>
        </div>
      </div>

      <div className={cn('grid transition-all duration-300', panel ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0')}>
        <div className="overflow-hidden">
          <div className="bg-white border border-beige rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={f.category} onChange={(e) => set('category', e.target.value)} data-testid="select-category">
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Select value={f.condition} onChange={(e) => set('condition', e.target.value)} data-testid="select-condition">
              <option value="all">Any condition</option>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Select value={f.availability} onChange={(e) => set('availability', e.target.value)} data-testid="select-availability">
              <option value="all">Any availability</option>
              <option>Available</option><option>Reserved</option><option>Unavailable</option>
            </Select>
            <Select value={f.campus} onChange={(e) => set('campus', e.target.value)} data-testid="select-campus">
              <option value="all">All campuses</option>
              {CAMPUSES.map((c) => <option key={c}>{c}</option>)}
            </Select>
            {!lockType && (
              <Select value={f.type} onChange={(e) => set('type', e.target.value as Filters['type'])} data-testid="select-type">
                {TYPE_CHIPS.map((t) => <option key={t.value} value={t.value}>{t.value === 'all' ? 'Any listing type' : t.label}</option>)}
              </Select>
            )}
            {showPrice && (
              <div className="flex gap-2 col-span-2 md:col-span-1">
                <Input type="number" min={0} placeholder="Min ₹" value={f.minPrice} onChange={(e) => set('minPrice', e.target.value)} data-testid="input-min-price" />
                <Input type="number" min={0} placeholder="Max ₹" value={f.maxPrice} onChange={(e) => set('maxPrice', e.target.value)} data-testid="input-max-price" />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm font-medium h-11 px-1 cursor-pointer">
              <input type="checkbox" checked={f.newest} onChange={(e) => set('newest', e.target.checked)} className="w-4 h-4 accent-[#174C3C]" data-testid="checkbox-newest" />
              Newest (last 7 days)
            </label>
            {showFriendsToggle && (
              <label className="flex items-center gap-2 text-sm font-medium h-11 px-1 cursor-pointer">
                <input type="checkbox" checked={f.friendsOnly} onChange={(e) => set('friendsOnly', e.target.checked)} className="w-4 h-4 accent-[#174C3C]" data-testid="checkbox-friends-only" />
                Friends only
              </label>
            )}
            <Btn variant="ghost" onClick={reset} className="h-11 justify-start" data-testid="button-reset-filters"><RotateCcw className="w-4 h-4" /> Reset</Btn>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5 mb-3 text-[13px] text-grey">
        <span data-testid="text-result-count">{results.length} {results.length === 1 ? 'item' : 'items'}</span>
      </div>
      {!ready ? <SkeletonGrid /> : results.length === 0 ? (
        <EmptyState icon={<PackageSearch className="w-6 h-6" />} title="Nothing matches yet" text="Try a broader search or clear a filter. You can also post it to the Want List so neighbours can find you." action={emptyAction ?? <Btn variant="secondary" onClick={reset}>Clear filters</Btn>} />
      ) : renderGrid ? renderGrid(results) : <ListingGrid listings={results} />}
    </div>
  );
}
