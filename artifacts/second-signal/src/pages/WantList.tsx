import { useMemo, useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { Plus, HandHeart, CalendarClock, MapPin, Sparkles, Check, Trash2, ListChecks } from 'lucide-react';
import type { Want } from '@/types';
import { useStore } from '@/context/AppStore';
import { Avatar, Badge, Btn, Card, Chips, ConfirmModal, EmptyState, Field, Input, Modal, PageHeader, SearchBar, Select, Textarea } from '@/components/kit';
import { CAMPUSES, CATEGORIES, fmtDate, timeAgo } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';

function WantForm({ onDone }: { onDone: () => void }) {
  const { createWant, currentUser } = useStore();
  const { toast } = useToast();
  const [f, setF] = useState({ title: '', description: '', category: '', quantity: '1', condition: 'Any', neededBy: '', campus: currentUser.campus });
  const [e, setE] = useState<Record<string, string>>({});
  const submit = () => {
    const er: Record<string, string> = {};
    if (!f.title.trim()) er.title = 'What do you need?';
    if (!f.description.trim()) er.description = 'Add a little context.';
    if (!f.category) er.category = 'Pick a category.';
    if (!f.neededBy) er.neededBy = 'When do you need it by?';
    setE(er);
    if (Object.keys(er).length) return;
    createWant({ ...f, quantity: Number(f.quantity) || 1 });
    toast({ title: 'Posted to the Want List' });
    onDone();
  };
  return (
    <div className="space-y-3.5">
      <Field label="Required item" required error={e.title}><Input value={f.title} onChange={(x) => setF({ ...f, title: x.target.value })} placeholder="Scientific calculator" data-testid="input-want-title" /></Field>
      <Field label="Description" required error={e.description}><Textarea value={f.description} onChange={(x) => setF({ ...f, description: x.target.value })} placeholder="I need a scientific calculator for two weeks for my exams." data-testid="input-want-description" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category" required error={e.category}><Select value={f.category} onChange={(x) => setF({ ...f, category: x.target.value })} data-testid="select-want-category"><option value="">Choose...</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Quantity"><Input type="number" min={1} value={f.quantity} onChange={(x) => setF({ ...f, quantity: x.target.value })} data-testid="input-want-quantity" /></Field>
        <Field label="Preferred condition"><Select value={f.condition} onChange={(x) => setF({ ...f, condition: x.target.value })} data-testid="select-want-condition">{['Any', 'Like New', 'Good', 'Fair'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Needed by" required error={e.neededBy}><Input type="date" value={f.neededBy} onChange={(x) => setF({ ...f, neededBy: x.target.value })} data-testid="input-want-date" /></Field>
        <Field label="Campus" className="col-span-2"><Select value={f.campus} onChange={(x) => setF({ ...f, campus: x.target.value })}>{CAMPUSES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
      </div>
      <Btn className="w-full" onClick={submit} data-testid="button-submit-want">Post request</Btn>
    </div>
  );
}

function FulfilModal({ want, onClose }: { want: Want | null; onClose: () => void }) {
  const { data, me, respondWant } = useStore();
  const { toast } = useToast();
  const [msg, setMsg] = useState('');
  const [listingId, setListingId] = useState('');
  const mine = data.listings.filter((l) => l.ownerId === me && l.availability !== 'Unavailable');
  return (
    <Modal open={!!want} onOpenChange={(o) => !o && onClose()} title="Fulfil this request" description={want ? `Respond to "${want.title}"` : ''}>
      <div className="space-y-3.5">
        <Field label="Attach one of your listings (optional)">
          <Select value={listingId} onChange={(e) => setListingId(e.target.value)} data-testid="select-fulfil-listing">
            <option value="">No listing, just a message</option>
            {mine.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
          </Select>
        </Field>
        <Field label="Message" required><Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="I have one you can borrow, pick up anytime this week." data-testid="input-fulfil-message" /></Field>
        <Btn className="w-full" disabled={!msg.trim()} onClick={() => { if (want) { respondWant(want.id, msg.trim(), listingId || undefined); toast({ title: 'Response sent', description: 'They will be notified.' }); setMsg(''); setListingId(''); onClose(); } }} data-testid="button-send-fulfil">Send response</Btn>
      </div>
    </Modal>
  );
}

export default function WantList() {
  const { data, me, getUser, getListing, updateWant, deleteWant } = useStore();
  const search = useSearch();
  const [, nav] = useLocation();
  const [open, setOpen] = useState(new URLSearchParams(search).get('new') === '1');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [campus, setCampus] = useState('all');
  const [scope, setScope] = useState<'open' | 'mine' | 'fulfilled'>('open');
  const [fulfil, setFulfil] = useState<Want | null>(null);
  const [del, setDel] = useState<Want | null>(null);

  const list = useMemo(() => data.wants
    .filter((w) => (scope === 'mine' ? w.userId === me : scope === 'open' ? w.status === 'open' : w.status === 'fulfilled'))
    .filter((w) => cat === 'all' || w.category === cat)
    .filter((w) => campus === 'all' || w.campus === campus)
    .filter((w) => !q || `${w.title} ${w.description}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [data.wants, scope, cat, campus, q, me]);

  return (
    <div>
      <PageHeader eyebrow="Requests from neighbours" title="Want List" description="Post what you need but cannot find. If someone has it, they respond directly." actions={<Btn onClick={() => setOpen(true)} data-testid="button-new-want"><Plus className="w-4 h-4" />Post a need</Btn>} />
      <Chips items={[{ value: 'open', label: 'Open requests' }, { value: 'mine', label: 'My posts' }, { value: 'fulfilled', label: 'Fulfilled' }]} value={scope} onChange={setScope} className="mb-4" />
      <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
        <SearchBar value={q} onChange={setQ} placeholder="Search needs" className="flex-1" />
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="sm:w-52" data-testid="select-want-filter-category"><option value="all">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
        <Select value={campus} onChange={(e) => setCampus(e.target.value)} className="sm:w-48" data-testid="select-want-filter-campus"><option value="all">All campuses</option>{CAMPUSES.map((c) => <option key={c}>{c}</option>)}</Select>
      </div>
      {list.length === 0 ? <EmptyState icon={<ListChecks className="w-6 h-6" />} title="No needs here" text="When someone posts a need that matches your filters, it will show up here." action={<Btn onClick={() => setOpen(true)}>Post a need</Btn>} /> : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((w, i) => {
            const u = getUser(w.userId);
            const mine = w.userId === me;
            const responded = w.responses.some((r) => r.userId === me);
            return (
              <Card key={w.id} className="p-5 rise flex flex-col" style={{ animationDelay: `${i * 40}ms` }} data-testid={`card-want-${w.id}`}>
                <div className="flex items-center gap-3">
                  <Link href={`/profile/${u?.id}`}><Avatar user={u} size={40} /></Link>
                  <div className="flex-1 min-w-0"><Link href={`/profile/${u?.id}`} className="font-display font-bold hover:text-forest">{u?.name}</Link><div className="text-[12.5px] text-grey">{timeAgo(w.createdAt)}</div></div>
                  {w.status === 'fulfilled' ? <Badge tone="forest">Fulfilled</Badge> : <Badge tone="outline">Open</Badge>}
                </div>
                <h3 className="font-display font-extrabold text-[18px] mt-4">{w.title}</h3>
                <p className="text-[14px] text-charcoal/80 mt-1">{w.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-grey mt-3">
                  <span>Qty {w.quantity}</span><span>{w.condition} condition</span><span>{w.category}</span>
                  <span className="inline-flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" />By {fmtDate(w.neededBy)}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{w.campus}</span>
                </div>
                {w.responses.length > 0 && (mine || responded) && (
                  <div className="mt-4 space-y-2">
                    {w.responses.map((r) => { const ru = getUser(r.userId); const rl = getListing(r.listingId); return (
                      <div key={r.id} className="rounded-xl bg-ivory border border-beige p-3 text-[13px]">
                        <span className="font-semibold">{ru?.name}:</span> {r.message}
                        {rl && <Link href={`/item/${rl.id}`} className="block mt-1 text-forest font-semibold hover:underline">Listing: {rl.title}</Link>}
                      </div>
                    ); })}
                  </div>
                )}
                {mine && w.responses.length > 0 && <div className="text-[12.5px] text-forest font-semibold mt-2">{w.responses.length} response{w.responses.length > 1 ? 's' : ''}</div>}
                <div className="mt-auto pt-4 flex flex-wrap gap-2">
                  {mine ? (
                    <>
                      <Btn size="sm" variant="secondary" onClick={() => nav(`/matches?q=${encodeURIComponent(w.description)}`)} data-testid={`button-want-matches-${w.id}`}><Sparkles className="w-3.5 h-3.5" />Find matches</Btn>
                      {w.status === 'open' ? <Btn size="sm" variant="sage" onClick={() => updateWant(w.id, { status: 'fulfilled' })} data-testid={`button-want-fulfilled-${w.id}`}><Check className="w-3.5 h-3.5" />Mark fulfilled</Btn>
                        : <Btn size="sm" variant="secondary" onClick={() => updateWant(w.id, { status: 'open' })}>Reopen</Btn>}
                      <Btn size="sm" variant="danger" onClick={() => setDel(w)} data-testid={`button-want-delete-${w.id}`}><Trash2 className="w-3.5 h-3.5" /></Btn>
                    </>
                  ) : w.status === 'open' && (
                    <Btn size="sm" onClick={() => setFulfil(w)} data-testid={`button-fulfil-${w.id}`}><HandHeart className="w-4 h-4" />{responded ? 'Respond again' : 'Fulfil Request'}</Btn>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={open} onOpenChange={setOpen} title="Post a need" description="Neighbours who have it can respond directly."><WantForm onDone={() => { setOpen(false); setScope('mine'); }} /></Modal>
      <FulfilModal want={fulfil} onClose={() => setFulfil(null)} />
      <ConfirmModal open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Delete this post?" text="Responses will be removed too." danger confirmLabel="Delete" onConfirm={() => del && deleteWant(del.id)} />
    </div>
  );
}
