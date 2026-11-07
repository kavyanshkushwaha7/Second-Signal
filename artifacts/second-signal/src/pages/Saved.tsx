import { Link } from 'wouter';
import { Bookmark, Trash2 } from 'lucide-react';
import { useStore } from '@/context/AppStore';
import { Avatar, Btn, Card, EmptyState, LinkBtn, PageHeader, TypeBadge } from '@/components/kit';
import { img, priceLabel } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';

export default function Saved() {
  const { savedIds, getListing, getUser, toggleSave } = useStore();
  const { toast } = useToast();
  const items = savedIds.map((id) => getListing(id)).filter((l): l is NonNullable<typeof l> => !!l);
  return (
    <div>
      <PageHeader eyebrow="Bookmarks" title="Saved Items" description="Things you are keeping an eye on. Saved in this browser, so they survive a refresh." />
      {items.length === 0 ? <EmptyState icon={<Bookmark className="w-6 h-6" />} title="Nothing saved yet" text="Tap the bookmark on any listing to keep it here." action={<LinkBtn href="/explore">Explore items</LinkBtn>} /> : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((l, i) => { const o = getUser(l.ownerId); return (
            <Card key={l.id} className="overflow-hidden rise flex flex-col" style={{ animationDelay: `${i * 40}ms` }} data-testid={`card-saved-${l.id}`}>
              <Link href={`/item/${l.id}`} className="relative aspect-[16/10] block bg-[#F1EFE8]"><img src={img(l.images[0] ?? '')} alt="" className="w-full h-full object-cover" /><TypeBadge type={l.type} className="absolute top-3 left-3" /></Link>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between gap-2"><Link href={`/item/${l.id}`} className="font-display font-bold hover:text-forest">{l.title}</Link><span className="font-display font-extrabold text-forest whitespace-nowrap">{priceLabel(l)}</span></div>
                <Link href={`/profile/${o?.id}`} className="flex items-center gap-2 mt-2 text-[13px] hover:text-forest"><Avatar user={o} size={22} />{o?.name} · {l.campus}</Link>
                <div className="mt-auto pt-4 flex gap-2">
                  <LinkBtn href={`/item/${l.id}`} size="sm" className="flex-1">View Details</LinkBtn>
                  <Btn size="sm" variant="secondary" onClick={() => { toggleSave(l.id); toast({ title: 'Removed from saved' }); }} data-testid={`button-unsave-${l.id}`}><Trash2 className="w-3.5 h-3.5" />Remove</Btn>
                </div>
              </div>
            </Card>
          ); })}
        </div>
      )}
    </div>
  );
}
