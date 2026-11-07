import {
  Home, Compass, ShoppingBag, Gift, Repeat, Tag, ArrowLeftRight, ListChecks, Users, MessageCircle,
  Inbox, Bookmark, UsersRound, UserRound, Settings, Sparkles, LayoutDashboard, Bell,
} from 'lucide-react';

export const NAV = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/buy', label: 'Buy from Friends', icon: ShoppingBag },
  { href: '/give-away', label: 'Give Away', icon: Gift },
  { href: '/borrow', label: 'Borrow', icon: Repeat },
  { href: '/sell', label: 'Sell', icon: Tag },
  { href: '/exchange', label: 'Exchange', icon: ArrowLeftRight },
  { href: '/want-list', label: 'Want List', icon: ListChecks },
  { href: '/friends', label: 'Friends', icon: Users },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: '/my-requests', label: 'My Requests', icon: Inbox },
  { href: '/saved', label: 'Saved Items', icon: Bookmark },
  { href: '/communities', label: 'Communities', icon: UsersRound },
  { href: '/profile', label: 'My Profile', icon: UserRound },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const EXTRA_NAV = [
  { href: '/matches', label: 'AI Matches', icon: Sparkles },
  { href: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export const isActive = (loc: string, href: string) =>
  loc === href || (href !== '/home' && loc.startsWith(href + '/')) || (href === '/home' && loc === '/') || (href === '/communities' && loc.startsWith('/community/'));
