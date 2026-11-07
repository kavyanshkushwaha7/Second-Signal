import { useMemo, useState } from 'react';
import type { Listing, ListingType } from '@/types';

export type SortKey = 'recent' | 'price-asc' | 'price-desc' | 'relevant';
export interface Filters {
  q: string; category: string; type: 'all' | ListingType; condition: string; availability: string; campus: string;
  minPrice: string; maxPrice: string; newest: boolean; friendsOnly: boolean; sort: SortKey;
}
export const defaultFilters = (over: Partial<Filters> = {}): Filters => ({
  q: '', category: 'all', type: 'all', condition: 'all', availability: 'all', campus: 'all', minPrice: '', maxPrice: '', newest: false, friendsOnly: false, sort: 'recent', ...over,
});

const effectivePrice = (l: Listing) => (l.type === 'sell' ? l.price ?? 0 : l.type === 'borrow' ? l.deposit ?? 0 : 0);

export function useListingFilters(listings: Listing[], initial: Partial<Filters> = {}, friendIds: string[] = []) {
  const [f, setF] = useState<Filters>(() => defaultFilters(initial));
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v }));
  const reset = () => setF(defaultFilters({ type: initial.type ?? 'all' }));

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    const weekAgo = Date.now() - 7 * 86400_000;
    const scored = listings
      .filter((l) => f.type === 'all' || l.type === f.type)
      .filter((l) => f.category === 'all' || l.category === f.category)
      .filter((l) => f.condition === 'all' || l.condition === f.condition)
      .filter((l) => f.availability === 'all' || l.availability === f.availability)
      .filter((l) => f.campus === 'all' || l.campus === f.campus)
      .filter((l) => !f.minPrice || effectivePrice(l) >= Number(f.minPrice))
      .filter((l) => !f.maxPrice || effectivePrice(l) <= Number(f.maxPrice))
      .filter((l) => !f.newest || new Date(l.createdAt).getTime() >= weekAgo)
      .filter((l) => !f.friendsOnly || friendIds.includes(l.ownerId))
      .map((l) => {
        if (!terms.length) return { l, s: 1 };
        const title = l.title.toLowerCase();
        const body = `${l.description} ${l.category} ${l.desiredItem ?? ''}`.toLowerCase();
        let s = 0;
        terms.forEach((t) => { if (title.includes(t)) s += 3; else if (body.includes(t)) s += 1; });
        return { l, s };
      })
      .filter((x) => x.s > 0);
    const sorted = [...scored].sort((a, b) => {
      if (f.sort === 'price-asc') return effectivePrice(a.l) - effectivePrice(b.l);
      if (f.sort === 'price-desc') return effectivePrice(b.l) - effectivePrice(a.l);
      if (f.sort === 'relevant') return b.s - a.s || b.l.likes.length - a.l.likes.length;
      return b.l.createdAt.localeCompare(a.l.createdAt);
    });
    return sorted.map((x) => x.l);
  }, [listings, f, friendIds]);

  const activeCount = [f.category !== 'all', f.condition !== 'all', f.availability !== 'all', f.campus !== 'all', !!f.minPrice, !!f.maxPrice, f.newest, f.friendsOnly].filter(Boolean).length;
  return { f, set, reset, results, activeCount };
}
