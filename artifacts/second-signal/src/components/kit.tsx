import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Link } from 'wouter';
import { Search, Star, X } from 'lucide-react';
import * as D from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import type { ListingType, RequestStatus, User } from '@/types';
import { TYPE_LABEL, STATUS_LABEL, initials, img } from '@/utils/format';

/* ---------- Button ---------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'sage';
const vClass: Record<Variant, string> = {
  primary: 'bg-forest text-white hover:bg-forest-dark shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_6px_14px_-8px_rgba(23,76,60,0.6)]',
  secondary: 'bg-white text-charcoal border border-beige hover:border-sage hover:bg-ivory',
  ghost: 'text-charcoal hover:bg-sage-soft',
  danger: 'bg-white text-[#9A3B2E] border border-beige hover:border-[#d9b4ad] hover:bg-[#fbf3f1]',
  sage: 'bg-sage-soft text-forest hover:bg-sage/40',
};
const sClass = { sm: 'h-8 px-3 text-[13px] gap-1.5', md: 'h-10 px-4 text-sm gap-2', lg: 'h-12 px-6 text-[15px] gap-2' };

export interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: keyof typeof sClass }
export const Btn = forwardRef<HTMLButtonElement, BtnProps>(({ variant = 'primary', size = 'md', className, ...p }, ref) => (
  <button
    ref={ref}
    {...p}
    className={cn(
      'inline-flex items-center justify-center rounded-xl font-display font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.97] disabled:opacity-45 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-ivory',
      vClass[variant], sClass[size], className,
    )}
  />
));
Btn.displayName = 'Btn';

export function LinkBtn({ href, variant = 'primary', size = 'md', className, children, ...rest }: { href: string; variant?: Variant; size?: keyof typeof sClass; className?: string; children: ReactNode; 'data-testid'?: string }) {
  return (
    <Link href={href} {...rest} className={cn('inline-flex items-center justify-center rounded-xl font-display font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.97]', vClass[variant], sClass[size], className)}>
      {children}
    </Link>
  );
}

/* ---------- Card ---------- */
export function Card({ className, children, ...p }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div {...p} className={cn('bg-white border border-beige rounded-2xl shadow-[0_1px_2px_rgba(37,43,39,0.04)]', className)}>{children}</div>;
}

/* ---------- Badges ---------- */
export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'sage' | 'forest' | 'outline' | 'muted' | 'danger'; className?: string }) {
  const t = {
    neutral: 'bg-ivory text-charcoal border border-beige',
    sage: 'bg-sage-soft text-forest',
    forest: 'bg-forest text-white',
    outline: 'border border-sage text-forest bg-white',
    muted: 'bg-[#F1EFE8] text-grey',
    danger: 'bg-[#fbf3f1] text-[#9A3B2E] border border-[#efd9d4]',
  }[tone];
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold font-display tracking-wide', t, className)}>{children}</span>;
}

export function TypeBadge({ type, className }: { type: ListingType; className?: string }) {
  const tone = type === 'giveaway' ? 'forest' : type === 'sell' ? 'neutral' : type === 'borrow' ? 'sage' : 'outline';
  return <Badge tone={tone} className={className}>{TYPE_LABEL[type]}</Badge>;
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const tone = status === 'pending' ? 'outline' : status === 'accepted' ? 'sage' : status === 'completed' ? 'forest' : status === 'rejected' ? 'danger' : 'muted';
  return <Badge tone={tone}>{STATUS_LABEL[status]}</Badge>;
}

