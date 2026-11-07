import { Compass } from 'lucide-react';
import { EmptyState, LinkBtn } from '@/components/kit';

export default function NotFound() {
  return (
    <div className="py-10">
      <EmptyState icon={<Compass className="w-6 h-6" />} title="This page wandered off" text="The link may be old or mistyped. Everything else is right where you left it." action={<LinkBtn href="/home">Back to Home</LinkBtn>} />
    </div>
  );
}
