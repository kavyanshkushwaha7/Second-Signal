import { useSearch, useLocation } from 'wouter';
import { Sparkles } from 'lucide-react';
import { useStore } from '@/context/AppStore';
import { Btn, PageHeader } from '@/components/kit';
import { Marketplace } from '@/components/Marketplace';

export default function Explore() {
  const { data } = useStore();
  const search = useSearch();
  const [, nav] = useLocation();
  const params = new URLSearchParams(search);
  const q = params.get('q') ?? '';
  return (
    <div>
      <PageHeader eyebrow="Discover" title="Explore" description="Everything listed across campus, from free textbooks to bikes you can borrow for the weekend."
        actions={<Btn variant="secondary" onClick={() => nav(`/matches${q ? `?q=${encodeURIComponent(q)}` : ''}`)} data-testid="button-explore-matches"><Sparkles className="w-4 h-4" />AI Matches</Btn>} />
      <Marketplace key={q} listings={data.listings} initial={{ q, sort: q ? 'relevant' : 'recent' }}
        emptyAction={<Btn onClick={() => nav('/want-list?new=1')}>Post to Want List</Btn>} />
    </div>
  );
}
