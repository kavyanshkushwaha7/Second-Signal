import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { Users, ArrowLeft, Send, UsersRound, Package } from 'lucide-react';
import { useStore } from '@/context/AppStore';
import { Avatar, Btn, Card, Chips, EmptyState, LinkBtn, PageHeader, SearchBar, Select, Tabs } from '@/components/kit';
import { ListingGrid } from '@/components/ListingCard';
import { ListingChip } from '@/components/ChatBubble';
import { timeAgo } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function JoinButton({ id }: { id: string }) {
  const { data, me, toggleCommunity } = useStore();
  const { toast } = useToast();
  const c = data.communities.find((x) => x.id === id)!;
  const joined = c.memberIds.includes(me);
  return (
    <Btn size="sm" variant={joined ? 'secondary' : 'primary'} onClick={(e) => { e.preventDefault(); toggleCommunity(id); toast({ title: joined ? `Left ${c.name}` : `Joined ${c.name}` }); }} data-testid={`button-join-${id}`}>
      {joined ? 'Leave' : 'Join'}
    </Btn>
  );
}

const memberCount = (c: { baseMembers: number; memberIds: string[] }) => c.baseMembers + c.memberIds.length;

export function Communities() {
  const { data, me } = useStore();
  const [q, setQ] = useState('');
  const [scope, setScope] = useState<'all' | 'joined'>('all');
  const list = data.communities.filter((c) => (scope === 'all' || c.memberIds.includes(me)) && (!q || `${c.name} ${c.description}`.toLowerCase().includes(q.toLowerCase())));
  const joinedIds = data.communities.filter((c) => c.memberIds.includes(me)).map((c) => c.id);
  const fromMine = data.listings.filter((l) => l.communityId && joinedIds.includes(l.communityId)).slice(0, 6);
  return (
    <div>
      <PageHeader eyebrow="Groups" title="Communities" description="Clubs, hostels and interest groups that share gear between members." />
      <div className="flex flex-col sm:flex-row gap-3 mb-6"><SearchBar value={q} onChange={setQ} placeholder="Search communities" className="flex-1 max-w-md" /><Chips items={[{ value: 'all', label: 'Discover' }, { value: 'joined', label: `Joined (${joinedIds.length})` }]} value={scope} onChange={setScope} /></div>
      {list.length === 0 ? <EmptyState icon={<UsersRound className="w-6 h-6" />} title="No communities found" text="Try discovering more groups." /> : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {list.map((c, i) => (
            <Link key={c.id} href={`/community/${c.id}`} className="rise group" style={{ animationDelay: `${i * 40}ms` }} data-testid={`card-community-${c.id}`}>
              <Card className="p-5 h-full flex flex-col hover:border-sage transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-sage-soft text-forest flex items-center justify-center font-display font-extrabold text-lg group-hover:bg-forest group-hover:text-white transition-colors">{c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
                <div className="font-display font-bold mt-4">{c.name}</div>
                <p className="text-[13px] text-grey mt-1 flex-1">{c.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[12.5px] text-grey inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" />{memberCount(c)} members</span>
                  <JoinButton id={c.id} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {fromMine.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold mb-4">Shared in your communities</h2>
          <ListingGrid listings={fromMine} />
        </section>
      )}
    </div>
  );
}

export function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, me, getUser, postToCommunity } = useStore();
  const [tab, setTab] = useState<'feed' | 'listings' | 'members'>('feed');
  const [text, setText] = useState('');
  const [attach, setAttach] = useState('');
  const c = data.communities.find((x) => x.id === id);
  if (!c) return <EmptyState icon={<UsersRound className="w-6 h-6" />} title="Community not found" text="It may have been archived." action={<LinkBtn href="/communities">All communities</LinkBtn>} />;
  const joined = c.memberIds.includes(me);
  const listings = data.listings.filter((l) => l.communityId === c.id);
  const myListings = data.listings.filter((l) => l.ownerId === me);
  return (
    <div>
      <Link href="/communities" className="inline-flex items-center gap-1.5 text-sm font-display font-semibold text-grey hover:text-forest mb-4"><ArrowLeft className="w-4 h-4" />Communities</Link>
      <Card className="p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-20 w-56 h-56 rounded-full border-[22px] border-sage-soft" aria-hidden />
        <div className="relative flex flex-col sm:flex-row gap-5 sm:items-center">
          <div className="w-16 h-16 rounded-2xl bg-forest text-white flex items-center justify-center font-display font-extrabold text-2xl">{c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
          <div className="flex-1"><h1 className="text-[26px] font-extrabold" data-testid="text-community-name">{c.name}</h1><p className="text-grey">{c.description}</p><div className="text-[13px] text-grey mt-1">{memberCount(c)} members · {listings.length} shared listings</div></div>
          <JoinButton id={c.id} />
        </div>
      </Card>
      <Tabs tabs={[{ value: 'feed', label: 'Community Feed', count: c.posts.length }, { value: 'listings', label: 'Shared Listings', count: listings.length }, { value: 'members', label: 'Members', count: c.memberIds.length }]} value={tab} onChange={setTab} className="mt-6 mb-5" />
      {tab === 'feed' && (
        <div className="max-w-2xl space-y-4">
          {joined ? (
            <Card className="p-4">
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={`Share with ${c.name}...`} className="w-full resize-none min-h-[70px] text-[14px] focus:outline-none" data-testid="input-community-post" />
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <Select value={attach} onChange={(e) => setAttach(e.target.value)} className="sm:w-64 h-9" data-testid="select-community-attach"><option value="">Attach a listing (optional)</option>{myListings.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}</Select>
                <Btn size="sm" className="sm:ml-auto h-9" disabled={!text.trim()} onClick={() => { postToCommunity(c.id, text.trim(), attach || undefined); setText(''); setAttach(''); }} data-testid="button-community-post"><Send className="w-4 h-4" />Post</Btn>
              </div>
            </Card>
          ) : <div className="rounded-2xl border border-dashed border-beige p-4 text-sm text-grey flex items-center justify-between gap-3">Join to post in this community.<JoinButton id={c.id} /></div>}
          {c.posts.length === 0 && <EmptyState icon={<Package className="w-6 h-6" />} title="No posts yet" text="Start the conversation." />}
          {c.posts.map((p) => { const u = getUser(p.userId); return (
            <Card key={p.id} className="p-4 rise" data-testid={`post-community-${p.id}`}>
              <div className="flex items-center gap-3"><Avatar user={u} size={36} /><div><Link href={`/profile/${u?.id}`} className="font-semibold hover:text-forest">{u?.name}</Link><div className="text-[12px] text-grey">{timeAgo(p.createdAt)}</div></div></div>
              <p className="text-[14.5px] mt-3">{p.text}</p>
              {p.listingId && <div className="mt-3 max-w-sm"><ListingChip listingId={p.listingId} /></div>}
            </Card>
          ); })}
        </div>
      )}
      {tab === 'listings' && (listings.length ? <ListingGrid listings={listings} /> : <EmptyState icon={<Package className="w-6 h-6" />} title="No shared listings" text="When creating a listing, choose this community to share it here." action={<LinkBtn href="/create-listing">Create Listing</LinkBtn>} />)}
      {tab === 'members' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {c.memberIds.map((mid) => { const u = getUser(mid); return u && (
            <Link key={mid} href={`/profile/${mid}`} className={cn('flex items-center gap-3 p-3 rounded-2xl bg-white border border-beige hover:border-sage')}><Avatar user={u} size={40} /><div><div className="font-semibold">{u.name}{mid === me && ' (you)'}</div><div className="text-[12px] text-grey">{u.department}</div></div></Link>
          ); })}
          <div className="p-3 text-[13px] text-grey self-center">+ {c.baseMembers} more campus members</div>
        </div>
      )}
    </div>
  );
}
