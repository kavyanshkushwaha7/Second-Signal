import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { ArrowLeft, CheckCircle2, ArrowLeftRight, PackageX } from 'lucide-react';
import { useStore } from '@/context/AppStore';
import { Avatar, Btn, Card, DemoNote, EmptyState, Field, Input, LinkBtn, Select, Textarea, TypeBadge } from '@/components/kit';
import { CONDITIONS, REQ_LABEL, fmtDate, img, money, priceLabel, requestTypeFor } from '@/utils/format';
import { differenceInCalendarDays } from 'date-fns';

const TITLES = { buy: 'Confirm purchase request', giveaway: 'Request this item', borrow: 'Borrowing request', exchange: 'Exchange request' };
const SUBMIT = { buy: 'Confirm Purchase Request', giveaway: 'Submit Request', borrow: 'Send Borrow Request', exchange: 'Send Exchange Request' };

export default function RequestPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { getListing, getUser, currentUser, createRequest, data, me } = useStore();
  const [, nav] = useLocation();
  const l = getListing(itemId);
  const today = new Date().toISOString().slice(0, 10);
  const [qty, setQty] = useState('1');
  const [msg, setMsg] = useState('');
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState('');
  const [offered, setOffered] = useState('');
  const [offCond, setOffCond] = useState('Good');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [doneId, setDoneId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const duration = useMemo(() => {
    if (!start || !end) return '';
    const d = differenceInCalendarDays(new Date(end), new Date(start));
    return d > 0 ? `${d} day${d > 1 ? 's' : ''}` : '';
  }, [start, end]);

  if (!l) return <EmptyState icon={<PackageX className="w-6 h-6" />} title="Listing not found" text="This item may have been removed." action={<LinkBtn href="/explore">Back to Explore</LinkBtn>} />;
  const owner = getUser(l.ownerId);
  const type = requestTypeFor(l.type);
  const existing = data.requests.find((r) => r.listingId === l.id && r.requesterId === me && (r.status === 'pending' || r.status === 'accepted'));

  if (l.ownerId === me) return <EmptyState icon={<PackageX className="w-6 h-6" />} title="This is your own listing" text="You cannot request your own item. Manage it from the item page instead." action={<LinkBtn href={`/item/${l.id}`}>Open listing</LinkBtn>} />;

  const validate = () => {
    const e: Record<string, string> = {};
    const q = Number(qty);
    if (!q || q < 1) e.qty = 'Enter at least 1.';
    else if (q > l.quantity) e.qty = `Only ${l.quantity} available.`;
    if (!msg.trim()) e.msg = 'Add a short message to the owner.';
    if (type === 'borrow') {
      if (!start) e.start = 'Choose a start date.';
      if (!end) e.end = 'Choose a return date.';
      else if (!duration) e.end = 'Return date must be after the start date.';
      else if (l.availableTo && end > l.availableTo) e.end = `Owner lends only until ${fmtDate(l.availableTo)}.`;
      if (l.availableFrom && start < l.availableFrom) e.start = `Available from ${fmtDate(l.availableFrom)}.`;
    }
    if (type === 'exchange' && !offered.trim()) e.offered = 'Describe the item you are offering.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      const id = createRequest({
        listingId: l.id, type, quantity: Number(qty), message: msg.trim(),
        ...(type === 'borrow' ? { startDate: start, returnDate: end, duration } : {}),
        ...(type === 'exchange' ? { offeredItem: offered.trim(), offeredCondition: offCond } : {}),
      });
      setSubmitting(false);
      setDoneId(id);
    }, 500);
  };

  if (doneId) {
    return (
      <div className="max-w-lg mx-auto text-center py-10 page-enter">
        <div className="relative inline-flex"><span className="absolute inset-0 rounded-full bg-sage/40 signal-dot" /><CheckCircle2 className="relative w-16 h-16 text-forest" /></div>
        <h1 className="text-2xl font-extrabold mt-5" data-testid="text-request-success">Request sent to {owner?.name.split(' ')[0]}</h1>
        <p className="text-grey mt-2">Status: <span className="font-semibold text-forest">Pending</span>. You will get a notification when {owner?.name.split(' ')[0]} accepts or declines.{type === 'buy' && ' No payment has been taken; you pay in person at handover.'}</p>
        <DemoNote className="mt-5 text-left">Simulated request stored locally. Switch to {owner?.name}'s demo account from the user menu to accept it.</DemoNote>
        <div className="flex gap-2 justify-center mt-6">
          <LinkBtn href="/my-requests" data-testid="button-goto-requests">View My Requests</LinkBtn>
          <LinkBtn href={`/item/${l.id}`} variant="secondary">Back to item</LinkBtn>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <Link href={`/item/${l.id}`} className="inline-flex items-center gap-1.5 text-sm font-display font-semibold text-grey hover:text-forest mb-4"><ArrowLeft className="w-4 h-4" />Back to item</Link>
      <h1 className="text-[28px] font-extrabold">{TITLES[type]}</h1>
      <p className="text-grey mt-1 mb-6">{REQ_LABEL[type]} request · the owner reviews it before anything is confirmed.</p>
      {existing && <DemoNote className="mb-5">You already have a {existing.status} request for this item. Sending another will create a separate request.</DemoNote>}
      <div className="grid md:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <Card className="p-5 sm:p-6 space-y-4 order-2 md:order-1">
          <Field label="Item"><Input value={l.title} readOnly className="bg-ivory" /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={type === 'buy' ? 'Quantity' : 'Requested quantity'} required error={errors.qty} hint={`${l.quantity} available`}>
              <Input type="number" min={1} max={l.quantity} value={qty} onChange={(e) => setQty(e.target.value)} invalid={!!errors.qty} data-testid="input-request-qty" />
            </Field>
            {type === 'buy' && <Field label="Total"><Input readOnly value={money((l.price ?? 0) * (Number(qty) || 0))} className="bg-ivory font-semibold" data-testid="text-request-total" /></Field>}
          </div>
          {type === 'borrow' && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Start date" required error={errors.start}><Input type="date" min={today} value={start} onChange={(e) => setStart(e.target.value)} invalid={!!errors.start} data-testid="input-start-date" /></Field>
              <Field label="Expected return date" required error={errors.end}><Input type="date" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} invalid={!!errors.end} data-testid="input-return-date" /></Field>
              <Field label="Requested duration" hint={`Owner allows: ${l.borrowDuration ?? 'flexible'}`} className="sm:col-span-2"><Input readOnly value={duration || 'Pick dates'} className="bg-ivory" data-testid="text-duration" /></Field>
            </div>
          )}
          {type === 'exchange' && (
            <div className="grid sm:grid-cols-[1fr_160px] gap-4">
              <Field label="Item you are offering" required error={errors.offered}><Input value={offered} onChange={(e) => setOffered(e.target.value)} placeholder={`e.g. ${l.desiredItem ?? 'your item'}`} invalid={!!errors.offered} data-testid="input-offered-item" /></Field>
              <Field label="Its condition"><Select value={offCond} onChange={(e) => setOffCond(e.target.value)} data-testid="select-offered-condition">{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            </div>
          )}
          <Field label="Message to owner" required error={errors.msg}>
            <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={type === 'borrow' ? 'What do you need it for, and when can you pick it up?' : 'Introduce yourself and suggest a pickup time.'} invalid={!!errors.msg} data-testid="input-request-message" />
          </Field>
          {type === 'buy' && (
            <div className="rounded-xl border border-beige p-4">
              <div className="text-[12px] uppercase tracking-wide text-grey font-semibold mb-2">Buyer information</div>
              <div className="flex items-center gap-3"><Avatar user={currentUser} size={36} /><div><div className="font-semibold text-sm">{currentUser.name}</div><div className="text-[12.5px] text-grey">{currentUser.email} · {currentUser.campus}</div></div></div>
            </div>
          )}
          <DemoNote>{type === 'buy' ? 'Purchase requests are simulated. No payment is processed in this prototype.' : 'Requests are stored locally in this browser for the demo.'}</DemoNote>
          <Btn size="lg" className="w-full" onClick={submit} disabled={submitting} data-testid="button-submit-request">{submitting ? 'Sending...' : SUBMIT[type]}</Btn>
        </Card>
        <div className="order-1 md:order-2 space-y-4">
          <Card className="overflow-hidden">
            <img src={img(l.images[0] ?? '')} alt="" className="w-full aspect-[4/3] object-cover" />
            <div className="p-4">
              <TypeBadge type={l.type} />
              <div className="font-display font-bold mt-2">{l.title}</div>
              <div className="text-forest font-display font-extrabold mt-1">{priceLabel(l)}</div>
              <div className="text-[12.5px] text-grey mt-1">{l.condition} · {l.location}</div>
              {l.type === 'exchange' && <div className="mt-3 flex items-center gap-2 text-[13px] bg-sage-soft rounded-xl p-2.5 text-forest"><ArrowLeftRight className="w-4 h-4" />Wants: {l.desiredItem}</div>}
              {l.type === 'borrow' && <div className="mt-3 text-[12.5px] text-grey">Deposit: {l.deposit ? money(l.deposit) : 'None'} · {l.returnConditions}</div>}
              {l.type === 'giveaway' && l.pickupDetails && <div className="mt-3 text-[12.5px] text-grey">Pickup: {l.pickupDetails}</div>}
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <Avatar user={owner} size={40} />
            <div className="min-w-0"><div className="text-[11.5px] text-grey uppercase tracking-wide font-semibold">{type === 'buy' ? 'Seller' : 'Owner'}</div><Link href={`/profile/${owner?.id}`} className="font-semibold hover:text-forest">{owner?.name}</Link><div className="text-[12px] text-grey">{owner?.campus}</div></div>
          </Card>
        </div>
      </div>
    </div>
  );
}
