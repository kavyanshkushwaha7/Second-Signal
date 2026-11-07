import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, MessageCircle, Send } from 'lucide-react';
import type { Listing } from '@/types';
import { useStore } from '@/context/AppStore';
import { Avatar, Btn, TypeBadge } from '@/components/kit';
import { SaveButton } from '@/components/ListingCard';
import { img, priceLabel, timeAgo } from '@/utils/format';
import { actionFor } from '@/utils/actions';
import { cn } from '@/lib/utils';

export function FeedPost({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const { getUser, me, toggleLike, addComment, data } = useStore();
  const [, nav] = useLocation();
  const owner = getUser(listing.ownerId);
  const liked = listing.likes.includes(me);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const community = data.communities.find((c) => c.id === listing.communityId);
  const action = actionFor(listing);
  const isMine = listing.ownerId === me;

  return (
    <article className="rise bg-white border border-beige rounded-2xl overflow-hidden" style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }} data-testid={`post-${listing.id}`}>
      <header className="flex items-center gap-3 px-4 py-3">
        <Link href={`/profile/${owner?.id}`}><Avatar user={owner} size={40} showOnline /></Link>
        <div className="min-w-0 flex-1">
          <Link href={`/profile/${owner?.id}`} className="font-display font-bold text-[14.5px] hover:text-forest">{owner?.name}</Link>
          <div className="text-[12.5px] text-grey truncate">@{owner?.username} · {community ? community.name : listing.campus} · {timeAgo(listing.createdAt)}</div>
        </div>
        <TypeBadge type={listing.type} />
      </header>
      <Link href={`/item/${listing.id}`} className="block relative bg-[#F1EFE8] aspect-[16/11] overflow-hidden">
        <img src={img(listing.images[0] ?? '')} alt={listing.title} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
      </Link>
      <div className="px-4 pt-3 flex items-center gap-1">
        <button onClick={() => toggleLike(listing.id)} className="p-2 -ml-2 rounded-lg hover:bg-ivory flex items-center gap-1.5" data-testid={`button-like-${listing.id}`} aria-label="Like">
          <Heart key={String(liked)} className={cn('w-5 h-5 pop', liked ? 'fill-forest text-forest' : 'text-charcoal')} />
          <span className="text-[13px] font-semibold">{listing.likes.length}</span>
        </button>
        <button onClick={() => setOpen((o) => !o)} className="p-2 rounded-lg hover:bg-ivory flex items-center gap-1.5" data-testid={`button-comments-${listing.id}`} aria-label="Comment">
          <MessageCircle className="w-5 h-5" />
          <span className="text-[13px] font-semibold">{listing.comments.length}</span>
        </button>
        <SaveButton listingId={listing.id} className="ml-auto border-0" />
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-baseline justify-between gap-3 mt-1">
          <Link href={`/item/${listing.id}`} className="font-display font-bold text-[16.5px] hover:text-forest">{listing.title}</Link>
          <span className="font-display font-extrabold text-forest whitespace-nowrap">{priceLabel(listing)}</span>
        </div>
        <p className="text-[14px] text-charcoal/85 mt-1 line-clamp-2">{listing.description}</p>
        <div className="flex flex-wrap gap-x-3 text-[12.5px] text-grey mt-2">
          <span>{listing.category}</span><span>{listing.condition}</span><span>{listing.quantity} available</span>
        </div>
        {open && (
          <div className="mt-3 pt-3 border-t border-beige space-y-2.5">
            {listing.comments.length === 0 && <p className="text-[13px] text-grey">No comments yet. Ask the owner something.</p>}
            {listing.comments.map((c) => {
              const u = getUser(c.userId);
              return (
                <div key={c.id} className="flex gap-2.5 text-[13.5px]">
                  <Avatar user={u} size={26} />
                  <div><span className="font-semibold">{u?.name}</span> <span className="text-charcoal/85">{c.text}</span><div className="text-[11.5px] text-grey">{timeAgo(c.createdAt)}</div></div>
                </div>
              );
            })}
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { addComment(listing.id, text.trim()); setText(''); } }}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment" className="flex-1 h-9 rounded-lg border border-beige px-3 text-[13.5px] focus:outline-none focus:border-sage" data-testid={`input-comment-${listing.id}`} />
              <Btn size="sm" type="submit" disabled={!text.trim()} data-testid={`button-post-comment-${listing.id}`}><Send className="w-3.5 h-3.5" /></Btn>
            </form>
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <Btn variant="secondary" className="flex-1" onClick={() => nav(`/item/${listing.id}`)} data-testid={`button-details-${listing.id}`}>View Details</Btn>
          {!isMine && listing.availability !== 'Unavailable' ? (
            <Btn className="flex-1" onClick={() => nav(action.href)} data-testid={`button-request-${listing.id}`}>{action.label}</Btn>
          ) : (
            <Btn className="flex-1" variant="sage" onClick={() => nav(isMine ? `/edit-listing/${listing.id}` : `/item/${listing.id}`)}>{isMine ? 'Edit Listing' : 'Unavailable'}</Btn>
          )}
        </div>
      </div>
    </article>
  );
}
