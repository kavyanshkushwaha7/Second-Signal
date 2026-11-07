import { Link, useLocation } from 'wouter';
import { Plus } from 'lucide-react';
import { useStore } from '@/context/AppStore';
import { NAV, EXTRA_NAV, isActive } from '@/layouts/nav';
import { cn } from '@/lib/utils';

export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const [loc] = useLocation();
  const { unreadMessages, data, me } = useStore();
  const pendingIn = data.requests.filter((r) => r.ownerId === me && r.status === 'pending').length;
  const badge = (href: string) => (href === '/messages' ? unreadMessages : href === '/my-requests' ? pendingIn : 0);
  const item = (n: (typeof NAV)[number]) => {
    const active = isActive(loc, n.href);
    const Icon = n.icon;
    const b = badge(n.href);
    return (
      <Link
        key={n.href} href={n.href} onClick={onNavigate} data-testid={`link-sidebar-${n.href.slice(1)}`}
        className={cn('group flex items-center gap-3 h-10 px-3 rounded-xl text-[14px] font-display font-semibold transition-all',
          active ? 'bg-forest text-white shadow-[0_6px_14px_-8px_rgba(23,76,60,0.7)]' : 'text-charcoal/80 hover:bg-white hover:text-charcoal')}
      >
        <Icon className={cn('w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-105', active ? 'text-sage' : 'text-grey group-hover:text-forest')} />
        <span className="truncate">{n.label}</span>
        {!!b && <span className={cn('ml-auto text-[11px] min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center', active ? 'bg-white/20' : 'bg-sage-soft text-forest')}>{b}</span>}
      </Link>
    );
  };
  return (
    <nav className="space-y-0.5">
      {NAV.map(item)}
      <div className="pt-4 pb-1.5 px-3 text-[10.5px] font-display font-bold uppercase tracking-[0.14em] text-grey">Tools</div>
      {EXTRA_NAV.map(item)}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-[248px] shrink-0 sticky top-16 h-[calc(100dvh-4rem)] border-r border-beige px-3 py-5 overflow-y-auto scrollbar-none">
      <Link href="/create-listing" className="mb-5 flex items-center justify-center gap-2 h-11 rounded-xl border border-dashed border-sage bg-white text-forest font-display font-bold text-sm hover:bg-sage-soft transition-colors" data-testid="button-sidebar-create">
        <Plus className="w-4 h-4" /> Create Listing
      </Link>
      <NavList />
      <div className="mt-6 rounded-2xl bg-white border border-beige p-4">
        <div className="text-[13px] font-display font-bold">Give More. Waste Less.</div>
        <p className="text-[12.5px] text-grey mt-1">Every item reused here is one less bought new.</p>
      </div>
    </aside>
  );
}
