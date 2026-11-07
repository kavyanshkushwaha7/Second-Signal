import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, Gift, Repeat, Tag, ArrowRight, Sparkles, Bell, Rss } from 'lucide-react';
import { useStore } from '@/context/AppStore';
import { Avatar, Btn, Card, Chips, EmptyState, SearchBar } from '@/components/kit';
import { FeedPost } from '@/components/FeedPost';
import { useFakeLoad } from '@/components/Marketplace';
import { CATEGORIES, timeAgo } from '@/utils/format';

const QUICK = [
  { href: '/explore', title: 'Find Something', text: 'Browse what neighbours already own', icon: Search },
  { href: '/give-away', title: 'Give Something', text: 'Pass on what you no longer use', icon: Gift },
  { href: '/borrow', title: 'Borrow Something', text: 'Use it for a week, return it', icon: Repeat },
  { href: '/sell', title: 'Sell Something', text: 'Fair prices, friendly buyers', icon: Tag },
];

export default function Home() {
  const { currentUser, data, unreadNotifications, myNotifications, me } = useStore();
  const [, nav] = useLocation();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const ready = useFakeLoad(380);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const feed = useMemo(() => [...data.listings].filter((l) => cat === 'all' || l.category === cat).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [data.listings, cat]);
  const openWants = data.wants.filter((w) => w.status === 'open' && w.userId !== me).slice(0, 3);
  const shared = data.requests.filter((r) => r.status === 'completed').length + 128;

  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl bg-white border border-beige p-6 sm:p-8 mb-6">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border-[28px] border-sage-soft" aria-hidden />
        <div className="absolute -right-4 -top-4 w-40 h-40 rounded-full border-[18px] border-sage/30" aria-hidden />
        <div className="relative flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <Link href="/profile" data-testid="link-home-profile"><Avatar user={currentUser} size={48} /></Link>
              <div className="text-[13px] text-grey font-medium">{greet}, {currentUser.campus}</div>
            </div>
            <h1 className="text-[30px] sm:text-[40px] font-extrabold leading-[1.08] mt-4" data-testid="text-welcome">
              Welcome back, {currentUser.name.split(' ')[0]}.<br /><span className="text-forest">What can you pass on today?</span>
            </h1>
            <SearchBar value={q} onChange={setQ} placeholder="I'm looking for..." className="mt-5 max-w-md" onSubmit={() => nav(`/explore?q=${encodeURIComponent(q)}`)} testId="input-home-search" />
          </div>
          <div className="flex gap-3">
            <Link href="/notifications" className="flex items-center gap-3 rounded-2xl border border-beige bg-ivory px-4 py-3 hover:border-sage transition" data-testid="link-home-notifications">
              <Bell className="w-5 h-5 text-forest" />
              <div><div className="font-display font-extrabold text-xl leading-none">{unreadNotifications}</div><div className="text-[12px] text-grey">unread</div></div>
            </Link>
            <div className="rounded-2xl border border-beige bg-ivory px-4 py-3">
              <div className="font-display font-extrabold text-xl leading-none text-forest">{shared}</div>
              <div className="text-[12px] text-grey">items reused this term</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
        {QUICK.map((q, i) => (
          <Link key={q.href} href={q.href} className="group rise rounded-2xl bg-white border border-beige p-4 sm:p-5 hover:border-sage hover:-translate-y-0.5 transition-all" style={{ animationDelay: `${i * 60}ms` }} data-testid={`card-quick-${i}`}>
            <div className="w-11 h-11 rounded-xl bg-sage-soft text-forest flex items-center justify-center group-hover:bg-forest group-hover:text-white transition-colors"><q.icon className="w-5 h-5" /></div>
            <div className="font-display font-bold mt-4 flex items-center gap-1">{q.title}<ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" /></div>
            <div className="text-[13px] text-grey mt-0.5">{q.text}</div>
          </Link>
        ))}
      </section>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_320px] gap-8">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-extrabold flex items-center gap-2"><Rss className="w-5 h-5 text-forest" />Community Feed</h2>
            <Link href="/explore" className="text-sm font-display font-semibold text-forest hover:underline">See all</Link>
          </div>
          <Chips items={[{ value: 'all', label: 'Everything' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} value={cat} onChange={setCat} className="mb-5" />
          <div className="space-y-6 max-w-[620px]">
            {!ready ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-[520px] rounded-2xl bg-white border border-beige animate-pulse" />)
              : feed.length === 0 ? <EmptyState icon={<Search className="w-6 h-6" />} title="Quiet in this category" text="No one has posted here yet. Be the first." action={<Btn onClick={() => nav('/create-listing')}>Create Listing</Btn>} />
              : feed.map((l, i) => <FeedPost key={l.id} listing={l} index={i} />)}
          </div>
        </section>
        <aside className="space-y-5 xl:sticky xl:top-24 self-start">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-forest font-display font-bold text-sm"><Sparkles className="w-4 h-4" />AI Matches <span className="text-[10.5px] bg-sage-soft rounded-full px-2 py-0.5">Mock</span></div>
            <p className="text-[13.5px] text-grey mt-1.5">Describe what you need and we will scan listings for close fits.</p>
            <Btn className="w-full mt-4" onClick={() => nav('/matches')} data-testid="button-home-matches">Find matches</Btn>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between"><h3 className="font-bold">Neighbours need</h3><Link href="/want-list" className="text-[13px] text-forest font-semibold">Want List</Link></div>
            <div className="mt-3 space-y-3">
              {openWants.map((w) => {
                const u = data.users.find((x) => x.id === w.userId);
                return (
                  <Link key={w.id} href="/want-list" className="flex gap-3 group">
                    <Avatar user={u} size={32} />
                    <div className="min-w-0"><div className="text-[13.5px] font-semibold group-hover:text-forest line-clamp-1">{w.title}</div><div className="text-[12px] text-grey">{u?.name} · {timeAgo(w.createdAt)}</div></div>
                  </Link>
                );
              })}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold">Recent activity</h3>
            <div className="mt-3 space-y-2.5">
              {myNotifications.slice(0, 4).map((n) => (
                <Link key={n.id} href={n.link} className="block text-[13px] text-charcoal/85 hover:text-forest line-clamp-2">{n.text}<span className="block text-[11.5px] text-grey">{timeAgo(n.createdAt)}</span></Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
