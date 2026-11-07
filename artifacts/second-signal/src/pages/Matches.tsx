import { useEffect, useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { Sparkles, MapPin, Search, Wand2 } from 'lucide-react';
import { useStore } from '@/context/AppStore';
import { Avatar, Btn, Card, DemoNote, EmptyState, PageHeader, TypeBadge, Textarea } from '@/components/kit';
import { findMatches, inferCategory, type MatchResult } from '@/utils/matching';
import { actionFor } from '@/utils/actions';
import { img, priceLabel } from '@/utils/format';

const EXAMPLES = ['I need a scientific calculator for two weeks', 'Looking for a cycle to get to morning lectures', 'Need decorations for our hostel night', 'Any econ textbooks for my minor?'];

export default function Matches() {
  const { data, me, currentUser } = useStore();
  const search = useSearch();
  const [, nav] = useLocation();
  const initial = new URLSearchParams(search).get('q') ?? '';
  const [q, setQ] = useState(initial);
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const myWants = data.wants.filter((w) => w.userId === me && w.status === 'open');

  const run = (text: string) => {
    if (!text.trim()) return;
    setQ(text);
    setLoading(true);
    setTimeout(() => { setResults(findMatches(text, data.listings, data.users, me, currentUser.campus)); setLoading(false); }, 700);
  };
  useEffect(() => { if (initial) run(initial); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const cat = q ? inferCategory(q) : undefined;
  return (
    <div className="max-w-5xl">
      <PageHeader eyebrow="Smart matching" title="AI Matches" description="Describe what you need in plain words. We look for listings that mean the same thing, even when they are worded differently." />
      <DemoNote className="mb-5">Mock matching: a local keyword and synonym heuristic, not a language model. Results are suggestions only and never complete a request automatically.</DemoNote>
      <Card className="p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute right-6 top-6 hidden sm:block" aria-hidden>
          <span className="block w-3 h-3 rounded-full bg-forest relative"><span className="absolute inset-0 rounded-full bg-sage signal-dot" /></span>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); run(q); }}>
          <Textarea value={q} onChange={(e) => setQ(e.target.value)} placeholder="I need a scientific calculator for two weeks." className="min-h-[90px] text-[15px] bg-ivory" data-testid="input-match-query" />
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mt-3">
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((e) => <button key={e} type="button" onClick={() => run(e)} className="text-[12.5px] rounded-full border border-beige bg-white px-3 py-1 hover:border-sage">{e}</button>)}
            </div>
            <Btn type="submit" disabled={!q.trim() || loading} data-testid="button-run-match"><Sparkles className="w-4 h-4" />{loading ? 'Matching...' : 'Find matches'}</Btn>
          </div>
        </form>
        {cat && <div className="mt-3 text-[13px] text-grey inline-flex items-center gap-1.5"><Wand2 className="w-3.5 h-3.5 text-forest" />Understood category: <span className="font-semibold text-forest">{cat}</span></div>}
      </Card>

      {myWants.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px]">
          <span className="text-grey">From your Want List:</span>
          {myWants.map((w) => <button key={w.id} onClick={() => run(`${w.title} ${w.description}`)} className="rounded-full bg-sage-soft text-forest px-3 py-1 font-semibold hover:bg-sage/40">{w.title}</button>)}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-36 rounded-2xl bg-white border border-beige animate-pulse" />)}</div>
        ) : results === null ? (
          <EmptyState icon={<Sparkles className="w-6 h-6" />} title="Tell us what you need" text="Try one of the examples above, or pick something from your Want List." />
        ) : results.length === 0 ? (
          <EmptyState icon={<Search className="w-6 h-6" />} title="No close matches yet" text="Nobody has listed this yet. Post it to the Want List and neighbours can respond." action={<Btn onClick={() => nav('/want-list?new=1')}>Post to Want List</Btn>} />
        ) : (
          <div className="space-y-4">
            <div className="text-[13px] text-grey">{results.length} suggested matches, ranked by relevance</div>
            {results.map((m, i) => {
              const a = actionFor(m.listing);
              return (
                <Card key={m.listing.id} className="p-4 sm:p-5 rise flex flex-col sm:flex-row gap-5" style={{ animationDelay: `${i * 70}ms` }} data-testid={`card-match-${m.listing.id}`}>
                  <Link href={`/item/${m.listing.id}`} className="shrink-0"><img src={img(m.listing.images[0] ?? '')} alt="" className="w-full sm:w-40 aspect-[4/3] rounded-xl object-cover" /></Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <TypeBadge type={m.listing.type} />
                        <Link href={`/item/${m.listing.id}`} className="block font-display font-bold text-[17px] mt-1.5 hover:text-forest">{m.listing.title}</Link>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display font-extrabold text-2xl text-forest" data-testid={`text-score-${m.listing.id}`}>{m.score}%</div>
                        <div className="text-[11px] text-grey">relevance</div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#F1EFE8] mt-3 overflow-hidden"><div className="h-full bg-forest rounded-full origin-left rise" style={{ width: `${m.score}%` }} /></div>
                    <p className="text-[13.5px] mt-3"><span className="font-semibold text-forest">Why it matches: </span>{m.explanation}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-grey mt-2">
                      <span className="inline-flex items-center gap-1.5"><Avatar user={m.owner} size={18} />{m.owner?.name}</span>
                      <span>{m.listing.condition}</span><span>{m.listing.availability}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{m.listing.campus}</span>
                      <span className="font-semibold text-charcoal">{priceLabel(m.listing)}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Btn size="sm" onClick={() => nav(a.href)} data-testid={`button-match-action-${m.listing.id}`}>{a.label}</Btn>
                      <Btn size="sm" variant="secondary" onClick={() => nav(`/item/${m.listing.id}`)}>View Details</Btn>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
