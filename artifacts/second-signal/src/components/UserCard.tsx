import { useState } from 'react';
import { Link } from 'wouter';
import { UserPlus, UserCheck, MessageCircle, Clock } from 'lucide-react';
import type { User } from '@/types';
import { useStore } from '@/context/AppStore';
import { Avatar, Btn, Card, ConfirmModal } from '@/components/kit';
import { useMessageOwner } from '@/hooks/useMessageOwner';
import { useToast } from '@/hooks/use-toast';

export type Relation = 'self' | 'friend' | 'outgoing' | 'incoming' | 'none';

export function useRelation(userId: string): Relation {
  const { me, isFriend, data } = useStore();
  if (userId === me) return 'self';
  if (isFriend(me, userId)) return 'friend';
  if (data.friendRequests.some((f) => f.fromId === me && f.toId === userId)) return 'outgoing';
  if (data.friendRequests.some((f) => f.fromId === userId && f.toId === me)) return 'incoming';
  return 'none';
}

export function FriendButton({ user, size = 'sm' }: { user: User; size?: 'sm' | 'md' }) {
  const rel = useRelation(user.id);
  const { sendFriendRequest, cancelFriendRequest, removeFriend, respondFriendRequest, data, me } = useStore();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState(false);
  if (rel === 'self') return null;
  if (rel === 'friend') return (
    <>
      <Btn size={size} variant="secondary" onClick={() => setConfirm(true)} data-testid={`button-remove-friend-${user.id}`}><UserCheck className="w-4 h-4" />Friends</Btn>
      <ConfirmModal open={confirm} onOpenChange={setConfirm} title={`Remove ${user.name.split(' ')[0]}?`} text="You can always send a new request later." confirmLabel="Remove Friend" danger onConfirm={() => { removeFriend(user.id); toast({ title: 'Friend removed' }); }} />
    </>
  );
  if (rel === 'outgoing') return <Btn size={size} variant="sage" onClick={() => cancelFriendRequest(user.id)} data-testid={`button-cancel-friend-${user.id}`}><Clock className="w-4 h-4" />Requested</Btn>;
  if (rel === 'incoming') {
    const fr = data.friendRequests.find((f) => f.fromId === user.id && f.toId === me)!;
    return <Btn size={size} onClick={() => { respondFriendRequest(fr.id, true); toast({ title: `You and ${user.name.split(' ')[0]} are now friends` }); }} data-testid={`button-accept-friend-${user.id}`}><UserCheck className="w-4 h-4" />Accept</Btn>;
  }
  return <Btn size={size} onClick={() => { sendFriendRequest(user.id); toast({ title: 'Friend request sent' }); }} data-testid={`button-add-friend-${user.id}`}><UserPlus className="w-4 h-4" />Add Friend</Btn>;
}

export function UserCard({ user, reason, extra }: { user: User; reason?: string; extra?: React.ReactNode }) {
  const { data, friendsOf } = useStore();
  const message = useMessageOwner();
  const rel = useRelation(user.id);
  const listings = data.listings.filter((l) => l.ownerId === user.id).length;
  return (
    <Card className="p-5 rise flex flex-col items-center text-center" data-testid={`card-user-${user.id}`}>
      <Link href={`/profile/${user.id}`}><Avatar user={user} size={68} showOnline /></Link>
      <Link href={`/profile/${user.id}`} className="font-display font-bold mt-3 hover:text-forest">{user.name}</Link>
      <div className="text-[12.5px] text-grey">@{user.username}</div>
      <div className="text-[12.5px] text-grey mt-1">{user.department} · {user.year}</div>
      <div className="flex gap-4 text-[12px] mt-3"><span><b className="font-display">{friendsOf(user.id).length}</b> friends</span><span><b className="font-display">{listings}</b> listings</span></div>
      {reason && <div className="mt-3 text-[12px] bg-sage-soft text-forest rounded-full px-3 py-1">{reason}</div>}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {extra ?? (
          <>
            <FriendButton user={user} />
            {rel !== 'self' && <Btn size="sm" variant="secondary" onClick={() => message(user.id)} data-testid={`button-message-user-${user.id}`}><MessageCircle className="w-4 h-4" /></Btn>}
          </>
        )}
      </div>
      <Link href={`/profile/${user.id}`} className="text-[12.5px] font-semibold text-forest mt-3 hover:underline" data-testid={`link-view-profile-${user.id}`}>View Profile</Link>
    </Card>
  );
}
