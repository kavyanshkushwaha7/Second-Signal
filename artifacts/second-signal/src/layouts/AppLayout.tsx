import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { LogIn } from 'lucide-react';
import { useStore } from '@/context/AppStore';
import { Navbar } from '@/layouts/Navbar';
import { Sidebar } from '@/layouts/Sidebar';
import { MobileNav } from '@/layouts/MobileNav';
import { Footer } from '@/layouts/Footer';
import { LogoMark } from '@/layouts/Logo';
import { Avatar, Btn } from '@/components/kit';

function SignedOut() {
  const { data, switchUser, login } = useStore();
  return (
    <div className="min-h-[100dvh] bg-ivory flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-beige rounded-3xl p-8 page-enter">
        <LogoMark size={44} />
        <h1 className="text-2xl font-extrabold mt-5">You are signed out</h1>
        <p className="text-grey mt-1.5 text-[14.5px]">This is a local demo. There is no real account system yet, so pick a sample student to continue.</p>
        <div className="mt-6 space-y-2 max-h-72 overflow-y-auto">
          {data.users.slice(0, 6).map((u) => (
            <button key={u.id} onClick={() => switchUser(u.id)} className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-beige hover:border-sage hover:bg-ivory text-left transition" data-testid={`button-login-${u.id}`}>
              <Avatar user={u} size={36} />
              <div><div className="font-display font-bold text-sm">{u.name}</div><div className="text-xs text-grey">{u.department}, {u.campus}</div></div>
            </button>
          ))}
        </div>
        <Btn className="w-full mt-5" onClick={login} data-testid="button-login-continue"><LogIn className="w-4 h-4" /> Continue as last user</Btn>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { data, storageError } = useStore();
  const [loc] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [loc]);
  if (data.loggedOut) return <SignedOut />;
  const fullBleed = loc.startsWith('/messages');
  return (
    <div className="min-h-[100dvh] bg-ivory">
      <div className="bg-forest text-[#E6EDE6] text-[12px] text-center px-4 py-1.5 font-medium" data-testid="text-demo-banner">
        Local demo mode. Data stays in this browser; chat, purchases and AI matching are simulated.
        {storageError && <span className="ml-2 underline">Storage is full, recent changes may not persist.</span>}
      </div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div key={loc} className={fullBleed ? 'page-enter px-0 sm:px-4 lg:px-6 py-0 sm:py-5' : 'page-enter px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1240px] mx-auto'}>
            {children}
            {!fullBleed && <Footer />}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
