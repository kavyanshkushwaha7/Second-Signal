import { Link } from 'wouter';
import { Bookmark, MapPin } from 'lucide-react';
import type { Listing } from '@/types';
import { useStore } from '@/context/AppStore';
import { Avatar, TypeBadge } from '@/components/kit';
import { img, priceLabel } from '@/utils/format';
import { cn } from '@/lib/utils';

export function SaveButton({ listingId, className, withLabel }: { listingId: string; className?: string; withLabel?: boolean }) {
  const { savedIds, toggleSave } = useStore();
  const saved = savedIds.includes(listingId);
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(listingId); }}
      data-testid={`button-save-${listingId}`}
      aria-label={saved ? 'Remove from saved' : 'Save item'}
      className={cn('inline-flex items-center gap-1.5 rounded-xl transition-all active:scale-90', withLabel ? 'h-10 px-4 border border-beige bg-white text-sm font-display font-semibold hover:border-sage' : 'w-9 h-9 justify-center bg-white/95 backdrop-blur border border-beige hover:border-sage', className)}
    >
      <Bookmark key={String(saved)} className={cn('w-4 h-4 pop', saved ? 'fill-forest text-forest' : 'text-charcoal')} />
      {withLabel && (saved ? 'Saved' : 'Save Item')}
    </button>
  );
}

export function ListingCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const { getUser } = useStore();
  const owner = getUser(listing.ownerId);
  return (
    <div className="group rise bg-white border border-beige rounded-2xl overflow-hidden flex flex-col hover:shadow-[0_14px_34px_-18px_rgba(23,76,60,0.35)] hover:-translate-y-0.5 transition-all duration-300" style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }} data-testid={`card-listing-${listing.id}`}>
      <Link href={`/item/${listing.id}`} className="relative block aspect-[4/3] overflow-hidden bg-[#F1EFE8]">
        <img src={img(listing.images[0] ?? '')} alt={listing.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" loading="lazy" />
        <div className="absolute top-3 left-3 flex gap-1.5"><TypeBadge type={listing.type} className="shadow-sm" /></div>
        <SaveButton listingId={listing.id} className="absolute top-3 right-3" />
        {listing.availability !== 'Available' && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[11.5px] font-display font-semibold text-grey">{listing.availability}</span>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/item/${listing.id}`} className="font-display font-bold text-[15.5px] leading-snug text-charcoal hover:text-forest line-clamp-2">{listing.title}</Link>
          <span className={cn('font-display font-extrabold text-[15px] whitespace-nowrap', listing.type === 'giveaway' ? 'text-forest' : 'text-charcoal')}>{priceLabel(listing)}</span>
        </div>
        {listing.type === 'exchange' && listing.desiredItem && <p className="text-[12.5px] text-grey mt-1 line-clamp-1">Wants: <span className="text-charcoal">{listing.desiredItem}</span></p>}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[12.5px] text-grey">
          <span>{listing.condition}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{listing.campus}</span>
          <span>Qty {listing.quantity}</span>
        </div>
        <div className="mt-auto pt-4 flex items-center justify-between gap-2">
          <Link href={`/profile/${owner?.id}`} className="flex items-center gap-2 min-w-0 hover:opacity-80" data-testid={`link-owner-${listing.id}`}>
            <Avatar user={owner} size={26} />
            <span className="text-[13px] font-medium truncate">{owner?.name}</span>
          </Link>
          <Link href={`/item/${listing.id}`} className="h-8 px-3 rounded-lg bg-sage-soft text-forest text-[12.5px] font-display font-bold inline-flex items-center hover:bg-forest hover:text-white transition-colors" data-testid={`button-view-${listing.id}`}>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ListingGrid({ listings }: { listings: Listing[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {listings.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
    </div>
  );
}
