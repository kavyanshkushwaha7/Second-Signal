import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearch } from 'wouter';
import { ArrowLeft, Paperclip, Send, Plus, Share2, X, MessageCircle, Info } from 'lucide-react';
import type { Message } from '@/types';
import { useStore } from '@/context/AppStore';
import { Avatar, Btn, EmptyState, Modal, SearchBar } from '@/components/kit';
import { ChatBubble, ListingChip } from '@/components/ChatBubble';
import { fileToDataUrl, fmtDate, fmtTime, img, timeAgo } from '@/utils/format';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { isToday } from 'date-fns';

export default function Messages() {
  const { convId } = useParams<{ convId?: string }>();
  const search = useSearch();
  const { data, me, getUser, sendMessage, markConversationRead, openConversation, friendsOf, getListing } = useStore();
  const [, nav] = useLocation();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [text, setText] = useState('');
  const [shareId, setShareId] = useState<string | null>(new URLSearchParams(search).get('share'));
  const [attachment, setAttachment] = useState<Message['attachment'] | null>(null);
  const [pickListing, setPickListing] = useState(false);
  const [newChat, setNewChat] = useState(false);
  const [listingQ, setListingQ] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const convs = useMemo(() => data.conversations
    .filter((c) => c.participants.includes(me))
    .map((c) => ({ c, other: getUser(c.participants.find((p) => p !== me)), last: c.messages[c.messages.length - 1], unread: c.messages.filter((m) => m.senderId !== me && m.createdAt > (c.lastRead[me] ?? '')).length }))
    .filter((x) => !q || x.other?.name.toLowerCase().includes(q.toLowerCase()) || x.last?.text.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.last?.createdAt ?? '').localeCompare(a.last?.createdAt ?? '')), [data.conversations, me, getUser, q]);

  const active = data.conversations.find((c) => c.id === convId && c.participants.includes(me));
  const other = active ? getUser(active.participants.find((p) => p !== me)) : undefined;
  const lastCount = active?.messages.length ?? 0;
  const markRef = useRef(markConversationRead);
  markRef.current = markConversationRead;

  useEffect(() => { if (active) markRef.current(active.id); }, [active?.id, lastCount]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [convId, lastCount]);

  const send = () => {
    if (!active || (!text.trim() && !shareId && !attachment)) return;
    sendMessage(active.id, { text: text.trim(), listingId: shareId ?? undefined, attachment: attachment ?? undefined });
    setText(''); setShareId(null); setAttachment(null);
  };

  const onFile = async (f?: File) => {
    if (!f) return;
    if (f.size > 4_000_000) { toast({ title: 'File too large', description: 'Attachments up to 4MB in demo mode.' }); return; }
    const isImage = f.type.startsWith('image/');
    const dataUrl = isImage ? await fileToDataUrl(f, 800) : await fileToDataUrl(f);
    setAttachment({ name: f.name, dataUrl, isImage });
  };

  const myListings = data.listings.filter((l) => !listingQ || l.title.toLowerCase().includes(listingQ.toLowerCase())).slice(0, 20);
  const contacts = [...new Set([...friendsOf(me), ...data.users.map((u) => u.id)])].filter((id) => id !== me).map((id) => getUser(id)!);

  let lastDay = '';
  return (
    <div className="bg-white sm:border border-beige sm:rounded-3xl overflow-hidden flex h-[calc(100dvh-4rem-30px-64px)] lg:h-[calc(100dvh-4rem-30px-40px)]">
      <aside className={cn('w-full md:w-[340px] shrink-0 border-r border-beige flex flex-col', active && 'hidden md:flex')}>
        <div className="p-4 border-b border-beige">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-extrabold">Messages</h1>
            <Btn size="sm" variant="sage" onClick={() => setNewChat(true)} data-testid="button-new-chat"><Plus className="w-4 h-4" />New</Btn>
          </div>
          <SearchBar value={q} onChange={setQ} placeholder="Search conversations" testId="input-search-conversations" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {convs.length === 0 && <div className="p-6 text-center text-sm text-grey">No conversations found.</div>}
          {convs.map(({ c, other: o, last, unread }) => (
            <Link key={c.id} href={`/messages/${c.id}`} className={cn('flex gap-3 px-4 py-3 border-b border-beige/60 transition-colors', c.id === convId ? 'bg-sage-soft' : 'hover:bg-ivory')} data-testid={`link-conversation-${c.id}`}>
              <Avatar user={o} size={44} showOnline />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2"><span className={cn('font-display truncate', unread ? 'font-extrabold' : 'font-semibold')}>{o?.name}</span><span className="text-[11px] text-grey whitespace-nowrap">{last ? (isToday(new Date(last.createdAt)) ? fmtTime(last.createdAt) : timeAgo(last.createdAt)) : ''}</span></div>
                <div className="flex justify-between gap-2 mt-0.5">
                  <span className={cn('text-[13px] truncate', unread ? 'text-charcoal font-medium' : 'text-grey')}>{last ? `${last.senderId === me ? 'You: ' : ''}${last.text || (last.listingId ? 'Shared a listing' : 'Sent an attachment')}` : 'Say hello'}</span>
                  {unread > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-forest text-white text-[11px] font-bold flex items-center justify-center" data-testid={`badge-unread-${c.id}`}>{unread}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="p-3 text-[11.5px] text-grey border-t border-beige flex gap-1.5"><Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />Local demo: messages are stored in this browser. Real-time delivery is not connected. Switch demo account to reply as the other person.</div>
      </aside>

      <section className={cn('flex-1 flex flex-col min-w-0 bg-ivory/60', !active && 'hidden md:flex')}>
        {!active ? (
          <div className="flex-1 flex items-center justify-center p-6"><EmptyState icon={<MessageCircle className="w-6 h-6" />} title={convId ? 'Conversation not found' : 'Pick a conversation'} text="Or start a new one from any listing with Message Owner." action={<Btn onClick={() => setNewChat(true)}>Start new conversation</Btn>} /></div>
        ) : (
          <>
            <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-beige">
              <button onClick={() => nav('/messages')} className="md:hidden p-1.5 rounded-lg hover:bg-ivory" aria-label="Back" data-testid="button-back-conversations"><ArrowLeft className="w-5 h-5" /></button>
              <Link href={`/profile/${other?.id}`}><Avatar user={other} size={40} showOnline /></Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${other?.id}`} className="font-display font-bold hover:text-forest" data-testid="link-chat-profile">{other?.name}</Link>
                <div className="text-[12px] text-grey">{other?.online ? 'Online (demo status)' : 'Offline'} · {other?.department}</div>
              </div>
              <Btn variant="secondary" size="sm" onClick={() => nav(`/profile/${other?.id}`)}>Profile</Btn>
            </header>
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
              {active.messages.length === 0 && <div className="text-center text-sm text-grey py-10">No messages yet. Say hello to {other?.name.split(' ')[0]}.</div>}
              {active.messages.map((m) => {
                const day = fmtDate(m.createdAt);
                const sep = day !== lastDay; lastDay = day;
                return (
                  <div key={m.id}>
                    {sep && <div className="text-center my-3"><span className="text-[11px] font-semibold text-grey bg-white border border-beige rounded-full px-3 py-1">{isToday(new Date(m.createdAt)) ? 'Today' : day}</span></div>}
                    <ChatBubble m={m} mine={m.senderId === me} />
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
            <div className="bg-white border-t border-beige p-3">
              {(shareId || attachment) && (
                <div className="flex gap-2 mb-2">
                  {shareId && getListing(shareId) && <div className="relative w-64"><ListingChip listingId={shareId} /><button onClick={() => setShareId(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-charcoal text-white flex items-center justify-center" aria-label="Remove listing"><X className="w-3 h-3" /></button></div>}
                  {attachment && <div className="relative flex items-center gap-2 rounded-xl border border-beige bg-ivory px-2.5 py-2 text-[12.5px]">{attachment.isImage ? <img src={attachment.dataUrl} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <Paperclip className="w-4 h-4" />}<span className="max-w-[140px] truncate">{attachment.name}</span><button onClick={() => setAttachment(null)} className="ml-1 text-grey hover:text-charcoal" aria-label="Remove attachment"><X className="w-3.5 h-3.5" /></button></div>}
                </div>
              )}
              <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
                <button type="button" onClick={() => fileRef.current?.click()} className="w-10 h-10 rounded-xl hover:bg-ivory flex items-center justify-center text-grey hover:text-forest" aria-label="Attach file" data-testid="button-attach"><Paperclip className="w-5 h-5" /></button>
                <button type="button" onClick={() => setPickListing(true)} className="w-10 h-10 rounded-xl hover:bg-ivory flex items-center justify-center text-grey hover:text-forest" aria-label="Share listing" data-testid="button-share-listing"><Share2 className="w-5 h-5" /></button>
                <input ref={fileRef} type="file" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
                <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder={`Message ${other?.name.split(' ')[0]}`} className="flex-1 resize-none max-h-32 rounded-xl border border-beige bg-ivory px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-sage focus:bg-white" data-testid="input-message" />
                <Btn type="submit" className="w-11 h-10 px-0" disabled={!text.trim() && !shareId && !attachment} aria-label="Send" data-testid="button-send-message"><Send className="w-4 h-4" /></Btn>
              </form>
            </div>
          </>
        )}
      </section>

      <Modal open={pickListing} onOpenChange={setPickListing} title="Share a listing" description="Send any SecondSignal listing into this chat.">
        <SearchBar value={listingQ} onChange={setListingQ} placeholder="Search listings" className="mb-3" testId="input-share-search" />
        <div className="max-h-80 overflow-y-auto space-y-1.5">
          {myListings.map((l) => (
            <button key={l.id} onClick={() => { setShareId(l.id); setPickListing(false); }} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-ivory text-left" data-testid={`button-pick-listing-${l.id}`}>
              <img src={img(l.images[0] ?? '')} alt="" className="w-11 h-11 rounded-lg object-cover" />
              <div className="min-w-0"><div className="text-sm font-semibold truncate">{l.title}</div><div className="text-[12px] text-grey">{l.ownerId === me ? 'Your listing' : getUser(l.ownerId)?.name}</div></div>
            </button>
          ))}
        </div>
      </Modal>
      <Modal open={newChat} onOpenChange={setNewChat} title="New conversation">
        <div className="max-h-96 overflow-y-auto space-y-1">
          {contacts.map((u) => (
            <button key={u.id} onClick={() => { const id = openConversation(u.id); setNewChat(false); nav(`/messages/${id}`); }} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-ivory text-left" data-testid={`button-chat-with-${u.id}`}>
              <Avatar user={u} size={36} showOnline /><div><div className="text-sm font-semibold">{u.name}</div><div className="text-[12px] text-grey">@{u.username}</div></div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
