import { useState } from 'react';
import { Link } from 'wouter';
import { Check, X, MessageCircle, Ban, Handshake, Star, ArrowLeftRight, CalendarRange, CheckCircle2, Circle } from 'lucide-react';
import type { ItemRequest } from '@/types';
import { useStore } from '@/context/AppStore';
import { Avatar, Badge, Btn, Card, ConfirmModal, Field, Modal, StatusBadge, Stars, Textarea } from '@/components/kit';
import { useMessageOwner } from '@/hooks/useMessageOwner';
import { REQ_LABEL, fmtDate, img, timeAgo } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function RequestCard({ r }: { r: ItemRequest }) {
  const { me, getUser, getListing, setRequestStatus, confirmCompletion, addReview, data } = useStore();
  const message = useMessageOwner();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState<null | 'reject' | 'cancel' | 'handover'>(null);
  const [review, setReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const l = getListing(r.listingId);
  const requester = getUser(r.requesterId);
  const owner = getUser(r.ownerId);
  const isOwner = r.ownerId === me;
  const other = isOwner ? requester : owner;
  const iConfirmed = r.confirmations.includes(me);
  const reviewed = data.reviews.some((v) => v.requestId === r.id && v.fromId === me);

  return (
    <Card className="p-4 sm:p-5 rise" data-testid={`card-request-${r.id}`}>
      <div className="flex gap-4">
        <Link href={l ? `/item/${l.id}` : '#'} className="shrink-0"><img src={img(l?.images[0] ?? '')} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-[#F1EFE8]" /></Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={isOwner ? 'sage' : 'neutral'}>{isOwner ? 'Received' : 'Sent'}</Badge>
            <Badge tone="muted">{REQ_LABEL[r.type]}</Badge>
            <StatusBadge status={r.status} />
            <span className="text-[12px] text-grey ml-auto">{fmtDate(r.createdAt)}</span>
          </div>
          <Link href={l ? `/item/${l.id}` : '#'} className="block font-display font-bold text-[16px] mt-1.5 hover:text-forest truncate">{l?.title ?? 'Removed listing'}</Link>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5 text-[12.5px] text-grey">
            <span className="inline-flex items-center gap-1.5">Requester <Avatar user={requester} size={18} /><Link href={`/profile/${requester?.id}`} className="text-charcoal font-medium hover:text-forest">{r.requesterId === me ? 'You' : requester?.name}</Link></span>
            <span className="inline-flex items-center gap-1.5">Owner <Avatar user={owner} size={18} /><Link href={`/profile/${owner?.id}`} className="text-charcoal font-medium hover:text-forest">{r.ownerId === me ? 'You' : owner?.name}</Link></span>
            <span>Qty {r.quantity}</span>
          </div>
          {r.type === 'borrow' && <div className="text-[12.5px] text-grey mt-1 inline-flex items-center gap-1"><CalendarRange className="w-3.5 h-3.5" />{fmtDate(r.startDate)} to {fmtDate(r.returnDate)} ({r.duration})</div>}
          {r.type === 'exchange' && r.offeredItem && <div className="text-[12.5px] mt-1 inline-flex items-center gap-1.5 text-forest"><ArrowLeftRight className="w-3.5 h-3.5" />Offers: {r.offeredItem} ({r.offeredCondition})</div>}
          {r.message && <p className="text-[13.5px] mt-2 bg-ivory border border-beige rounded-xl px-3 py-2">"{r.message}"</p>}
        </div>
      </div>

      {r.status === 'accepted' && (
        <div className="mt-4 rounded-xl border border-sage/50 bg-sage-soft/50 p-3">
          <div className="text-[12.5px] font-display font-bold text-forest mb-2 flex items-center gap-1.5"><Handshake className="w-4 h-4" />Handover confirmation: both people must confirm</div>
          <div className="flex flex-wrap gap-4 text-[13px]">
            {[owner, requester].map((u) => u && (
              <span key={u.id} className="inline-flex items-center gap-1.5">{r.confirmations.includes(u.id) ? <CheckCircle2 className="w-4 h-4 text-forest" /> : <Circle className="w-4 h-4 text-grey" />}{u.id === me ? 'You' : u.name} {r.confirmations.includes(u.id) ? 'confirmed' : 'pending'}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4 justify-end">
        {isOwner && r.status === 'pending' && (
          <>
            <Btn size="sm" onClick={() => { setRequestStatus(r.id, 'accepted'); toast({ title: 'Request accepted', description: `${requester?.name} has been notified.` }); }} data-testid={`button-accept-${r.id}`}><Check className="w-4 h-4" />Accept</Btn>
            <Btn size="sm" variant="danger" onClick={() => setConfirm('reject')} data-testid={`button-reject-${r.id}`}><X className="w-4 h-4" />Reject</Btn>
          </>
        )}
        {!isOwner && r.status === 'pending' && <Btn size="sm" variant="danger" onClick={() => setConfirm('cancel')} data-testid={`button-cancel-${r.id}`}><Ban className="w-4 h-4" />Cancel request</Btn>}
        {r.status === 'accepted' && !iConfirmed && <Btn size="sm" onClick={() => setConfirm('handover')} data-testid={`button-confirm-handover-${r.id}`}><Handshake className="w-4 h-4" />Confirm {r.type === 'borrow' ? 'return completed' : 'handover'}</Btn>}
        {r.status === 'accepted' && iConfirmed && <Badge tone="sage" className="h-8 px-3">Waiting for {other?.name.split(' ')[0]}</Badge>}
        {r.status === 'completed' && !reviewed && <Btn size="sm" variant="sage" onClick={() => setReview(true)} data-testid={`button-review-${r.id}`}><Star className="w-4 h-4" />Leave a review</Btn>}
        {r.status === 'completed' && reviewed && <Badge tone="muted" className="h-8 px-3">Reviewed</Badge>}
        <Btn size="sm" variant="secondary" onClick={() => other && message(other.id, r.listingId)} data-testid={`button-message-${r.id}`}><MessageCircle className="w-4 h-4" />Message {isOwner ? 'requester' : 'owner'}</Btn>
      </div>
      <div className={cn('text-[11.5px] text-grey mt-2 text-right')}>Updated {timeAgo(r.updatedAt)}</div>

      <ConfirmModal open={confirm === 'reject'} onOpenChange={(o) => !o && setConfirm(null)} title="Reject this request?" text={`${requester?.name} will be notified.`} confirmLabel="Reject" danger onConfirm={() => { setRequestStatus(r.id, 'rejected'); toast({ title: 'Request rejected' }); }} />
      <ConfirmModal open={confirm === 'cancel'} onOpenChange={(o) => !o && setConfirm(null)} title="Cancel your request?" text="The owner will see that you withdrew it." confirmLabel="Cancel request" danger onConfirm={() => { setRequestStatus(r.id, 'cancelled'); toast({ title: 'Request cancelled' }); }} />
      <ConfirmModal open={confirm === 'handover'} onOpenChange={(o) => !o && setConfirm(null)} title="Confirm the handover?" text={`Only confirm once the item has actually changed hands${r.type === 'borrow' ? ' and been returned' : ''}. The request completes after both of you confirm.`} confirmLabel="Yes, confirm" onConfirm={() => { confirmCompletion(r.id); toast({ title: 'Confirmation recorded' }); }} />
      <Modal open={review} onOpenChange={setReview} title={`Review ${other?.name}`} description="Reviews are visible on their profile.">
        <div className="space-y-4">
          <div className="flex items-center gap-3"><Stars value={rating} onChange={setRating} size={26} /><span className="text-sm text-grey">{rating} of 5</span></div>
          <Field label="Short review" required><Textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={240} placeholder="On time, item as described..." data-testid="input-review-text" /></Field>
          <Btn className="w-full" disabled={!text.trim()} onClick={() => { if (other) { addReview(r.id, other.id, rating, text.trim()); toast({ title: 'Review posted' }); setReview(false); } }} data-testid="button-submit-review">Post review</Btn>
        </div>
      </Modal>
    </Card>
  );
}
