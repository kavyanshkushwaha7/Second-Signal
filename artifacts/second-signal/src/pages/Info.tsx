import { Link, useParams } from 'wouter';
import { FileQuestion } from 'lucide-react';
import { Card, EmptyState, LinkBtn, PageHeader } from '@/components/kit';

const PAGES: Record<string, { title: string; eyebrow: string; body: string[] }> = {
  about: { eyebrow: 'About Us', title: 'Students keeping good things in use', body: ['SecondSignal began as a hostel noticeboard where seniors left calculators and kettles for first-years. It is now a campus network for selling, lending, swapping and giving away.', 'Our measure of success is simple: how many things get a second semester instead of a landfill.'] },
  'how-it-works': { eyebrow: 'How It Works', title: 'List. Request. Meet. Confirm.', body: ['1. List an item as Sell, Borrow, Give Away or Exchange with photos and conditions.', '2. Neighbours send a request. You accept or decline each one.', '3. Meet on campus to hand it over. Payment, if any, happens in person.', '4. Both of you confirm the handover. Only then is it marked complete and reviews open.', 'AI Matches suggests listings that fit a need, but never completes anything on its own.'] },
  guidelines: { eyebrow: 'Community Guidelines', title: 'Be the neighbour you want to borrow from', body: ['Describe items honestly, including flaws.', 'Return borrowed items on time and in the same condition.', 'Meet in public campus spaces.', 'No weapons, medicines, alcohol or anything against campus policy.', 'Reviews should describe the handover, not the person.'] },
  help: { eyebrow: 'Help Centre', title: 'Common questions', body: ['Why is my request still pending? The owner has not responded yet. You can message them or cancel the request.', 'How do I complete a request? After acceptance, both people press Confirm handover on My Requests.', 'Where is my data? In this prototype, everything is stored in your browser. Reset it any time from Settings.'] },
  privacy: { eyebrow: 'Privacy Policy', title: 'Your data, in plain words', body: ['This prototype stores all data in your browser local storage. Nothing is sent to a server.', 'When a backend is added, profile and listing data will be visible according to your Profile Visibility setting.', 'We will never sell personal data.'] },
  terms: { eyebrow: 'Terms and Conditions', title: 'The short version', body: ['SecondSignal connects students; it is not a party to any sale, loan or exchange.', 'Users are responsible for items they list and for honouring accepted requests.', 'This is a demo build: no payments, deliveries or guarantees are processed.'] },
  contact: { eyebrow: 'Contact', title: 'Talk to the team', body: ['Student Affairs Office, Ground Floor, Admin Block.', 'Email: hello@secondsignal.campus (not monitored in demo mode).', 'Office hours: Monday to Friday, 10am to 4pm.'] },
};

export default function Info() {
  const { slug } = useParams<{ slug: string }>();
  const p = PAGES[slug];
  if (!p) return <EmptyState icon={<FileQuestion className="w-6 h-6" />} title="Page not found" text="That help page does not exist." action={<LinkBtn href="/home">Go home</LinkBtn>} />;
  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow={p.eyebrow} title={p.title} />
      <Card className="p-6 sm:p-8 space-y-4">{p.body.map((b, i) => <p key={i} className="text-[15.5px] leading-relaxed text-charcoal/85">{b}</p>)}</Card>
      <div className="flex flex-wrap gap-3 mt-6 text-sm">{Object.entries(PAGES).filter(([k]) => k !== slug).map(([k, v]) => <Link key={k} href={`/info/${k}`} className="text-forest font-semibold hover:underline">{v.eyebrow}</Link>)}</div>
    </div>
  );
}
