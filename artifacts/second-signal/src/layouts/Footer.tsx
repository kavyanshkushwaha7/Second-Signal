import { Link } from 'wouter';
import { Logo } from '@/layouts/Logo';

const LINKS = [
  ['about', 'About Us'], ['how-it-works', 'How It Works'], ['guidelines', 'Community Guidelines'], ['help', 'Help Centre'],
  ['privacy', 'Privacy Policy'], ['terms', 'Terms and Conditions'], ['contact', 'Contact'],
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-beige pt-8 pb-28 lg:pb-10">
      <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="text-[13px] text-grey mt-3">Give More. Waste Less. Connect Better. A campus reuse network, running in local demo mode.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-2.5">
          {LINKS.map(([slug, label]) => (
            <Link key={slug} href={`/info/${slug}`} className="text-[13.5px] text-charcoal/80 hover:text-forest font-medium" data-testid={`link-footer-${slug}`}>{label}</Link>
          ))}
        </div>
      </div>
      <div className="mt-8 text-[12px] text-grey">SecondSignal prototype. All data is stored in this browser only.</div>
    </footer>
  );
}
