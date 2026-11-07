import { useState } from 'react';
import { Link } from 'wouter';
import { User, Eye, Bell, IdCard, KeyRound, LifeBuoy, LogOut, RotateCcw } from 'lucide-react';
import { useStore } from '@/context/AppStore';
import { Avatar, Btn, Card, ConfirmModal, DemoNote, Field, Input, PageHeader, Select, Textarea } from '@/components/kit';
import { Switch } from '@/components/ui/switch';
import { CAMPUSES, fmtDate } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'personal', label: 'Personal Information', icon: User },
  { id: 'privacy', label: 'Profile Visibility', icon: Eye },
  { id: 'notifications', label: 'Notification Preferences', icon: Bell },
  { id: 'account', label: 'Account Information', icon: IdCard },
  { id: 'password', label: 'Change Password', icon: KeyRound },
  { id: 'help', label: 'Help and Support', icon: LifeBuoy },
  { id: 'logout', label: 'Logout', icon: LogOut },
];

function Row({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 py-3.5 border-b border-beige last:border-0"><div><div className="font-semibold text-[14.5px]">{title}</div><div className="text-[13px] text-grey">{text}</div></div>{children}</div>;
}

export default function Settings() {
  const { currentUser, updateProfile, settings, updateSettings, logout, resetDemo } = useStore();
  const { toast } = useToast();
  const [sec, setSec] = useState('personal');
  const [p, setP] = useState({ name: currentUser.name, email: currentUser.email, bio: currentUser.bio, campus: currentUser.campus, department: currentUser.department, year: currentUser.year });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwErr, setPwErr] = useState<Record<string, string>>({});
  const [confirmOut, setConfirmOut] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [support, setSupport] = useState('');

  const savePersonal = () => {
    if (!p.name.trim() || !/^\S+@\S+\.\S+$/.test(p.email)) { toast({ title: 'Check name and email', description: 'Both are required and the email must be valid.' }); return; }
    updateProfile(p); toast({ title: 'Personal information saved' });
  };
  const changePw = () => {
    const e: Record<string, string> = {};
    if (!pw.current) e.current = 'Enter your current password.';
    if (pw.next.length < 8) e.next = 'At least 8 characters.';
    else if (!/\d/.test(pw.next)) e.next = 'Include at least one number.';
    if (pw.next !== pw.confirm) e.confirm = 'Passwords do not match.';
    setPwErr(e);
    if (Object.keys(e).length) return;
    setPw({ current: '', next: '', confirm: '' });
    toast({ title: 'Password form validated', description: 'Demo only: no account system is connected, so nothing was changed.' });
  };

  return (
    <div>
      <PageHeader eyebrow="Preferences" title="Settings" />
      <div className="grid md:grid-cols-[240px_minmax(0,1fr)] gap-6">
        <nav className="flex md:flex-col gap-1 overflow-x-auto scrollbar-none">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setSec(s.id)} className={cn('flex items-center gap-2.5 h-10 px-3 rounded-xl text-[14px] font-display font-semibold whitespace-nowrap transition', sec === s.id ? 'bg-forest text-white' : 'hover:bg-white text-charcoal/80')} data-testid={`button-settings-${s.id}`}>
              <s.icon className={cn('w-4 h-4', sec === s.id ? 'text-sage' : 'text-grey')} />{s.label}
            </button>
          ))}
        </nav>
        <Card className="p-5 sm:p-7 page-enter" key={sec}>
          {sec === 'personal' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4"><Avatar user={currentUser} size={60} /><div><div className="font-display font-bold">{currentUser.name}</div><Link href="/profile" className="text-[13px] text-forest font-semibold">Change photo from your profile</Link></div></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" required><Input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} data-testid="input-settings-name" /></Field>
                <Field label="Campus email" required><Input value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} data-testid="input-settings-email" /></Field>
                <Field label="Campus"><Select value={p.campus} onChange={(e) => setP({ ...p, campus: e.target.value })}>{CAMPUSES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
                <Field label="Department"><Input value={p.department} onChange={(e) => setP({ ...p, department: e.target.value })} /></Field>
                <Field label="Year"><Select value={p.year} onChange={(e) => setP({ ...p, year: e.target.value })}>{['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'].map((c) => <option key={c}>{c}</option>)}</Select></Field>
                <Field label="Bio" className="sm:col-span-2"><Textarea value={p.bio} onChange={(e) => setP({ ...p, bio: e.target.value })} /></Field>
              </div>
              <Btn onClick={savePersonal} data-testid="button-save-personal">Save changes</Btn>
            </div>
          )}
          {sec === 'privacy' && (
            <div>
              <h2 className="font-bold text-lg mb-2">Profile Visibility</h2>
              <div className="space-y-2 mb-4">
                {([['public', 'Everyone on SecondSignal', 'Anyone can see your profile and listings.'], ['campus', 'Campus members', 'Recommended. Students can find and view your listings.'], ['friends', 'Friends only', 'Only friends can see your listings on your profile.']] as const).map(([v, t, d]) => (
                  <label key={v} className={cn('flex gap-3 p-3.5 rounded-xl border cursor-pointer transition', settings.visibility === v ? 'border-forest bg-sage-soft/50' : 'border-beige hover:border-sage')}>
                    <input type="radio" name="vis" checked={settings.visibility === v} onChange={() => { updateSettings({ visibility: v }); toast({ title: 'Visibility updated' }); }} className="mt-1 accent-[#174C3C]" data-testid={`radio-visibility-${v}`} />
                    <div><div className="font-semibold text-[14.5px]">{t}</div><div className="text-[13px] text-grey">{d}</div></div>
                  </label>
                ))}
              </div>
              <Row title="Show online status" text="Let others see when you are active."><Switch checked={settings.showOnline} onCheckedChange={(v) => updateSettings({ showOnline: v })} data-testid="switch-online" /></Row>
            </div>
          )}
          {sec === 'notifications' && (
            <div>
              <h2 className="font-bold text-lg mb-2">Notification Preferences</h2>
              {([['friend', 'Friend activity', 'Requests and acceptances'], ['message', 'Messages', 'New messages in your chats'], ['request', 'Item requests', 'Requests, approvals and handovers'], ['listing', 'Listing updates', 'Changes to items you saved'], ['email', 'Email digest', 'Weekly summary (not sent in demo mode)']] as const).map(([k, t, d]) => (
                <Row key={k} title={t} text={d}><Switch checked={!!settings.notify[k]} onCheckedChange={(v) => updateSettings({ notify: { ...settings.notify, [k]: v } })} data-testid={`switch-notify-${k}`} /></Row>
              ))}
            </div>
          )}
          {sec === 'account' && (
            <div>
              <h2 className="font-bold text-lg mb-2">Account Information</h2>
              {[['Username', `@${currentUser.username}`], ['Email', currentUser.email], ['Member since', fmtDate(currentUser.joinedAt)], ['Account ID', currentUser.id], ['Account type', 'Local demo account']].map(([k, v]) => (
                <div key={k} className="flex justify-between py-3 border-b border-beige last:border-0 text-[14px]"><span className="text-grey">{k}</span><span className="font-semibold">{v}</span></div>
              ))}
              <DemoNote className="mt-4">Data lives in this browser's local storage. Resetting restores the original sample campus.</DemoNote>
              <Btn variant="danger" className="mt-4" onClick={() => setConfirmReset(true)} data-testid="button-reset-demo"><RotateCcw className="w-4 h-4" />Reset demo data</Btn>
            </div>
          )}
          {sec === 'password' && (
            <div className="max-w-md space-y-4">
              <h2 className="font-bold text-lg">Change Password</h2>
              <DemoNote>Interface preview only. Authentication is not connected, so passwords are not stored or changed.</DemoNote>
              <Field label="Current password" required error={pwErr.current}><Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} data-testid="input-current-password" /></Field>
              <Field label="New password" required error={pwErr.next} hint="8+ characters with a number"><Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} data-testid="input-new-password" /></Field>
              <Field label="Confirm new password" required error={pwErr.confirm}><Input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} data-testid="input-confirm-password" /></Field>
              <Btn onClick={changePw} data-testid="button-change-password">Update password</Btn>
            </div>
          )}
          {sec === 'help' && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg">Help and Support</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[['how-it-works', 'How SecondSignal works'], ['guidelines', 'Community Guidelines'], ['help', 'Help Centre'], ['contact', 'Contact the team']].map(([s, l]) => (
                  <Link key={s} href={`/info/${s}`} className="rounded-xl border border-beige p-4 font-semibold hover:border-sage">{l}</Link>
                ))}
              </div>
              <Field label="Send us a note"><Textarea value={support} onChange={(e) => setSupport(e.target.value)} placeholder="Describe the issue" data-testid="input-support" /></Field>
              <Btn disabled={!support.trim()} onClick={() => { setSupport(''); toast({ title: 'Note saved locally', description: 'Support messaging is not connected in demo mode.' }); }} data-testid="button-send-support">Submit</Btn>
            </div>
          )}
          {sec === 'logout' && (
            <div>
              <h2 className="font-bold text-lg">Logout</h2>
              <p className="text-grey text-sm mt-1">You will return to the demo sign-in screen. Your local data stays in this browser.</p>
              <Btn variant="danger" className="mt-4" onClick={() => setConfirmOut(true)} data-testid="button-logout"><LogOut className="w-4 h-4" />Log out</Btn>
            </div>
          )}
        </Card>
      </div>
      <ConfirmModal open={confirmOut} onOpenChange={setConfirmOut} title="Log out?" text="You can sign back in as any sample student." confirmLabel="Log out" danger onConfirm={logout} />
      <ConfirmModal open={confirmReset} onOpenChange={setConfirmReset} title="Reset demo data?" text="All listings, messages and requests you created will be erased." confirmLabel="Reset" danger onConfirm={() => { resetDemo(); toast({ title: 'Demo data reset' }); }} />
    </div>
  );
}
