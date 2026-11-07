import { useRef, useState } from 'react';
import { useLocation, useParams, useSearch } from 'wouter';
import { ImagePlus, X, Eye, Sparkles, Gift, Repeat, Tag, ArrowLeftRight, PackageX } from 'lucide-react';
import type { Availability, Condition, ListingType } from '@/types';
import { useStore } from '@/context/AppStore';
import { Btn, Card, DemoNote, EmptyState, Field, Input, LinkBtn, Modal, PageHeader, Select, Textarea, TypeBadge } from '@/components/kit';
import { CAMPUSES, CATEGORIES, CONDITIONS, fileToDataUrl, img, priceLabel } from '@/utils/format';
import { improveDescription, inferCategory } from '@/utils/matching';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TYPES: { v: ListingType; label: string; icon: typeof Gift; text: string }[] = [
  { v: 'giveaway', label: 'Give Away', icon: Gift, text: 'Free to collect' },
  { v: 'borrow', label: 'Borrow', icon: Repeat, text: 'Lend for a period' },
  { v: 'sell', label: 'Sell', icon: Tag, text: 'Set a fair price' },
  { v: 'exchange', label: 'Exchange', icon: ArrowLeftRight, text: 'Swap for something' },
];

export default function CreateListing() {
  const params = useParams<{ id?: string }>();
  const search = useSearch();
  const { getListing, createListing, updateListing, me, currentUser, data } = useStore();
  const [, nav] = useLocation();
  const { toast } = useToast();
  const editing = params.id ? getListing(params.id) : undefined;
  const initType = (new URLSearchParams(search).get('type') as ListingType) || 'giveaway';
  const e0 = editing;
  const [form, setForm] = useState({
    title: e0?.title ?? '', description: e0?.description ?? '', images: e0?.images ?? [] as string[],
    category: e0?.category ?? '', quantity: String(e0?.quantity ?? 1), condition: (e0?.condition ?? 'Good') as Condition,
    campus: e0?.campus ?? currentUser.campus, location: e0?.location ?? '', availability: (e0?.availability ?? 'Available') as Availability,
    type: (e0?.type ?? (TYPES.some((t) => t.v === initType) ? initType : 'giveaway')) as ListingType,
    price: e0?.price != null ? String(e0.price) : '', borrowDuration: e0?.borrowDuration ?? '', returnConditions: e0?.returnConditions ?? '',
    deposit: e0?.deposit != null ? String(e0.deposit) : '', availableFrom: e0?.availableFrom ?? new Date().toISOString().slice(0, 10), availableTo: e0?.availableTo ?? '',
    desiredItem: e0?.desiredItem ?? '', pickupDetails: e0?.pickupDetails ?? '', communityId: e0?.communityId ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof typeof form, v: string | string[]) => setForm((f) => ({ ...f, [k]: v }));

  if (params.id && !editing) return <EmptyState icon={<PackageX className="w-6 h-6" />} title="Listing not found" text="Nothing to edit here." action={<LinkBtn href="/dashboard">Go to Dashboard</LinkBtn>} />;
  if (editing && editing.ownerId !== me) return <EmptyState icon={<PackageX className="w-6 h-6" />} title="Not your listing" text="Only the owner can edit this listing." action={<LinkBtn href={`/item/${editing.id}`}>View listing</LinkBtn>} />;

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all([...files].slice(0, 5 - form.images.length).filter((f) => f.type.startsWith('image/')).map((f) => fileToDataUrl(f)));
      set('images', [...form.images, ...urls]);
      setErrors((e) => ({ ...e, images: '' }));
    } catch {
      toast({ title: 'Could not read that image', description: 'Try a JPG or PNG under 10MB.' });
    } finally { setUploading(false); }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Give your item a name.';
    if (form.description.trim().length < 15) e.description = 'Describe it in at least 15 characters.';
    if (!form.images.length) e.images = 'Add at least one photo.';
    if (!form.category) e.category = 'Pick a category.';
    if (!Number(form.quantity) || Number(form.quantity) < 1) e.quantity = 'At least 1.';
    if (!form.location.trim()) e.location = 'Where can people find it?';
    if (form.type === 'sell' && (!form.price || Number(form.price) <= 0)) e.price = 'Enter a price above 0.';
    if (form.type === 'borrow') {
      if (!form.borrowDuration.trim()) e.borrowDuration = 'How long can people borrow it?';
      if (!form.returnConditions.trim()) e.returnConditions = 'Add return conditions.';
      if (form.availableTo && form.availableTo < form.availableFrom) e.availableTo = 'End must be after start.';
    }
    if (form.type === 'exchange' && !form.desiredItem.trim()) e.desiredItem = 'What do you want in return?';
    if (form.type === 'giveaway' && !form.pickupDetails.trim()) e.pickupDetails = 'Add pickup details.';
    setErrors(e);
    if (Object.keys(e).length) toast({ title: 'A few fields need attention', description: Object.values(e)[0] });
    return !Object.keys(e).length;
  };

  const payload = () => ({
    title: form.title.trim(), description: form.description.trim(), images: form.images, category: form.category, type: form.type,
    quantity: Number(form.quantity), condition: form.condition, campus: form.campus, location: form.location.trim(), availability: form.availability,
    price: form.type === 'sell' ? Number(form.price) : undefined,
    borrowDuration: form.type === 'borrow' ? form.borrowDuration : undefined, returnConditions: form.type === 'borrow' ? form.returnConditions : undefined,
    deposit: form.type === 'borrow' && form.deposit ? Number(form.deposit) : undefined,
    availableFrom: form.type === 'borrow' ? form.availableFrom : undefined, availableTo: form.type === 'borrow' ? form.availableTo || undefined : undefined,
    desiredItem: form.type === 'exchange' ? form.desiredItem : undefined, pickupDetails: form.type === 'giveaway' ? form.pickupDetails : undefined,
    communityId: form.communityId || undefined,
  });

  const publish = () => {
    if (!validate()) return;
    setPublishing(true);
    setTimeout(() => {
      try {
        if (editing) { updateListing(editing.id, payload()); toast({ title: 'Listing updated' }); nav(`/item/${editing.id}`); }
        else { const id = createListing(payload()); toast({ title: 'Listing published', description: 'Neighbours can now find it.' }); nav(`/item/${id}`); }
      } catch { toast({ title: 'Could not save', description: 'Browser storage may be full. Try fewer or smaller photos.' }); }
      setPublishing(false);
    }, 450);
  };

  const err = (k: string) => errors[k] || undefined;
  const p = payload();

  return (
    <div className="max-w-4xl">
      <PageHeader eyebrow={editing ? 'Edit' : 'New listing'} title={editing ? 'Edit Listing' : 'Create Listing'} description="One form for everything you want to pass on. Fields adapt to the listing type." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {TYPES.map((t) => (
          <button key={t.v} type="button" onClick={() => set('type', t.v)} data-testid={`button-type-${t.v}`}
            className={cn('text-left rounded-2xl border p-4 transition-all', form.type === t.v ? 'border-forest bg-white ring-4 ring-sage/25' : 'border-beige bg-white/60 hover:border-sage')}>
            <t.icon className={cn('w-5 h-5', form.type === t.v ? 'text-forest' : 'text-grey')} />
            <div className="font-display font-bold mt-2">{t.label}</div>
            <div className="text-[12.5px] text-grey">{t.text}</div>
          </button>
        ))}
      </div>

      <Card className="p-5 sm:p-7 space-y-5">
        <Field label="Item photos" required error={err('images')} hint="Up to 5 photos. Stored in this browser only.">
          <div className="flex flex-wrap gap-3">
            {form.images.map((src, i) => (
              <div key={i} className="relative w-28 h-24 rounded-xl overflow-hidden border border-beige group">
                <img src={img(src)} alt="" className="w-full h-full object-cover" />
                {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-white/90 rounded px-1.5 font-semibold">Cover</span>}
                <button type="button" onClick={(e) => { e.preventDefault(); set('images', form.images.filter((_, j) => j !== i)); }} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/95 flex items-center justify-center opacity-90 hover:opacity-100" aria-label="Remove photo" data-testid={`button-remove-image-${i}`}><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {form.images.length < 5 && (
              <button type="button" onClick={(e) => { e.preventDefault(); fileRef.current?.click(); }} className={cn('w-28 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-[12px] font-semibold transition', errors.images ? 'border-[#c98a7f] text-[#9A3B2E]' : 'border-sage text-forest hover:bg-sage-soft')} data-testid="button-upload-image">
                <ImagePlus className="w-5 h-5" />{uploading ? 'Reading...' : 'Add photo'}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} data-testid="input-file" />
        </Field>

        <Field label="Item name" required error={err('title')}>
          <Input value={form.title} onChange={(e) => set('title', e.target.value)} onBlur={() => !form.category && inferCategory(form.title) && set('category', inferCategory(form.title)!)} placeholder="e.g. Casio fx-991EX calculator" invalid={!!errors.title} data-testid="input-title" />
        </Field>
        <Field label="Description" required error={err('description')}>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Condition details, what is included, why you are passing it on." invalid={!!errors.description} data-testid="input-description" />
          <button type="button" onClick={(e) => { e.preventDefault(); set('description', improveDescription(form.title, form.description, form.condition, form.category)); }} className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-forest hover:underline" data-testid="button-improve-description">
            <Sparkles className="w-3.5 h-3.5" />Improve description (mock assistant, rule-based)
          </button>
        </Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Category" required error={err('category')} hint={!form.category && form.title && inferCategory(form.title) ? `Suggested: ${inferCategory(form.title)}` : undefined}>
            <Select value={form.category} onChange={(e) => set('category', e.target.value)} data-testid="select-listing-category">
              <option value="">Choose...</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Quantity" required error={err('quantity')}><Input type="number" min={1} value={form.quantity} onChange={(e) => set('quantity', e.target.value)} data-testid="input-quantity" /></Field>
          <Field label="Condition" required>
            <Select value={form.condition} onChange={(e) => set('condition', e.target.value)} data-testid="select-listing-condition">{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</Select>
          </Field>
          <Field label="Campus" required>
            <Select value={form.campus} onChange={(e) => set('campus', e.target.value)} data-testid="select-listing-campus">{CAMPUSES.map((c) => <option key={c}>{c}</option>)}</Select>
          </Field>
          <Field label="Location / meeting point" required error={err('location')}><Input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Library steps" data-testid="input-location" /></Field>
          <Field label="Availability" required>
            <Select value={form.availability} onChange={(e) => set('availability', e.target.value)} data-testid="select-listing-availability"><option>Available</option><option>Reserved</option><option>Unavailable</option></Select>
          </Field>
        </div>

        <div className="rounded-2xl bg-ivory border border-beige p-4 sm:p-5 space-y-4 page-enter" key={form.type}>
          <div className="text-[12px] uppercase tracking-[0.12em] font-bold text-forest">{TYPES.find((t) => t.v === form.type)?.label} details</div>
          {form.type === 'sell' && <Field label="Price (₹)" required error={err('price')}><Input type="number" min={1} value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="450" data-testid="input-price" /></Field>}
          {form.type === 'borrow' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Borrowing duration" required error={err('borrowDuration')}><Input value={form.borrowDuration} onChange={(e) => set('borrowDuration', e.target.value)} placeholder="Up to 2 weeks" data-testid="input-borrow-duration" /></Field>
              <Field label="Deposit (₹, optional)"><Input type="number" min={0} value={form.deposit} onChange={(e) => set('deposit', e.target.value)} placeholder="0" data-testid="input-deposit" /></Field>
              <Field label="Available from"><Input type="date" value={form.availableFrom} onChange={(e) => set('availableFrom', e.target.value)} data-testid="input-available-from" /></Field>
              <Field label="Available until" error={err('availableTo')}><Input type="date" value={form.availableTo} onChange={(e) => set('availableTo', e.target.value)} data-testid="input-available-to" /></Field>
              <Field label="Return conditions" required error={err('returnConditions')} className="sm:col-span-2"><Textarea value={form.returnConditions} onChange={(e) => set('returnConditions', e.target.value)} placeholder="Return clean, with the charger." className="min-h-[70px]" data-testid="input-return-conditions" /></Field>
            </div>
          )}
          {form.type === 'exchange' && <Field label="Desired item" required error={err('desiredItem')}><Input value={form.desiredItem} onChange={(e) => set('desiredItem', e.target.value)} placeholder="A wireless mouse" data-testid="input-desired-item" /></Field>}
          {form.type === 'giveaway' && <Field label="Pickup details" required error={err('pickupDetails')}><Textarea value={form.pickupDetails} onChange={(e) => set('pickupDetails', e.target.value)} placeholder="Weekdays after 5pm at Hostel 2 reception" className="min-h-[70px]" data-testid="input-pickup" /></Field>}
        </div>

        <Field label="Share to a community (optional)">
          <Select value={form.communityId} onChange={(e) => set('communityId', e.target.value)} data-testid="select-listing-community">
            <option value="">None</option>
            {data.communities.filter((c) => c.memberIds.includes(me)).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>

        <DemoNote>Listings are saved to this browser only (local demo mode). Photos are compressed and stored locally.</DemoNote>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Btn variant="secondary" size="lg" onClick={() => history.back()} data-testid="button-cancel-listing">Cancel</Btn>
          <Btn variant="secondary" size="lg" onClick={() => setPreview(true)} data-testid="button-preview-listing"><Eye className="w-4 h-4" />Preview Listing</Btn>
          <Btn size="lg" onClick={publish} disabled={publishing || uploading} data-testid="button-publish-listing">{publishing ? 'Saving...' : editing ? 'Save Changes' : 'Publish Listing'}</Btn>
        </div>
      </Card>

      <Modal open={preview} onOpenChange={setPreview} title="Listing preview" description="This is how neighbours will see your card." wide>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-2xl overflow-hidden border border-beige bg-[#F1EFE8] aspect-[4/3]">
            {p.images[0] ? <img src={img(p.images[0])} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-grey text-sm">No photo yet</div>}
          </div>
          <div>
            <TypeBadge type={p.type} />
            <h3 className="font-display font-extrabold text-xl mt-2">{p.title || 'Untitled item'}</h3>
            <div className="text-forest font-display font-extrabold mt-1">{priceLabel(p)}</div>
            <p className="text-sm text-charcoal/80 mt-2 line-clamp-5">{p.description || 'No description yet.'}</p>
            <div className="text-[12.5px] text-grey mt-3">{p.category || 'No category'} · {p.condition} · Qty {p.quantity || 0} · {p.campus}</div>
            {p.desiredItem && <div className="text-[13px] mt-2">Wants: {p.desiredItem}</div>}
            {p.pickupDetails && <div className="text-[13px] mt-2">Pickup: {p.pickupDetails}</div>}
            {p.borrowDuration && <div className="text-[13px] mt-2">Borrow for {p.borrowDuration}</div>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Btn variant="secondary" onClick={() => setPreview(false)}>Keep editing</Btn>
          <Btn onClick={() => { setPreview(false); publish(); }} data-testid="button-preview-publish">{editing ? 'Save Changes' : 'Publish Listing'}</Btn>
        </div>
      </Modal>
    </div>
  );
}
