import { useMemo, useState } from 'react';
import { Inbox } from 'lucide-react';
import { useStore } from '@/context/AppStore';
import { DemoNote, EmptyState, LinkBtn, PageHeader, Tabs } from '@/components/kit';
import { RequestCard } from '@/components/RequestCard';

type Tab = 'all' | 'sent' | 'received' | 'pending' | 'accepted' | 'rejected' | 'completed';

export default function MyRequests() {
  const { data, me } = useStore();
  const [tab, setTab] = useState<Tab>('all');
  const mine = useMemo(() => data.requests.filter((r) => r.requesterId === me || r.ownerId === me).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [data.requests, me]);
  const filt = (t: Tab) => mine.filter((r) =>
    t === 'all' ? true : t === 'sent' ? r.requesterId === me : t === 'received' ? r.ownerId === me
      : t === 'rejected' ? r.status === 'rejected' || r.status === 'cancelled' : r.status === t);
  const list = filt(tab);
  const tabs: Tab[] = ['all', 'sent', 'received', 'pending', 'accepted', 'rejected', 'completed'];
  const label: Record<Tab, string> = { all: 'All Requests', sent: 'Sent Requests', received: 'Received Requests', pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected', completed: 'Completed' };
  return (
    <div className="max-w-4xl">
      <PageHeader eyebrow="Requests" title="My Requests" description="Everything you have asked for, and everything people have asked you for." />
      <DemoNote className="mb-5">Requests only complete when both people confirm the handover. Use "Switch demo account" in the user menu to act as the other person.</DemoNote>
      <Tabs tabs={tabs.map((t) => ({ value: t, label: label[t], count: filt(t).length }))} value={tab} onChange={setTab} className="mb-5" />
      {list.length === 0 ? <EmptyState icon={<Inbox className="w-6 h-6" />} title="No requests here" text="Request an item from Explore, or list something so others can request it." action={<LinkBtn href="/explore">Explore items</LinkBtn>} />
        : <div className="space-y-4">{list.map((r) => <RequestCard key={r.id} r={r} />)}</div>}
    </div>
  );
}
