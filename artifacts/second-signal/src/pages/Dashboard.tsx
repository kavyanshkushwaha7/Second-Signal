import { Link } from 'wouter';
import { Package, Activity, Clock, Inbox, Repeat, HandHeart, Gift, ArrowLeftRight, MessageCircle, Plus } from 'lucide-react';
import type { ItemRequest } from '@/types';
import { useStore } from '@/context/AppStore';
import { Avatar, Card, LinkBtn, PageHeader, StatusBadge, TypeBadge } from '@/components/kit';
import { img, priceLabel, timeAgo } from '@/utils/format';

export default function Dashboard() {
  const { data, me, getListing, getUser, currentUser } = useStore();
  const myListings = data.listings.filter((l) => l.ownerId === me);
  const active = myListings.filter((l) => l.availability === 'Available');
  const reqs = data.requests.filter((r) => r.requesterId === me || r.ownerId === me);
  const pendingSent = reqs.filter((r) => r.requesterId === me && r.status === 'pending');
  const received = reqs.filter((r) => r.ownerId === me && r.status === 'pending');
  const borrowed = reqs.filter((r) => r.requesterId === me && r.type === 'borrow' && (r.status === 'accepted' || r.status === 'completed'));
  const lent = reqs.filter((r) => r.ownerId === me && r.type === 'borrow' && (r.status === 'accepted' || r.status === 'completed'));
  const given = reqs.filter((r) => r.ownerId === me && r.type === 'giveaway' && r.status === 'completed');
  const exchanges = reqs.filter((r) => r.type === 'exchange' && r.status === 'completed');
  const convs = data.conversations.filter((c) => c.participants.includes(me) && c.messages.length).sort((a, b) => b.messages[b.messages.length - 1].createdAt.localeCompare(a.messages[a.messages.length - 1].createdAt)).slice(0, 4);

  const stats = [
    { label: 'My Listings', n: myListings.length, icon: Package, href: '/profile' },
    { label: 'Active Listings', n: active.length, icon: Activity, href: '/profile' },
    { label: 'Pending Requests', n: pendingSent.length, icon: Clock, href: '/my-requests' },
    { label: 'Received Requests', n: received.length, icon: Inbox, href: '/my-requests' },
    { label: 'Items Borrowed', n: borrowed.length, icon: Repeat, href: '/my-requests' },
    { label: 'Items Lent', n: lent.length, icon: HandHeart, href: '/my-requests' },
    { label: 'Items Given Away', n: given.length, icon: Gift, href: '/my-requests' },
    { label: 'Completed Exchanges', n: exchanges.length, icon: ArrowLeftRight, href: '/my-requests' },
  ];

  const RequestRow = ({ r }: { r: ItemRequest }) => { const l = getListing(r.listingId); const o = getUser(r.ownerId === me ? r.requesterId : r.ownerId); return (
    <Link href="/my-requests" className="flex items-center gap-3 py-2.5 hover:bg-ivory -mx-2 px-2 rounded-xl">
      <img src={img(l?.images[0] ?? '')} alt="" className="w-11 h-11 rounded-lg object-cover bg-[#F1EFE8]" />
      <div className="flex-1 min-w-0"><div className="text-[14px] font-semibold truncate">{l?.title ?? 'Removed listing'}</div><div className="text-[12px] text-grey">{r.ownerId === me ? 'from' : 'to'} {o?.name} · {timeAgo(r.createdAt)}</div></div>
      <StatusBadge status={r.status} />
    </Link>
  ); };

  return (
    <div>
      <PageHeader eyebrow={`${currentUser.name}`} title="My Dashboard" description="Your activity across SecondSignal at a glance." actions={<LinkBtn href="/create-listing"><Plus className="w-4 h-4" />Create Listing</LinkBtn>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <Link key={s.label} href={s.href} className="rise" style={{ animationDelay: `${i * 40}ms` }} data-testid={`stat-${s.label.toLowerCase().replace(/ /g, '-')}`}>
            <Card className="p-4 sm:p-5 hover:border-sage transition-colors h-full">
              <div className="flex items-center justify-between"><s.icon className="w-5 h-5 text-forest" /><span className="font-display font-extrabold text-[28px] leading-none">{s.n}</span></div>
              <div className="text-[13px] text-grey mt-3 font-medium">{s.label}</div>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5 mt-6">
        <Card className="p-5">
          <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Received Requests</h3><Link href="/my-requests" className="text-[13px] text-forest font-semibold">Manage</Link></div>
          {received.length ? received.slice(0, 5).map((r) => <RequestRow key={r.id} r={r} />) : <p className="text-sm text-grey py-4">No requests waiting on you.</p>}
        </Card>
        <Card className="p-5">
          <div className="flex justify-between items-center mb-2"><h3 className="font-bold">Your Pending Requests</h3><Link href="/my-requests" className="text-[13px] text-forest font-semibold">View all</Link></div>
          {pendingSent.length ? pendingSent.slice(0, 5).map((r) => <RequestRow key={r.id} r={r} />) : <p className="text-sm text-grey py-4">You have no pending requests.</p>}
        </Card>
        <Card className="p-5">
          <div className="flex justify-between items-center mb-3"><h3 className="font-bold">My Listings</h3><Link href="/profile" className="text-[13px] text-forest font-semibold">On profile</Link></div>
          <div className="space-y-1">
            {myListings.slice(0, 6).map((l) => (
              <div key={l.id} className="flex items-center gap-3 py-2">
                <img src={img(l.images[0] ?? '')} alt="" className="w-11 h-11 rounded-lg object-cover" />
                <div className="flex-1 min-w-0"><Link href={`/item/${l.id}`} className="text-[14px] font-semibold truncate block hover:text-forest">{l.title}</Link><div className="text-[12px] text-grey">{priceLabel(l)} · {l.availability}</div></div>
                <TypeBadge type={l.type} />
                <Link href={`/edit-listing/${l.id}`} className="text-[12.5px] font-semibold text-forest px-2 hover:underline" data-testid={`link-edit-${l.id}`}>Edit</Link>
              </div>
            ))}
            {!myListings.length && <p className="text-sm text-grey py-4">No listings yet.</p>}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex justify-between items-center mb-3"><h3 className="font-bold flex items-center gap-2"><MessageCircle className="w-4 h-4 text-forest" />Recent Messages</h3><Link href="/messages" className="text-[13px] text-forest font-semibold">Open</Link></div>
          {convs.map((c) => { const o = getUser(c.participants.find((p) => p !== me)); const m = c.messages[c.messages.length - 1]; return (
            <Link key={c.id} href={`/messages/${c.id}`} className="flex items-center gap-3 py-2.5 hover:bg-ivory -mx-2 px-2 rounded-xl">
              <Avatar user={o} size={38} /><div className="flex-1 min-w-0"><div className="text-[14px] font-semibold">{o?.name}</div><div className="text-[12.5px] text-grey truncate">{m.text || 'Shared a listing'}</div></div><span className="text-[11px] text-grey">{timeAgo(m.createdAt)}</span>
            </Link>
          ); })}
          {!convs.length && <p className="text-sm text-grey py-4">No conversations yet.</p>}
        </Card>
      </div>
    </div>
  );
}
