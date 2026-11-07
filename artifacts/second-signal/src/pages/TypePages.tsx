import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Plus, MessageCircle, ArrowLeftRight, Pencil, Trash2, MapPin, CalendarRange, ShieldCheck, Package } from 'lucide-react';
import type { Listing } from '@/types';
import { useStore } from '@/context/AppStore';
import { Avatar, Btn, Card, ConfirmModal, EmptyState, LinkBtn, PageHeader, Tabs, TypeBadge } from '@/components/kit';
import { Marketplace } from '@/components/Marketplace';
import { SaveButton } from '@/components/ListingCard';
import { fmtDate, img, money, priceLabel } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';
import { useMessageOwner } from '@/hooks/useMessageOwner';

/** Rich row card used by Buy / Give Away / Borrow / Exchange pages */
function RichCard({ l, primary }: { l: Listing; primary: { label: string; href: string } }) {
  const { getUser, me } = useStore();
  const [, nav] = useLocation();
  const message = useMessageOwner();
  const owner = getUser(l.ownerId);
  const mine = l.ownerId === me;
  return (
    <div className="rise bg-white border border-beige rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:shadow-[0_14px_34px_-20px_rgba(23,76,60,0.35)] transition-shadow" data-testid={`card-rich-${l.id}`}>
      <Link href={`/item/${l.id}`} className="relative sm:w-56 aspect-[4/3] sm:aspect-auto shrink-0 bg-[#F1EFE8] overflow-hidden">
        <img src={img(l.images[0] ?? '')} alt={l.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        <TypeBadge type={l.type} className="absolute top-3 left-3" />
      </Link>
      <div className="p-4 sm:p-5 flex-1 flex flex-col min-w-0">
        <div className="flex justify-between gap-3">
          <Link href={`/item/${l.id}`} className="font-display font-bold text-[16px] hover:text-forest">{l.title}</Link>
          <span className="font-display font-extrabold text-forest whitespace-nowrap">{priceLabel(l)}</span>
        </div>
        {l.type === 'exchange' ? (
          <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[13px]">
            <div className="rounded-xl bg-ivory border border-beige px-3 py-2"><div className="text-[11px] text-grey uppercase tracking-wide font-semibold">Offered</div><div className="font-semibold line-clamp-1">{l.title}</div></div>
            <ArrowLeftRight className="w-4 h-4 text-forest" />
            <div className="rounded-xl bg-sage-soft px-3 py-2"><div className="text-[11px] text-forest/80 uppercase tracking-wide font-semibold">Wants</div><div className="font-semibold text-forest line-clamp-1">{l.desiredItem}</div></div>
          </div>
        ) : <p className="text-[13.5px] text-charcoal/80 mt-1 line-clamp-2">{l.description}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[12.5px] text-grey">
          <span className="inline-flex items-center gap-1"><Package className="w-3.5 h-3.5" />Qty {l.quantity} · {l.condition}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{l.location}</span>
          <span className={l.availability === 'Available' ? 'text-forest font-semibold' : ''}>{l.availability}</span>
          {l.type === 'borrow' && <span className="inline-flex items-center gap-1"><CalendarRange className="w-3.5 h-3.5" />{l.borrowDuration} · {fmtDate(l.availableFrom)} to {fmtDate(l.availableTo)}</span>}
          {l.type === 'borrow' && <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" />{l.deposit ? `${money(l.deposit)} deposit` : 'No deposit'}</span>}
        </div>
        {l.type === 'borrow' && l.returnConditions && <p className="text-[12.5px] text-grey mt-1.5">Conditions: {l.returnConditions}</p>}
        {l.type === 'giveaway' && l.pickupDetails && <p className="text-[12.5px] text-grey mt-1.5">Pickup: {l.pickupDetails}</p>}
        <div className="mt-auto pt-4 flex flex-wrap items-center gap-2">
          <Link href={`/profile/${owner?.id}`} className="flex items-center gap-2 mr-auto hover:opacity-80" data-testid={`link-owner-${l.id}`}>
            <Avatar user={owner} size={28} /><span className="text-[13px] font-medium">{owner?.name}</span>
          </Link>
          <SaveButton listingId={l.id} />
          {!mine && <Btn variant="secondary" size="sm" className="h-9" onClick={() => message(l.ownerId, l.id)} data-testid={`button-message-${l.id}`}><MessageCircle className="w-4 h-4" />Message</Btn>}
          <Btn variant="secondary" size="sm" className="h-9" onClick={() => nav(`/item/${l.id}`)} data-testid={`button-details-${l.id}`}>View Details</Btn>
          {!mine && l.availability !== 'Unavailable' && <Btn size="sm" className="h-9" onClick={() => nav(primary.href)} data-testid={`button-primary-${l.id}`}>{primary.label}</Btn>}
        </div>
      </div>
    </div>
  );
}

const richGrid = (label: string) => (items: Listing[]) => (
  <div className="space-y-4">{items.map((l) => <RichCard key={l.id} l={l} primary={{ label, href: `/request/${l.id}` }} />)}</div>
);

export function BuyPage() {
  const { data } = useStore();
  const items = useMemo(() => data.listings.filter((l) => l.type === 'sell'), [data.listings]);
  return (
    <div>
      <PageHeader eyebrow="Marketplace" title="Buy from Friends" description="Second-hand from people you can actually meet. Purchase requests are simulated, payment happens in person." actions={<LinkBtn href="/create-listing?type=sell" variant="secondary"><Plus className="w-4 h-4" />Sell an item</LinkBtn>} />
      <Marketplace listings={items} initial={{ type: 'sell' }} lockType showFriendsToggle renderGrid={richGrid('Buy Now')} />
    </div>
  );
}

export function GiveAwayPage() {
  const { data } = useStore();
  const items = useMemo(() => data.listings.filter((l) => l.type === 'giveaway'), [data.listings]);
  return (
    <div>
      <PageHeader eyebrow="Free" title="Give Away" description="Free to a good home. Request what you will use and collect it from the owner." actions={<LinkBtn href="/create-listing?type=giveaway"><Plus className="w-4 h-4" />Give something away</LinkBtn>} />
      <Marketplace listings={items} initial={{ type: 'giveaway' }} lockType showPrice={false} renderGrid={richGrid('Request Item')} />
    </div>
  );
}

export function BorrowPage() {
  const { data } = useStore();
  const items = useMemo(() => data.listings.filter((l) => l.type === 'borrow'), [data.listings]);
  return (
    <div>
      <PageHeader eyebrow="Borrow and Lend" title="Borrow" description="Use it, return it. Owners set the duration, conditions and any deposit; they accept or decline each request." actions={<LinkBtn href="/create-listing?type=borrow"><Plus className="w-4 h-4" />Lend an item</LinkBtn>} />
      <Marketplace listings={items} initial={{ type: 'borrow' }} lockType renderGrid={richGrid('Borrow Item')} />
    </div>
  );
}

export function ExchangePage() {
  const { data } = useStore();
  const items = useMemo(() => data.listings.filter((l) => l.type === 'exchange'), [data.listings]);
  return (
    <div>
      <PageHeader eyebrow="Swap" title="Exchange" description="Trade one thing you have for one thing you need. No money changes hands." actions={<LinkBtn href="/create-listing?type=exchange"><Plus className="w-4 h-4" />Offer a swap</LinkBtn>} />
      <Marketplace listings={items} initial={{ type: 'exchange' }} lockType showPrice={false} renderGrid={richGrid('Exchange')} />
    </div>
  );
}

export function SellPage() {
  const { data, me, deleteListing } = useStore();
  const [, nav] = useLocation();
  const { toast } = useToast();
  const [tab, setTab] = useState<'market' | 'mine'>('market');
  const [del, setDel] = useState<Listing | null>(null);
  const items = useMemo(() => data.listings.filter((l) => l.type === 'sell'), [data.listings]);
  const mine = items.filter((l) => l.ownerId === me);
  return (
    <div>
      <PageHeader eyebrow="Selling" title="Sell" description="List things at a fair student price. Manage, edit and remove your listings here." actions={<LinkBtn href="/create-listing?type=sell" data-testid="button-sell-create"><Plus className="w-4 h-4" />Create Listing</LinkBtn>} />
      <Tabs tabs={[{ value: 'market', label: 'All for sale', count: items.length }, { value: 'mine', label: 'My listings', count: mine.length }]} value={tab} onChange={setTab} className="mb-5" />
      {tab === 'market' ? <Marketplace listings={items} initial={{ type: 'sell' }} lockType renderGrid={richGrid('Buy Now')} /> : mine.length === 0 ? (
        <EmptyState icon={<Plus className="w-6 h-6" />} title="Nothing listed yet" text="Your old textbook is someone's semester saved." action={<LinkBtn href="/create-listing?type=sell">Create Listing</LinkBtn>} />
      ) : (
        <div className="space-y-3">
          {mine.map((l) => (
            <Card key={l.id} className="p-3 flex items-center gap-4" data-testid={`row-my-listing-${l.id}`}>
              <img src={img(l.images[0] ?? '')} alt="" className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <Link href={`/item/${l.id}`} className="font-display font-bold hover:text-forest">{l.title}</Link>
                <div className="text-[13px] text-grey">{money(l.price)} · Qty {l.quantity} · {l.condition} · {l.availability}</div>
              </div>
              <Btn variant="secondary" size="sm" onClick={() => nav(`/item/${l.id}`)}>View Details</Btn>
              <Btn variant="secondary" size="sm" onClick={() => nav(`/edit-listing/${l.id}`)} data-testid={`button-edit-${l.id}`}><Pencil className="w-3.5 h-3.5" /><span className="hidden sm:inline">Edit</span></Btn>
              <Btn variant="danger" size="sm" onClick={() => setDel(l)} data-testid={`button-delete-${l.id}`}><Trash2 className="w-3.5 h-3.5" /></Btn>
            </Card>
          ))}
        </div>
      )}
      <ConfirmModal open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Delete this listing?" text={`"${del?.title}" will be removed and pending requests cancelled.`} confirmLabel="Delete" danger
        onConfirm={() => { if (del) { deleteListing(del.id); toast({ title: 'Listing deleted' }); } }} />
    </div>
  );
}

