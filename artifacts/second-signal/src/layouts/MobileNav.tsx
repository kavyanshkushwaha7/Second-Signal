import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Compass, Plus, MessageCircle, Menu, X } from 'lucide-react';
import { useStore } from '@/context/AppStore';
import { NavList } from '@/layouts/Sidebar';
import { Logo } from '@/layouts/Logo';
import { isActive } from '@/layouts/nav';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [loc] = useLocation();
  const [open, setOpen] = useState(false);
  const { unreadMessages } = useStore();
  const tab = (href: string, label: string, Icon: typeof Home, badge?: number) => (
    <Link href={href} data-testid={`link-mobile-${label.toLowerCase()}`} className={cn('flex-1 flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-display font-semibold relative', isActive(loc, href) ? 'text-forest' : 'text-grey')}>
      <Icon className="w-5 h-5" />
      {label}
      {!!badge && <span className="absolute top-1 right-[calc(50%-18px)] w-2 h-2 rounded-full bg-forest" />}
    </Link>
  );
  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-beige flex items-end px-2 pb-[env(safe-area-inset-bottom)]">
        {tab('/home', 'Home', Home)}
        {tab('/explore', 'Explore', Compass)}
        <Link href="/create-listing" className="flex-1 flex justify-center -mt-5" data-testid="link-mobile-create" aria-label="Create listing">
          <span className="w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-forest text-white flex items-center justify-center shadow-lg ring-4 ring-ivory"><Plus className="w-6 h-6" /></span>
        </Link>
        {tab('/messages', 'Messages', MessageCircle, unreadMessages)}
        <button onClick={() => setOpen(true)} className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[10.5px] font-display font-semibold text-grey" data-testid="button-mobile-menu">
          <Menu className="w-5 h-5" /> Menu
        </button>
      </nav>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-charcoal/30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[82%] max-w-xs bg-ivory border-l border-beige p-4 overflow-y-auto page-enter">
            <div className="flex items-center justify-between mb-5">
              <Logo />
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white" aria-label="Close menu" data-testid="button-close-menu"><X className="w-5 h-5" /></button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
