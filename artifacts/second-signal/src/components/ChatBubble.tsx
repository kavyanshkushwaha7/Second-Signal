import { Link } from 'wouter';
import { Paperclip, FileText } from 'lucide-react';
import type { Message } from '@/types';
import { useStore } from '@/context/AppStore';
import { fmtTime, img, priceLabel } from '@/utils/format';
import { cn } from '@/lib/utils';

export function ListingChip({ listingId, mine }: { listingId: string; mine?: boolean }) {
  const { getListing } = useStore();
  const l = getListing(listingId);
  if (!l) return <div className="text-[12px] italic opacity-70">Listing no longer available</div>;
  return (
    <Link href={`/item/${l.id}`} className={cn('flex gap-2.5 items-center rounded-xl p-2 mb-1.5 transition', mine ? 'bg-white/10 hover:bg-white/15' : 'bg-ivory hover:bg-sage-soft border border-beige')} data-testid={`link-shared-listing-${l.id}`}>
      <img src={img(l.images[0] ?? '')} alt="" className="w-12 h-12 rounded-lg object-cover" />
      <div className="min-w-0"><div className="text-[13px] font-semibold line-clamp-1">{l.title}</div><div className={cn('text-[12px]', mine ? 'text-sage' : 'text-forest')}>{priceLabel(l)} · View listing</div></div>
    </Link>
  );
}

export function ChatBubble({ m, mine }: { m: Message; mine: boolean }) {
  return (
    <div className={cn('flex rise', mine ? 'justify-end' : 'justify-start')} data-testid={`message-${m.id}`}>
      <div className={cn('max-w-[78%] sm:max-w-[65%] rounded-2xl px-3.5 py-2.5 text-[14px] shadow-[0_1px_1px_rgba(37,43,39,0.04)]', mine ? 'bg-forest text-white rounded-br-md' : 'bg-white border border-beige rounded-bl-md')}>
        {m.listingId && <ListingChip listingId={m.listingId} mine={mine} />}
        {m.attachment && (m.attachment.isImage ? (
          <a href={m.attachment.dataUrl} target="_blank" rel="noreferrer"><img src={m.attachment.dataUrl} alt={m.attachment.name} className="rounded-xl max-h-60 mb-1.5" /></a>
        ) : (
          <div className={cn('flex items-center gap-2 rounded-xl px-2.5 py-2 mb-1.5 text-[13px]', mine ? 'bg-white/10' : 'bg-ivory')}><FileText className="w-4 h-4" />{m.attachment.name}</div>
        ))}
        {m.text && <div className="whitespace-pre-wrap break-words">{m.text}</div>}
        <div className={cn('text-[10.5px] mt-1 text-right flex items-center justify-end gap-1', mine ? 'text-sage' : 'text-grey')}>{m.attachment && <Paperclip className="w-2.5 h-2.5" />}{fmtTime(m.createdAt)}</div>
      </div>
    </div>
  );
}
