import { useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { ArrowLeft, MapPin, CalendarDays, Package, MessageCircle, Pencil, Trash2, Heart, ShieldCheck, ArrowLeftRight, Sparkles, PackageX, Send } from 'lucide-react';
import { useStore } from '@/context/AppStore';
import { Avatar, Badge, Btn, Card, ConfirmModal, EmptyState, LinkBtn, Stars, TypeBadge } from '@/components/kit';
import { ListingCard, SaveButton } from '@/components/ListingCard';
import { useMessageOwner } from '@/hooks/useMessageOwner';
import { actionFor } from '@/utils/actions';
import { fmtDate, img, money, priceLabel, timeAgo } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ItemDetail() {
  const { itemId } = useParams<{ itemId: string }>();
  const { getListing, getUser, data, me, toggleLike, deleteListing, addComment, updateListing } = useStore();
  const [, nav] = useLocation();
  const message = useMessageOwner();
  const { toast } = useToast();
  const [active, setActive] = useState(0);
  const [del, setDel] = useState(false);
  const [comment, setComment] = useState('');
  const l = getListing(itemId);

  if (!l) return <EmptyState icon={<PackageX className="w-6 h-6" />} title="Listing not found" text="It may have been removed by its owner, or the link is wrong." action={<LinkBtn href="/explore">Back to Explore</LinkBtn>} />;

  const owner = getUser(l.ownerId);
  const mine = l.ownerId === me;
  const others = data.listings.filter((x) => x.ownerId === l.ownerId && x.id !== l.id).slice(0, 3);
  const act = actionFor(l);
  const ownerReviews = data.reviews.filter((r) => r.toId === l.ownerId);
  const rating = ownerReviews.length ? ownerReviews.reduce((a, r) => a + r.rating, 0) / ownerReviews.length : 0;
  const myPending = data.requests.find((r) => r.listingId === l.id && r.requesterId === me && (r.status === 'pending' || r.status === 'accepted'));
  const incoming = data.requests.filter((r) => r.listingId === l.id && r.status === 'pending').length;
  const liked = l.likes.includes(me);
  const community = data.communities.find((c) => c.id === l.communityId);

  const facts: [string, string][] = [
    ['Category', l.category], ['Condition', l.condition], ['Quantity', String(l.quantity)], ['Availability', l.availability],
    ['Campus', l.campus], ['Location', l.location], ['Listed', fmtDate(l.createdAt)],
  ];
  if (l.type === 'borrow') facts.push(['Duration', l.borrowDuration ?? '-'], ['Available', `${fmtDate(l.availableFrom)} to ${fmtDate(l.availableTo)}`], ['Deposit', l.deposit ? money(l.deposit) : 'None']);

  return (
    <div>
      <button onClick={() => history.length > 1 ? history.back() : nav('/explore')} className="inline-flex items-center gap-1.5 text-sm font-display font-semibold text-grey hover:text-forest mb-4" data-testid="button-back"><ArrowLeft className="w-4 h-4" />Back</button>
      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8">
        <div>
          <div className="relative rounded-3xl overflow-hidden border border-beige bg-[#F1EFE8] aspect-[4/3]">
            <img key={active} src={img(l.images[active] ?? l.images[0] ?? '')} alt={l.title} className="w-full h-full object-cover page-enter" data-testid="img-gallery-main" />
            <TypeBadge type={l.type} className="absolute top-4 left-4" />
          </div>
          {l.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {l.images.map((src, i) => (
                <button key={i} onClick={() => setActive(i)} className={cn('w-20 h-16 rounded-xl overflow-hidden border-2 transition', i === active ? 'border-forest' : 'border-transparent opacity-70 hover:opacity-100')} data-testid={`button-thumb-${i}`}>
                  <img src={img(src)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <Card className="p-5 mt-6">
            <h3 className="font-bold mb-3">Comments ({l.comments.length})</h3>
            <div className="space-y-3">
              {l.comments.map((c) => { const u = getUser(c.userId); return (
                <div key={c.id} className="flex gap-2.5 text-[14px]"><Avatar user={u} size={30} /><div><Link href={`/profile/${u?.id}`} className="font-semibold hover:text-forest">{u?.name}</Link> <span className="text-[12px] text-grey">{timeAgo(c.createdAt)}</span><p className="text-charcoal/85">{c.text}</p></div></div>
              ); })}
              {l.comments.length === 0 && <p className="text-sm text-grey">No questions yet.</p>}
            </div>
            <form className="flex gap-2 mt-4" onSubmit={(e) => { e.preventDefault(); if (comment.trim()) { addComment(l.id, comment.trim()); setComment(''); } }}>
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ask a question publicly" className="flex-1 h-10 rounded-xl border border-beige px-3 text-sm focus:outline-none focus:border-sage" data-testid="input-detail-comment" />
              <Btn type="submit" disabled={!comment.trim()} data-testid="button-detail-comment"><Send className="w-4 h-4" /></Btn>
            </form>
          </Card>
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-[28px] sm:text-[34px] font-extrabold leading-tight" data-testid="text-item-title">{l.title}</h1>
            <button onClick={() => toggleLike(l.id)} className="mt-2 p-2 rounded-xl border border-beige bg-white hover:border-sage" aria-label="Like" data-testid="button-detail-like"><Heart key={String(liked)} className={cn('w-5 h-5 pop', liked ? 'fill-forest text-forest' : '')} /></button>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[26px] font-display font-extrabold text-forest" data-testid="text-item-price">{priceLabel(l)}</span>
            {community && <Link href={`/community/${community.id}`}><Badge tone="sage">{community.name}</Badge></Link>}
          </div>
          {l.type === 'exchange' && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-sage-soft p-4">
              <ArrowLeftRight className="w-5 h-5 text-forest shrink-0" />
              <div><div className="text-[12px] uppercase tracking-wide text-forest/80 font-bold">Wants in exchange</div><div className="font-display font-bold text-forest">{l.desiredItem}</div></div>
            </div>
          )}
          <p className="text-[15px] text-charcoal/85 mt-4 leading-relaxed whitespace-pre-line">{l.description}</p>

          <div className="grid grid-cols-2 gap-px bg-beige rounded-2xl overflow-hidden border border-beige mt-5">
            {facts.map(([k, v]) => <div key={k} className="bg-white px-4 py-3"><div className="text-[11.5px] text-grey uppercase tracking-wide font-semibold">{k}</div><div className="text-[14px] font-medium mt-0.5">{v}</div></div>)}
          </div>
          {l.type === 'borrow' && l.returnConditions && <div className="mt-3 flex gap-2 text-[13.5px] text-grey"><ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />{l.returnConditions}</div>}
          {l.type === 'giveaway' && l.pickupDetails && <div className="mt-3 flex gap-2 text-[13.5px] text-grey"><MapPin className="w-4 h-4 text-forest shrink-0 mt-0.5" />{l.pickupDetails}</div>}

          <div className="flex flex-wrap gap-2 mt-6">
            {mine ? (
              <>
                <Btn onClick={() => nav(`/edit-listing/${l.id}`)} data-testid="button-edit-listing"><Pencil className="w-4 h-4" />Edit Listing</Btn>
                <Btn variant="secondary" onClick={() => { updateListing(l.id, { availability: l.availability === 'Available' ? 'Reserved' : 'Available' }); toast({ title: 'Availability updated' }); }} data-testid="button-toggle-availability">Mark {l.availability === 'Available' ? 'Reserved' : 'Available'}</Btn>
                <Btn variant="secondary" onClick={() => nav('/my-requests')}>Requests{incoming ? ` (${incoming})` : ''}</Btn>
                <Btn variant="danger" onClick={() => setDel(true)} data-testid="button-delete-listing"><Trash2 className="w-4 h-4" />Delete</Btn>
              </>
            ) : (
              <>
                {myPending ? (
                  <Btn variant="sage" onClick={() => nav('/my-requests')} data-testid="button-view-my-request">Request {myPending.status} · View</Btn>
                ) : (
                  <Btn size="lg" onClick={() => nav(act.href)} disabled={l.availability === 'Unavailable'} data-testid="button-primary-action">{act.label}</Btn>
                )}
                <Btn size="lg" variant="secondary" onClick={() => message(l.ownerId, l.id)} data-testid="button-message-owner"><MessageCircle className="w-4 h-4" />Message Owner</Btn>
                <SaveButton listingId={l.id} withLabel className="h-12" />
              </>
            )}
          </div>
          {!mine && <button onClick={() => nav(`/matches?q=${encodeURIComponent(l.title)}`)} className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-forest font-semibold hover:underline"><Sparkles className="w-3.5 h-3.5" />See similar items (mock matching)</button>}

          <Card className="p-5 mt-6">
            <div className="flex items-center gap-3">
              <Avatar user={owner} size={52} showOnline />
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${owner?.id}`} className="font-display font-bold text-[16px] hover:text-forest" data-testid="link-detail-owner">{owner?.name}</Link>
                <div className="text-[13px] text-grey">{owner?.department} · {owner?.year}</div>
                <div className="flex items-center gap-2 mt-1"><Stars value={Math.round(rating)} size={13} /><span className="text-[12px] text-grey">{ownerReviews.length} reviews</span></div>
              </div>
              <LinkBtn href={`/profile/${owner?.id}`} variant="secondary" size="sm">View Profile</LinkBtn>
            </div>
            <div className="flex gap-4 text-[12.5px] text-grey mt-4">
              <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{owner?.campus}</span>
              <span className="inline-flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />Joined {fmtDate(owner?.joinedAt)}</span>
              <span className="inline-flex items-center gap-1"><Package className="w-3.5 h-3.5" />{data.listings.filter((x) => x.ownerId === l.ownerId).length} listings</span>
            </div>
          </Card>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold mb-4">More from {owner?.name.split(' ')[0]}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">{others.map((o, i) => <ListingCard key={o.id} listing={o} index={i} />)}</div>
        </section>
      )}
      <ConfirmModal open={del} onOpenChange={setDel} title="Delete this listing?" text="This cannot be undone. Pending requests will be cancelled." confirmLabel="Delete" danger
        onConfirm={() => { deleteListing(l.id); toast({ title: 'Listing deleted' }); nav('/dashboard'); }} />
    </div>
  );
}