/* ---------- Avatar ---------- */
export function Avatar({ user, size = 40, ring, className, showOnline }: { user?: User; size?: number; ring?: boolean; className?: string; showOnline?: boolean }) {
  const shade = user ? 28 + (user.hue % 5) * 4 : 30;
  return (
    <span className={cn('relative inline-flex shrink-0', className)} style={{ width: size, height: size }}>
      {user?.avatar ? (
        <img src={img(user.avatar)} alt={user.name} className={cn('rounded-full object-cover w-full h-full', ring && 'ring-2 ring-white')} />
      ) : (
        <span
          className={cn('rounded-full w-full h-full inline-flex items-center justify-center font-display font-bold text-forest', ring && 'ring-2 ring-white')}
          style={{ background: `hsl(128 ${14 + (user?.hue ?? 0) % 10}% ${68 + (shade % 20)}%)`, fontSize: size * 0.36 }}
        >
          {user ? initials(user.name) : '?'}
        </span>
      )}
      {showOnline && user?.online && <span className="absolute bottom-0 right-0 w-[28%] h-[28%] min-w-2.5 min-h-2.5 rounded-full bg-forest ring-2 ring-white" />}
    </span>
  );
}

/* ---------- Inputs ---------- */
const fieldBase = 'w-full rounded-xl border border-beige bg-white px-3.5 text-[14px] text-charcoal placeholder:text-grey/70 transition focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/25';
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(({ className, invalid, ...p }, ref) => (
  <input ref={ref} {...p} className={cn(fieldBase, 'h-11', invalid && 'border-[#c98a7f]', className)} />
));
Input.displayName = 'Input';
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(({ className, invalid, ...p }, ref) => (
  <textarea ref={ref} {...p} className={cn(fieldBase, 'py-3 min-h-[96px] resize-y', invalid && 'border-[#c98a7f]', className)} />
));
Textarea.displayName = 'Textarea';
export function Select({ className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...p} className={cn(fieldBase, 'h-11 appearance-none pr-9 bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27%3E%3Cpath d=%27M1 1l5 5 5-5%27 stroke=%27%23777D77%27 stroke-width=%271.6%27 fill=%27none%27/%3E%3C/svg%3E")] bg-no-repeat bg-[right_14px_center]', className)}>
      {children}
    </select>
  );
}

export function Field({ label, required, error, hint, children, className }: { label: string; required?: boolean; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="block text-[13px] font-display font-semibold text-charcoal mb-1.5">{label}{required && <span className="text-forest ml-0.5">*</span>}</span>
      {children}
      {error ? <span className="block mt-1.5 text-[12.5px] text-[#9A3B2E]">{error}</span> : hint ? <span className="block mt-1.5 text-[12.5px] text-grey">{hint}</span> : null}
    </label>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search', className, onSubmit, testId = 'input-search' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; onSubmit?: () => void; testId?: string }) {
  return (
    <form className={cn('relative', className)} onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-grey" />
      <input
        type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} data-testid={testId}
        className="w-full h-11 rounded-xl border border-beige bg-white pl-10 pr-9 text-[14px] placeholder:text-grey/80 focus:outline-none focus:border-sage focus:ring-4 focus:ring-sage/25 transition"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-grey hover:text-charcoal" aria-label="Clear search">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </form>
  );
}

/* ---------- Tabs / chips ---------- */
export function Tabs<T extends string>({ tabs, value, onChange, className }: { tabs: { value: string; label: string; count?: number }[]; value: T; onChange: (v: never) => void; className?: string }) {
  const emit = onChange as (v: T) => void;
  return (
    <div className={cn('flex gap-1 overflow-x-auto scrollbar-none border-b border-beige', className)}>
      {tabs.map((t) => (
        <button
          key={t.value} onClick={() => emit(t.value as T)} data-testid={`tab-${t.value}`}
          className={cn('relative px-3.5 py-2.5 text-sm font-display font-semibold whitespace-nowrap transition-colors', value === t.value ? 'text-forest' : 'text-grey hover:text-charcoal')}
        >
          {t.label}
          {t.count != null && <span className={cn('ml-1.5 text-[11px] rounded-full px-1.5 py-0.5', value === t.value ? 'bg-sage-soft' : 'bg-[#F1EFE8]')}>{t.count}</span>}
          {value === t.value && <span className="absolute left-2 right-2 -bottom-px h-[2.5px] rounded-full bg-forest" />}
        </button>
      ))}
    </div>
  );
}

