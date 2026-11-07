import { Link } from 'wouter';

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="10" fill="#174C3C" />
      <circle cx="11" cy="21" r="2.6" fill="#F8F7F2" />
      <path d="M11 14.5a6.5 6.5 0 0 1 6.5 6.5" stroke="#A8BDAA" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M11 8.5A12.5 12.5 0 0 1 23.5 21" stroke="#F8F7F2" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link href="/home" className="flex items-center gap-2.5 shrink-0" data-testid="link-logo">
      <LogoMark />
      {!compact && <span className="font-display font-extrabold text-[18px] tracking-tight text-charcoal">Second<span className="text-forest">Signal</span></span>}
    </Link>
  );
}
