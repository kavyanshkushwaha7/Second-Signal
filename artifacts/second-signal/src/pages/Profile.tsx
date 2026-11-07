import { useRef, useState } from 'react';
import { Link, useParams } from 'wouter';
import { MessageCircle, Pencil, MapPin, GraduationCap, CalendarDays, Lock, UserX, Camera, Star, Package } from 'lucide-react';
import type { ListingType } from '@/types';
import { useStore } from '@/context/AppStore';
import { Avatar, Btn, Card, EmptyState, Field, Input, LinkBtn, Modal, Select, Stars, Tabs, Textarea, Badge } from '@/components/kit';
import { ListingGrid } from '@/components/ListingCard';
import { FriendButton, useRelation } from '@/components/UserCard';
import { useMessageOwner } from '@/hooks/useMessageOwner';
import { CAMPUSES, fileToDataUrl, fmtDate, timeAgo } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';

type Tab = 'all' | ListingType | 'want' | 'reviews';

function EditProfile({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { currentUser, updateProfile, data, me } = useStore();
  const { toast } = useToast();
  const [f, setF] = useState({ name: currentUser.name, username: currentUser.username, bio: currentUser.bio, campus: currentUser.campus, department: currentUser.department, year: currentUser.year, interests: currentUser.interests.join(', '), avatar: currentUser.avatar ?? '' });
  const [e, setE] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const save = () => {
    const er: Record<string, string> = {};
    if (!f.name.trim()) er.name = 'Name is required.';
    if (!/^[a-z0-9._]{3,}$/.test(f.username)) er.username = 'Lowercase letters, numbers, dots or underscores (3+).';
    else if (data.users.some((u) => u.username === f.username && u.id !== me)) er.username = 'That username is taken.';
    setE(er);
    if (Object.keys(er).length) return;
    updateProfile({ ...f, avatar: f.avatar || undefined, interests: f.interests.split(',').map((s) => s.trim()).filter(Boolean) });
    toast({ title: 'Profile updated' });
    onOpenChange(false);
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Edit Profile" wide>
      <div className="flex items-center gap-4 mb-5">
        <Avatar user={{ ...currentUser, avatar: f.avatar || undefined, name: f.name || currentUser.name }} size={72} />
        <div className="flex gap-2">
          <Btn variant="secondary" size="sm" onClick={() => fileRef.current?.click()} data-testid="button-upload-avatar"><Camera className="w-4 h-4" />Change photo</Btn>
          {f.avatar && <Btn variant="ghost" size="sm" onClick={() => setF({ ...f, avatar: '' })}>Remove</Btn>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={async (ev) => { const file = ev.target.files?.[0]; if (file) setF({ ...f, avatar: await fileToDataUrl(file, 300) }); }} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" required error={e.name}><Input value={f.name} onChange={(x) => setF({ ...f, name: x.target.value })} data-testid="input-profile-name" /></Field>
        <Field label="Username" required error={e.username}><Input value={f.username} onChange={(x) => setF({ ...f, username: x.target.value.toLowerCase() })} data-testid="input-profile-username" /></Field>
        <Field label="Bio" className="sm:col-span-2"><Textarea value={f.bio} onChange={(x) => setF({ ...f, bio: x.target.value })} maxLength={180} data-testid="input-profile-bio" /></Field>
        <Field label="Campus"><Select value={f.campus} onChange={(x) => setF({ ...f, campus: x.target.value })}>{CAMPUSES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Department"><Input value={f.department} onChange={(x) => setF({ ...f, department: x.target.value })} data-testid="input-profile-department" /></Field>
        <Field label="Year"><Select value={f.year} onChange={(x) => setF({ ...f, year: x.target.value })}>{['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Interests" hint="Comma separated"><Input value={f.interests} onChange={(x) => setF({ ...f, interests: x.target.value })} /></Field>
      </div>
      <div className="flex justify-end gap-2 mt-6"><Btn variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Btn><Btn onClick={save} data-testid="button-save-profile">Save changes</Btn></div>
    </Modal>
  );
}

export default function Profile() {
  const params = useParams<{ userId?: string }>();
  const { me, getUser, data, friendsOf, getListing } = useStore();
  const message = useMessageOwner();
  const userId = params.userId ?? me;
  const user = getUser(userId);
  const rel = useRelation(userId);
  const [tab, setTab] = useState<Tab>('all');
  const [edit, setEdit] = useState(false);

  if (!user) return <EmptyState icon={<UserX className="w-6 h-6" />} title="Profile not found" text="This student may have left SecondSignal." action={<LinkBtn href="/friends">Find people</LinkBtn>} />;

  const self = rel === 'self';
  const vis = data.settings[user.id]?.visibility ?? 'campus';
  const hidden = !self && vis === 'friends' && rel !== 'friend';
  const listings = data.listings.filter((l) => l.ownerId === user.id);
  const wants = data.wants.filter((w) => w.userId === user.id);
  const reviews = data.reviews.filter((r) => r.toId === user.id);
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const shared = data.requests.filter((r) => r.ownerId === user.id && r.status === 'completed').length + listings.filter((l) => l.type === 'giveaway').length;
  const shown = tab === 'all' ? listings : listings.filter((l) => l.type === tab);

  return (
    <div>
      <div className="relative rounded-3xl overflow-hidden border border-beige">
        <div className="h-40 sm:h-52 bg-forest relative overflow-hidden" data-testid="img-cover">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 200" aria-hidden>
            {Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={640 + (user.hue % 80)} cy={220} r={40 + i * 42} fill="none" stroke="#A8BDAA" strokeOpacity={0.32 - i * 0.03} strokeWidth="1.5" />)}
            {Array.from({ length: 5 }).map((_, i) => <circle key={`b${i}`} cx={90} cy={-20} r={30 + i * 36} fill="none" stroke="#F8F7F2" strokeOpacity={0.12} strokeWidth="1.2" />)}
          </svg>
        </div>
        <div className="bg-white px-5 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
            <Avatar user={user} size={112} ring className="ring-4 ring-white rounded-full" showOnline />
            <div className="flex-1 min-w-0 sm:pb-2">
              <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-tight" data-testid="text-profile-name">{user.name}</h1>
              <div className="text-grey text-[14px]">@{user.username}</div>
            </div>
            <div className="flex gap-2 sm:pb-2">
              {self ? <Btn onClick={() => setEdit(true)} data-testid="button-edit-profile"><Pencil className="w-4 h-4" />Edit Profile</Btn> : (
                <>
                  <FriendButton user={user} size="md" />
                  <Btn variant="secondary" onClick={() => message(user.id)} data-testid="button-profile-message"><MessageCircle className="w-4 h-4" />Message</Btn>
                </>
              )}
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-[15px] text-charcoal/85">{user.bio}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-[13px] text-grey">
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" />{user.campus}</span>
            <span className="inline-flex items-center gap-1.5"><GraduationCap className="w-4 h-4" />{user.department} · {user.year}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-4 h-4" />Joined {fmtDate(user.joinedAt)}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">{user.interests.map((i) => <Badge key={i} tone="sage">{i}</Badge>)}</div>
          <div className="grid grid-cols-4 gap-2 mt-6 max-w-xl">
            {[
              [friendsOf(user.id).length, 'Friends', 'stat-friends'], [listings.length, 'Listings', 'stat-listings'], [shared, 'Items shared', 'stat-shared'], [avg ? avg.toFixed(1) : '-', 'Rating', 'stat-rating'],
            ].map(([n, l, t]) => (
              <div key={String(l)} className="rounded-2xl bg-ivory border border-beige px-3 py-3 text-center" data-testid={String(t)}>
                <div className="font-display font-extrabold text-xl">{n}</div><div className="text-[11.5px] text-grey">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {hidden ? (
        <div className="mt-8"><EmptyState icon={<Lock className="w-6 h-6" />} title="Friends-only profile" text={`${user.name.split(' ')[0]} shares listings with friends only. Send a friend request to see them.`} action={<FriendButton user={user} size="md" />} /></div>
      ) : (
        <>
          <Tabs tabs={[
            { value: 'all', label: 'All Listings', count: listings.length },
            { value: 'sell', label: 'Selling', count: listings.filter((l) => l.type === 'sell').length },
            { value: 'borrow', label: 'Borrowing', count: listings.filter((l) => l.type === 'borrow').length },
            { value: 'giveaway', label: 'Giving Away', count: listings.filter((l) => l.type === 'giveaway').length },
            { value: 'exchange', label: 'Exchange', count: listings.filter((l) => l.type === 'exchange').length },
            { value: 'want', label: 'Want List', count: wants.length },
            { value: 'reviews', label: 'Reviews', count: reviews.length },
          ] as { value: Tab; label: string; count: number }[]} value={tab} onChange={setTab} className="mt-8 mb-6" />
          {tab === 'want' ? (wants.length ? (
            <div className="grid sm:grid-cols-2 gap-4">{wants.map((w) => (
              <Card key={w.id} className="p-4"><div className="flex justify-between gap-2"><div className="font-display font-bold">{w.title}</div><Badge tone={w.status === 'open' ? 'outline' : 'forest'}>{w.status === 'open' ? 'Open' : 'Fulfilled'}</Badge></div><p className="text-sm text-grey mt-1">{w.description}</p><div className="text-[12px] text-grey mt-2">Needed by {fmtDate(w.neededBy)} · {w.campus}</div><Link href="/want-list" className="text-[13px] text-forest font-semibold mt-2 inline-block">Open in Want List</Link></Card>
            ))}</div>
          ) : <EmptyState icon={<Package className="w-6 h-6" />} title="No wants posted" text="Nothing on the want list right now." />)
          : tab === 'reviews' ? (reviews.length ? (
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3 mb-2"><span className="font-display font-extrabold text-3xl">{avg.toFixed(1)}</span><Stars value={Math.round(avg)} /><span className="text-sm text-grey">from {reviews.length} completed handovers</span></div>
              {reviews.map((r) => { const from = getUser(r.fromId); const req = data.requests.find((x) => x.id === r.requestId); const li = getListing(req?.listingId); return (
                <Card key={r.id} className="p-4 flex gap-3" data-testid={`card-review-${r.id}`}>
                  <Avatar user={from} size={36} />
                  <div><div className="flex items-center gap-2"><Link href={`/profile/${from?.id}`} className="font-semibold hover:text-forest">{from?.name}</Link><Stars value={r.rating} size={13} /></div><p className="text-[14px] mt-1">{r.text}</p><div className="text-[12px] text-grey mt-1">{li ? `${li.title} · ` : ''}{timeAgo(r.createdAt)}</div></div>
                </Card>
              ); })}
            </div>
          ) : <EmptyState icon={<Star className="w-6 h-6" />} title="No reviews yet" text="Reviews appear after a handover both people confirmed." />)
          : shown.length ? <ListingGrid listings={shown} /> : <EmptyState icon={<Package className="w-6 h-6" />} title="Nothing here yet" text={self ? 'Create a listing and it will show up on your profile.' : 'No listings in this tab.'} action={self ? <LinkBtn href="/create-listing">Create Listing</LinkBtn> : undefined} />}
        </>
      )}
      {self && <EditProfile key={String(edit)} open={edit} onOpenChange={setEdit} />}
    </div>
  );
}
