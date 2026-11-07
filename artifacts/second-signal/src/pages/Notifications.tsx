import { useState } from 'react';
import { useLocation } from 'wouter';
import { Bell, UserPlus, UserCheck, MessageCircle, Inbox, Repeat, ArrowLeftRight, CheckCircle2, XCircle, RefreshCw, Handshake, HandHeart, Trash2, CheckCheck } from 'lucide-react';
import type { NotificationType } from '@/types';
import { useStore } from '@/context/AppStore';
import { Avatar, Btn, Chips, EmptyState, PageHeader } from '@/components/kit';
import { timeAgo } from '@/utils/format';
import { cn } from '@/lib/utils';

const ICON: Record<NotificationType, typeof Bell> = {
  friend_request: UserPlus, friend_accepted: UserCheck, message: MessageCircle, item_request: Inbox, borrow_request: Repeat,
  exchange_request: ArrowLeftRight, request_accepted: CheckCircle2, request_rejected: XCircle, listing_update: RefreshCw, handover: Handshake, want_response: HandHeart,
};

export default function Notifications() {
  const { myNotifications, markNotification, markAllNotifications, deleteNotification, getUser, unreadNotifications } = useStore();
  const [, nav] = useLocation();
  const [filter, setFilter] = useState<'all' | 'unread' | 'requests' | 'social'>('all');
  const list = myNotifications.filter((n) =>
    filter === 'all' ? true : filter === 'unread' ? !n.read
      : filter === 'requests' ? ['item_request', 'borrow_request', 'exchange_request', 'request_accepted', 'request_rejected', 'handover', 'want_response'].includes(n.type)
        : ['friend_request', 'friend_accepted', 'message'].includes(n.type));

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Inbox" title="Notifications" description={unreadNotifications ? `${unreadNotifications} unread` : 'You are all caught up.'}
        actions={<Btn variant="secondary" onClick={markAllNotifications} disabled={!unreadNotifications} data-testid="button-mark-all-read"><CheckCheck className="w-4 h-4" />Mark all as read</Btn>} />
      <Chips items={[{ value: 'all', label: 'All' }, { value: 'unread', label: 'Unread' }, { value: 'requests', label: 'Requests' }, { value: 'social', label: 'Friends and messages' }]} value={filter} onChange={setFilter} className="mb-5" />
      {list.length === 0 ? <EmptyState icon={<Bell className="w-6 h-6" />} title="Nothing here" text="New requests, messages and friend activity will land here." /> : (
        <div className="bg-white border border-beige rounded-2xl overflow-hidden divide-y divide-beige">
          {list.map((n) => {
            const Icon = ICON[n.type] ?? Bell;
            const actor = getUser(n.actorId);
            return (
              <div key={n.id} className={cn('group flex items-start gap-3 px-4 py-3.5 transition-colors cursor-pointer', n.read ? 'hover:bg-ivory' : 'bg-sage-soft/50 hover:bg-sage-soft')}
                onClick={() => { markNotification(n.id); nav(n.link); }} data-testid={`row-notification-${n.id}`}>
                <div className="relative">
                  {actor ? <Avatar user={actor} size={42} /> : <div className="w-[42px] h-[42px] rounded-full bg-sage-soft" />}
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center ring-2 ring-white"><Icon className="w-3 h-3" /></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-[14px]', !n.read && 'font-semibold')}>{n.text}</p>
                  <span className="text-[12px] text-grey">{timeAgo(n.createdAt)}</span>
                </div>
                {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-forest mt-2" />}
                <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
                  <button onClick={(e) => { e.stopPropagation(); markNotification(n.id, !n.read); }} className="text-[12px] font-semibold text-forest px-2 py-1 rounded-lg hover:bg-white" data-testid={`button-toggle-read-${n.id}`}>{n.read ? 'Mark unread' : 'Mark read'}</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} className="p-1.5 rounded-lg text-grey hover:bg-white hover:text-charcoal" aria-label="Delete" data-testid={`button-delete-notification-${n.id}`}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
