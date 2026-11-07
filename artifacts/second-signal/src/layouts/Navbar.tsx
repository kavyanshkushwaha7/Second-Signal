import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Bell, Compass, MessageCircle, Plus, LogOut, UserRound, Settings, LayoutDashboard, Repeat2 } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/context/AppStore';
import { Avatar, LinkBtn, SearchBar } from '@/components/kit';
import { Logo } from '@/layouts/Logo';
import { cn } from '@/lib/utils';

function IconLink({ href, label, count, children, active }: { href: string; label: string; count?: number; children: React.ReactNode; active?: boolean }) {
  return (
    <Link href={href} aria-label={label} data-testid={`link-nav-${label.toLowerCase()}`} className={cn('relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors', active ? 'bg-sage-soft text-forest' : 'text-charcoal hover:bg-white')}>
      {children}
      {!!count && <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-forest text-white text-[10.5px] font-bold flex items-center justify-center ring-2 ring-ivory">{count > 9 ? '9+' : count}</span>}
    </Link>
  );
}

export function Navbar() {
  const { currentUser, unreadNotifications, unreadMessages, data, switchUser, logout } = useStore();
  const [loc, nav] = useLocation();
  const [q, setQ] = useState('');
  return (
    <header className="sticky top-0 z-40 bg-ivory/90 backdrop-blur-md border-b border-beige">
      <div className="h-16 px-4 lg:px-6 flex items-center gap-3 lg:gap-6">
        <Logo />
        <SearchBar value={q} onChange={setQ} placeholder="Search calculators, bikes, books..." className="hidden md:block flex-1 max-w-xl" onSubmit={() => { nav(`/explore?q=${encodeURIComponent(q)}`); }} testId="input-global-search" />
        <div className="ml-auto flex items-center gap-1">
          <Link href="/explore" className={cn('hidden lg:flex items-center gap-1.5 h-10 px-3 rounded-xl text-sm font-display font-semibold', loc.startsWith('/explore') ? 'bg-sage-soft text-forest' : 'hover:bg-white')} data-testid="link-nav-explore">
            <Compass className="w-4 h-4" /> Explore
          </Link>
          <span className="lg:hidden"><IconLink href="/explore" label="Explore" active={loc.startsWith('/explore')}><Compass className="w-5 h-5" /></IconLink></span>
          <IconLink href="/notifications" label="Notifications" count={unreadNotifications} active={loc === '/notifications'}><Bell className="w-5 h-5" /></IconLink>
          <IconLink href="/messages" label="Messages" count={unreadMessages} active={loc.startsWith('/messages')}><MessageCircle className="w-5 h-5" /></IconLink>
          <LinkBtn href="/create-listing" size="sm" className="hidden sm:inline-flex ml-2 h-9" data-testid="button-nav-create"><Plus className="w-4 h-4" /> List an item</LinkBtn>
          <DropdownMenu>
            <DropdownMenuTrigger className="ml-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sage" data-testid="button-user-menu">
              <Avatar user={currentUser} size={36} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl border-beige bg-white p-1.5">
              <DropdownMenuLabel className="flex items-center gap-3 py-2">
                <Avatar user={currentUser} size={36} />
                <div className="min-w-0"><div className="font-display font-bold truncate">{currentUser.name}</div><div className="text-xs text-grey font-normal">@{currentUser.username}</div></div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-beige" />
              <DropdownMenuItem onClick={() => nav('/profile')} className="rounded-lg" data-testid="menu-profile"><UserRound className="w-4 h-4 mr-2" />My Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => nav('/dashboard')} className="rounded-lg" data-testid="menu-dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</DropdownMenuItem>
              <DropdownMenuItem onClick={() => nav('/settings')} className="rounded-lg" data-testid="menu-settings"><Settings className="w-4 h-4 mr-2" />Settings</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-beige" />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-lg" data-testid="menu-switch-account"><Repeat2 className="w-4 h-4 mr-2" />Switch demo account</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="rounded-xl border-beige bg-white w-60 p-1.5">
                  <DropdownMenuLabel className="text-[11px] text-grey font-normal">Test both sides of a request locally</DropdownMenuLabel>
                  {data.users.map((u) => (
                    <DropdownMenuItem key={u.id} onClick={() => switchUser(u.id)} className={cn('rounded-lg gap-2', u.id === currentUser.id && 'bg-sage-soft')} data-testid={`menu-switch-${u.id}`}>
                      <Avatar user={u} size={22} /> {u.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={logout} className="rounded-lg" data-testid="menu-logout"><LogOut className="w-4 h-4 mr-2" />Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
