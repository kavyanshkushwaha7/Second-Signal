import type { Listing } from '@/types';

export function actionFor(l: Pick<Listing, 'id' | 'type'>): { label: string; href: string } {
  switch (l.type) {
    case 'sell': return { label: 'Buy Now', href: `/request/${l.id}` };
    case 'borrow': return { label: 'Borrow Item', href: `/request/${l.id}` };
    case 'exchange': return { label: 'Exchange', href: `/request/${l.id}` };
    default: return { label: 'Request Item', href: `/request/${l.id}` };
  }
}
