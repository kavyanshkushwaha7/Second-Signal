import { motion } from 'framer-motion';

export const C = {
  ivory: '#F8F7F2',
  forest: '#174C3C',
  forestDark: '#113A2E',
  sage: '#A8BDAA',
  sageSoft: '#E6EDE6',
  charcoal: '#252B27',
  grey: '#777D77',
  white: '#FFFFFF',
  beige: '#E9E7DF',
};

export const img = (name: string) => `${import.meta.env.BASE_URL}images/${name}.jpg`;

export const display = { fontFamily: "'Manrope', sans-serif", letterSpacing: '-0.035em' } as const;
export const body = { fontFamily: "'DM Sans', sans-serif" } as const;

export const ease = [0.2, 0.7, 0.2, 1] as const;
export const snap = [0.7, 0, 0.2, 1] as const;

export function LogoMark({ size, animate = true, delay = 0 }: { size: string; animate?: boolean; delay?: number }) {
  return (
    <svg viewBox="0 0 32 32" style={{ width: size, height: size }} aria-hidden>
      <rect width="32" height="32" rx="10" fill={C.forest} />
      <motion.circle cx="11" cy="21" r="2.6" fill={C.ivory}
        initial={animate ? { scale: 0 } : false} animate={{ scale: 1 }}
        transition={{ delay, type: 'spring', stiffness: 300, damping: 14 }} style={{ transformOrigin: '11px 21px' }} />
      <motion.path d="M11 14.5a6.5 6.5 0 0 1 6.5 6.5" stroke={C.sage} strokeWidth="2.4" fill="none" strokeLinecap="round"
        initial={animate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ delay: delay + 0.25, duration: 0.5, ease }} />
      <motion.path d="M11 8.5A12.5 12.5 0 0 1 23.5 21" stroke={C.ivory} strokeWidth="2.4" fill="none" strokeLinecap="round"
        initial={animate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ delay: delay + 0.5, duration: 0.6, ease }} />
    </svg>
  );
}

export function Wordmark({ size, light = false }: { size: string; light?: boolean }) {
  return (
    <span style={{ ...display, fontWeight: 800, fontSize: size, color: light ? C.ivory : C.charcoal }}>
      Second<span style={{ color: light ? C.sage : C.forest }}>Signal</span>
    </span>
  );
}

export function Grain() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{
      opacity: 0.07, mixBlendMode: 'multiply', zIndex: 40,
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    }} />
  );
}
