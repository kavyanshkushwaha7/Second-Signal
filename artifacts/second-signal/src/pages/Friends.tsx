import { useMemo, useState } from 'react';
import { Users, UserPlus, Search } from 'lucide-react';
import { useStore } from '@/context/AppStore';
import { Btn, EmptyState, LinkBtn, PageHeader, SearchBar, Tabs } from '@/components/kit';
import { UserCard } from '@/components/UserCard';
import { useToast } from '@/hooks/use-toast';

type Tab = 'friends' | 'requests' | 'suggested' | 'search';

export default function Friends() {
  const { data, me, currentUser, friendsOf, getUser, respondFriendRequest } = useStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('friends');
  const [q, setQ] = useState('');
  const friendIds = friendsOf(me);
  const friends = friendIds.map((id) => getUser(id)!).filter(Boolean);
  const incoming = data.friendRequests.filter((f) => f.toId === me);
  const outgoing = data.friendRequests.filter((f) => f.fromId === me);

  const suggested = useMemo(() => {
    const myCommunities = data.communities.filter((c) => c.memberIds.includes(me)).map((c) => c.id);
    return data.users.filter((u) => u.id !== me && !friendIds.includes(u.id)).map((u) => {
      const sharedComm = data.communities.filter((c) => myCommunities.includes(c.id) && c.memberIds.includes(u.id));
      const sharedInterests = u.interests.filter((i) => currentUser.interests.includes(i));
      const mutual = friendsOf(u.id).filter((x) => friendIds.includes(x)).length;
      const score = (u.campus === currentUser.campus ? 2 : 0) + sharedComm.length * 2 + sharedInterests.length + mutual;
      const reason = sharedComm[0] ? `Both in ${sharedComm[0].name}` : u.campus === currentUser.campus ? `Also on ${u.campus}` : sharedInterests[0] ? `Into ${sharedInterests[0]}` : mutual ? `${mutual} mutual friends` : 'On SecondSignal';
      return { u, score, reason };
    }).sort((a, b) => b.score - a.score);
  }, [data, me, friendIds, currentUser, friendsOf]);

  const results = data.users.filter((u) => u.id !== me && q && `${u.name} ${u.username}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader eyebrow="People" title="Friends" description="The people you share with. Friends see your listings first in Buy from Friends." />
      <SearchBar value={q} onChange={(v) => { setQ(v); if (v) setTab('search'); }} placeholder="Search people by name or username" className="max-w-lg mb-5" testId="input-friend-search" />
      <Tabs tabs={[
        { value: 'friends', label: 'My Friends', count: friends.length },
        { value: 'requests', label: 'Friend Requests', count: incoming.length },
        { value: 'suggested', label: 'Suggested' },
        { value: 'search', label: 'Search' },
      ]} value={tab} onChange={setTab} className="mb-6" />

      {tab === 'friends' && (friends.length ? <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{friends.map((u) => <UserCard key={u.id} user={u} />)}</div>
        : <EmptyState icon={<Users className="w-6 h-6" />} title="No friends yet" text="Add people from your campus and communities." action={<Btn onClick={() => setTab('suggested')}>See suggestions</Btn>} />)}

      {tab === 'requests' && (
        <div className="space-y-8">
          {incoming.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {incoming.map((fr) => { const u = getUser(fr.fromId)!; return (
                <UserCard key={fr.id} user={u} reason="Wants to connect" extra={<>
                  <Btn size="sm" onClick={() => { respondFriendRequest(fr.id, true); toast({ title: `You and ${u.name.split(' ')[0]} are now friends` }); }} data-testid={`button-accept-${fr.id}`}>Accept</Btn>
                  <Btn size="sm" variant="secondary" onClick={() => { respondFriendRequest(fr.id, false); toast({ title: 'Request declined' }); }} data-testid={`button-reject-${fr.id}`}>Reject</Btn>
                  <LinkBtn size="sm" variant="ghost" href={`/profile/${u.id}`}>View Profile</LinkBtn>
                </>} />
              ); })}
            </div>
          ) : <EmptyState icon={<UserPlus className="w-6 h-6" />} title="No pending requests" text="Incoming friend requests appear here." />}
          {outgoing.length > 0 && (
            <div>
              <h3 className="font-bold mb-3">Sent by you</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{outgoing.map((fr) => <UserCard key={fr.id} user={getUser(fr.toId)!} reason="Awaiting response" />)}</div>
            </div>
          )}
        </div>
      )}

      {tab === 'suggested' && <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{suggested.map(({ u, reason }) => <UserCard key={u.id} user={u} reason={reason} />)}</div>}

      {tab === 'search' && (!q ? <EmptyState icon={<Search className="w-6 h-6" />} title="Search for people" text="Type a name or username above." />
        : results.length ? <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{results.map((u) => <UserCard key={u.id} user={u} />)}</div>
        : <EmptyState icon={<Search className="w-6 h-6" />} title={`No one called "${q}"`} text="Check the spelling or try a username." />)}
    </div>
  );
}