export function Chips<T extends string>({ items, value, onChange, className }: { items: { value: string; label: string }[]; value: T; onChange: (v: never) => void; className?: string }) {
  const emit = onChange as (v: T) => void;
  return (
    <div className={cn('flex gap-2 overflow-x-auto scrollbar-none pb-1', className)}>
      {items.map((i) => (
        <button
          key={i.value} onClick={() => emit(i.value as T)} data-testid={`chip-${i.value}`}
          className={cn('h-9 px-4 rounded-full text-[13px] font-display font-semibold whitespace-nowrap border transition-all',
            value === i.value ? 'bg-forest text-white border-forest' : 'bg-white text-charcoal border-beige hover:border-sage')}
        >{i.label}</button>
      ))}
    </div>
  );
}

/* ---------- Page header ---------- */
export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        {eyebrow && <div className="text-[11.5px] font-display font-bold uppercase tracking-[0.14em] text-forest/80 mb-1.5">{eyebrow}</div>}
        <h1 className="text-[28px] sm:text-[32px] font-extrabold text-charcoal leading-tight">{title}</h1>
        {description && <p className="text-grey mt-1.5 max-w-2xl text-[15px]">{description}</p>}
      </div>
      {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

/* ---------- Empty / skeleton ---------- */
export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6 rounded-2xl border border-dashed border-beige bg-white/60">
      <div className="relative mb-4">
        <span className="absolute inset-0 rounded-full bg-sage/30 signal-dot" />
        <div className="relative w-14 h-14 rounded-full bg-sage-soft text-forest flex items-center justify-center">{icon}</div>
      </div>
      <h3 className="font-bold text-lg text-charcoal">{title}</h3>
      <p className="text-grey text-sm mt-1 max-w-sm">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SkeletonGrid({ n = 6 }: { n?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-beige bg-white overflow-hidden">
          <div className="aspect-[4/3] bg-[#F1EFE8] animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/4 bg-[#F1EFE8] rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-[#F1EFE8] rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Stars ---------- */
export function Stars({ value, onChange, size = 16 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" disabled={!onChange} onClick={() => onChange?.(i)} className={cn(onChange && 'hover:scale-110 transition')} aria-label={`${i} stars`} data-testid={onChange ? `button-star-${i}` : undefined}>
          <Star style={{ width: size, height: size }} className={i <= value ? 'fill-forest text-forest' : 'text-beige fill-beige'} />
        </button>
      ))}
    </span>
  );
}

/* ---------- Modal ---------- */
export function Modal({ open, onOpenChange, title, description, children, wide }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-charcoal/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <D.Content className={cn('fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-24px)] max-h-[88dvh] overflow-y-auto bg-white rounded-2xl border border-beige shadow-xl p-6 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95', wide ? 'max-w-2xl' : 'max-w-md')}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <D.Title className="text-lg font-bold font-display">{title}</D.Title>
              {description ? <D.Description className="text-sm text-grey mt-1">{description}</D.Description> : <D.Description className="sr-only">{title}</D.Description>}
            </div>
            <D.Close className="p-1.5 rounded-lg text-grey hover:bg-ivory hover:text-charcoal" aria-label="Close"><X className="w-4 h-4" /></D.Close>
          </div>
          {children}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}

export function ConfirmModal({ open, onOpenChange, title, text, confirmLabel = 'Confirm', danger, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; text: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} description={text}>
      <div className="flex justify-end gap-2 mt-2">
        <Btn variant="secondary" onClick={() => onOpenChange(false)} data-testid="button-cancel-confirm">Cancel</Btn>
        <Btn variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onOpenChange(false); }} data-testid="button-confirm">{confirmLabel}</Btn>
      </div>
    </Modal>
  );
}

export function DemoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start gap-2 rounded-xl bg-sage-soft/70 border border-sage/40 px-3 py-2 text-[12.5px] text-forest', className)}>
      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-forest shrink-0" />
      <span>{children}</span>
    </div>
  );
}
