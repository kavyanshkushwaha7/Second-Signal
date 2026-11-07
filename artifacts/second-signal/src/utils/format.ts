import { formatDistanceToNowStrict, format } from 'date-fns';
import type { ListingType, RequestStatus, RequestType } from '@/types';

export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const img = (p: string) => (p.startsWith('data:') || p.startsWith('http') ? p : `${BASE}${p}`);

export const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

export const timeAgo = (iso: string) => {
  try { return formatDistanceToNowStrict(new Date(iso), { addSuffix: true }); } catch { return ''; }
};
export const fmtDate = (iso?: string) => (iso ? format(new Date(iso), 'd MMM yyyy') : '');
export const fmtTime = (iso: string) => format(new Date(iso), 'h:mm a');

export const money = (n?: number) => (n == null ? '' : `₹${n.toLocaleString('en-IN')}`);

export const TYPE_LABEL: Record<ListingType, string> = {
  sell: 'For Sale', giveaway: 'Give Away', borrow: 'Borrow', exchange: 'Exchange',
};
export const REQ_LABEL: Record<RequestType, string> = {
  buy: 'Purchase', giveaway: 'Give Away', borrow: 'Borrow', exchange: 'Exchange',
};
export const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected', cancelled: 'Cancelled', completed: 'Completed',
};
export const requestTypeFor = (t: ListingType): RequestType => (t === 'sell' ? 'buy' : t);

export const priceLabel = (l: { type: ListingType; price?: number; deposit?: number }) => {
  if (l.type === 'sell') return money(l.price);
  if (l.type === 'giveaway') return 'Free';
  if (l.type === 'borrow') return l.deposit ? `${money(l.deposit)} deposit` : 'Free to borrow';
  return 'Swap';
};

export const CATEGORIES = [
  'Books & Notes', 'Electronics', 'Stationery & Tools', 'Furniture', 'Hostel Essentials',
  'Sports', 'Bikes & Transport', 'Event Supplies', 'Photography', 'Clothing',
];
export const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Well Used'] as const;
export const CAMPUSES = ['North Campus', 'South Campus', 'Riverside Hostels', 'Engineering Block'];

export const initials = (name: string) => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export async function fileToDataUrl(file: File, max = 900): Promise<string> {
  const raw = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  if (!file.type.startsWith('image/')) return raw;
  return new Promise((res) => {
    const im = new Image();
    im.onload = () => {
      const s = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = im.width * s; c.height = im.height * s;
      c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', 0.78));
    };
    im.onerror = () => res(raw);
    im.src = raw;
  });
}
