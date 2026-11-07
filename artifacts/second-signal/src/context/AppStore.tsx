import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type {
  AppData, AppNotification, ItemRequest, Listing, Message, NotificationType, RequestStatus, User, UserSettings, Want,
} from '@/types';
import { createSeed, defaultSettings } from '@/data/seed';
import { uid } from '@/utils/format';

/**
 * Local demo data service. Everything persists to localStorage.
 * Each action mirrors a future API endpoint so a backend can replace it later.
 */
const KEY = 'secondsignal.v1';

function load(): AppData {
  try {
    const s = localStorage.getItem(KEY);
    if (s) {
      const d = JSON.parse(s) as AppData;
      if (d.version === 1) return d;
    }
  } catch { /* ignore */ }
  return createSeed();
}

const now = () => new Date().toISOString();

function notify(d: AppData, userId: string, type: NotificationType, text: string, link: string, actorId?: string): AppNotification[] {
  if (userId === actorId) return d.notifications;
  return [{ id: uid('n'), userId, type, text, link, actorId, read: false, createdAt: now() }, ...d.notifications];
}

export type NewListing = Omit<Listing, 'id' | 'ownerId' | 'createdAt' | 'likes' | 'comments'>;
export type NewRequest = Omit<ItemRequest, 'id' | 'requesterId' | 'ownerId' | 'status' | 'confirmations' | 'createdAt' | 'updatedAt'>;

function useStoreValue() {
  const [data, setData] = useState<AppData>(load);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(data)); setStorageError(false); } catch { setStorageError(true); }
  }, [data]);

  const me = data.currentUserId;
  const meRef = useRef(me);
  meRef.current = me;

  const update = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);

  const getUser = useCallback((id?: string) => data.users.find((u) => u.id === id), [data.users]);
  const getListing = useCallback((id?: string) => data.listings.find((l) => l.id === id), [data.listings]);
  const isFriend = useCallback((a: string, b: string) => data.friendships.some(([x, y]) => (x === a && y === b) || (x === b && y === a)), [data.friendships]);
  const friendsOf = useCallback((id: string) => data.friendships.filter((f) => f.includes(id)).map((f) => (f[0] === id ? f[1] : f[0])), [data.friendships]);

  const actions = useMemo(() => ({
    switchUser: (id: string) => update((d) => ({ ...d, currentUserId: id, loggedOut: false })),
    logout: () => update((d) => ({ ...d, loggedOut: true })),
    login: () => update((d) => ({ ...d, loggedOut: false })),
    resetDemo: () => { localStorage.removeItem(KEY); setData(createSeed()); },

    toggleSave: (listingId: string) => update((d) => {
      const list = d.saved[d.currentUserId] ?? [];
      const next = list.includes(listingId) ? list.filter((x) => x !== listingId) : [listingId, ...list];
      return { ...d, saved: { ...d.saved, [d.currentUserId]: next } };
    }),
    toggleLike: (listingId: string) => update((d) => ({
      ...d,
      listings: d.listings.map((l) => l.id !== listingId ? l : {
        ...l, likes: l.likes.includes(d.currentUserId) ? l.likes.filter((x) => x !== d.currentUserId) : [...l.likes, d.currentUserId],
      }),
    })),
    addComment: (listingId: string, text: string) => update((d) => {
      const l = d.listings.find((x) => x.id === listingId);
      const u = d.users.find((x) => x.id === d.currentUserId)!;
      return {
        ...d,
        listings: d.listings.map((x) => x.id !== listingId ? x : { ...x, comments: [...x.comments, { id: uid('cm'), userId: d.currentUserId, text, createdAt: now() }] }),
        notifications: l ? notify(d, l.ownerId, 'listing_update', `${u.name} commented on ${l.title}`, `/item/${l.id}`, d.currentUserId) : d.notifications,
      };
    }),

    createListing: (input: NewListing) => {
      const id = uid('l');
      update((d) => ({ ...d, listings: [{ ...input, id, ownerId: d.currentUserId, createdAt: now(), likes: [], comments: [] }, ...d.listings] }));
      return id;
    },
    updateListing: (id: string, patch: Partial<Listing>) => update((d) => {
      const savers = Object.entries(d.saved).filter(([uidd, ids]) => uidd !== d.currentUserId && ids.includes(id)).map(([u]) => u);
      const l = d.listings.find((x) => x.id === id);
      let notifications = d.notifications;
      savers.forEach((s) => { notifications = notify({ ...d, notifications }, s, 'listing_update', `A listing you saved was updated: ${patch.title ?? l?.title}`, `/item/${id}`, d.currentUserId); });
      return { ...d, notifications, listings: d.listings.map((x) => (x.id === id ? { ...x, ...patch } : x)) };
    }),
    deleteListing: (id: string) => update((d) => ({
      ...d,
      listings: d.listings.filter((l) => l.id !== id),
      saved: Object.fromEntries(Object.entries(d.saved).map(([k, v]) => [k, v.filter((x) => x !== id)])),
      requests: d.requests.map((r) => (r.listingId === id && r.status === 'pending' ? { ...r, status: 'cancelled' as RequestStatus, updatedAt: now() } : r)),
    })),

    createRequest: (input: NewRequest) => {
      const id = uid('r');
      update((d) => {
        const l = d.listings.find((x) => x.id === input.listingId);
        if (!l) return d;
        const u = d.users.find((x) => x.id === d.currentUserId)!;
        const typeMap = { buy: 'item_request', giveaway: 'item_request', borrow: 'borrow_request', exchange: 'exchange_request' } as const;
        const verb = { buy: 'sent a purchase request for', giveaway: 'requested', borrow: 'wants to borrow', exchange: 'proposed an exchange for' }[input.type];
        return {
          ...d,
          requests: [{ ...input, id, requesterId: d.currentUserId, ownerId: l.ownerId, status: 'pending', confirmations: [], createdAt: now(), updatedAt: now() }, ...d.requests],
          notifications: notify(d, l.ownerId, typeMap[input.type], `${u.name} ${verb} your ${l.title}`, '/my-requests', d.currentUserId),
        };
      });
      return id;
    },
    setRequestStatus: (id: string, status: RequestStatus) => update((d) => {
      const r = d.requests.find((x) => x.id === id);
      if (!r) return d;
      const l = d.listings.find((x) => x.id === r.listingId);
      const u = d.users.find((x) => x.id === d.currentUserId)!;
      let notifications = d.notifications;
      if (status === 'accepted' || status === 'rejected') {
        notifications = notify(d, r.requesterId, status === 'accepted' ? 'request_accepted' : 'request_rejected', `${u.name} ${status} your request for ${l?.title ?? 'an item'}`, '/my-requests', d.currentUserId);
      }
      if (status === 'cancelled') {
        notifications = notify(d, r.ownerId, 'listing_update', `${u.name} cancelled their request for ${l?.title ?? 'an item'}`, '/my-requests', d.currentUserId);
      }
      return { ...d, notifications, requests: d.requests.map((x) => (x.id === id ? { ...x, status, updatedAt: now() } : x)) };
    }),
    confirmCompletion: (id: string) => update((d) => {
      const r = d.requests.find((x) => x.id === id);
      if (!r || r.status !== 'accepted' || r.confirmations.includes(d.currentUserId)) return d;
      const confirmations = [...r.confirmations, d.currentUserId];
      const done = confirmations.includes(r.ownerId) && confirmations.includes(r.requesterId);
      const l = d.listings.find((x) => x.id === r.listingId);
      const u = d.users.find((x) => x.id === d.currentUserId)!;
      const other = d.currentUserId === r.ownerId ? r.requesterId : r.ownerId;
      let notifications = notify(d, other, 'handover', done ? `Handover complete for ${l?.title}. You can now leave a review.` : `${u.name} confirmed the handover of ${l?.title}. Please confirm on your side.`, '/my-requests', d.currentUserId);
      if (done) notifications = notify({ ...d, notifications }, d.currentUserId, 'handover', `Handover complete for ${l?.title}. You can now leave a review.`, '/my-requests');
      let listings = d.listings;
      if (done && l && r.type !== 'borrow') {
        const q = Math.max(0, l.quantity - r.quantity);
        listings = d.listings.map((x) => (x.id === l.id ? { ...x, quantity: q, availability: q === 0 ? 'Unavailable' : x.availability } : x));
      }
      return { ...d, listings, notifications, requests: d.requests.map((x) => (x.id === id ? { ...x, confirmations, status: done ? 'completed' : 'accepted', updatedAt: now() } : x)) };
    }),
    addReview: (requestId: string, toId: string, rating: number, text: string) => update((d) => ({
      ...d,
      reviews: [{ id: uid('rv'), requestId, fromId: d.currentUserId, toId, rating, text, createdAt: now() }, ...d.reviews],
      notifications: notify(d, toId, 'listing_update', `${d.users.find((u) => u.id === d.currentUserId)?.name} left you a ${rating}-star review`, `/profile/${toId}`, d.currentUserId),
    })),

    sendFriendRequest: (toId: string) => update((d) => {
      if (d.friendRequests.some((f) => (f.fromId === d.currentUserId && f.toId === toId) || (f.fromId === toId && f.toId === d.currentUserId))) return d;
      const u = d.users.find((x) => x.id === d.currentUserId)!;
      return {
        ...d,
        friendRequests: [...d.friendRequests, { id: uid('fr'), fromId: d.currentUserId, toId, createdAt: now() }],
        notifications: notify(d, toId, 'friend_request', `${u.name} sent you a friend request`, '/friends', d.currentUserId),
      };
    }),
    cancelFriendRequest: (toId: string) => update((d) => ({ ...d, friendRequests: d.friendRequests.filter((f) => !(f.fromId === d.currentUserId && f.toId === toId)) })),
    respondFriendRequest: (reqId: string, accept: boolean) => update((d) => {
      const fr = d.friendRequests.find((f) => f.id === reqId);
      if (!fr) return d;
      const u = d.users.find((x) => x.id === d.currentUserId)!;
      return {
        ...d,
        friendRequests: d.friendRequests.filter((f) => f.id !== reqId),
        friendships: accept ? [...d.friendships, [fr.fromId, fr.toId]] : d.friendships,
        notifications: accept ? notify(d, fr.fromId, 'friend_accepted', `${u.name} accepted your friend request`, `/profile/${d.currentUserId}`, d.currentUserId) : d.notifications,
      };
    }),
    removeFriend: (otherId: string) => update((d) => ({ ...d, friendships: d.friendships.filter(([a, b]) => !((a === otherId && b === d.currentUserId) || (b === otherId && a === d.currentUserId))) })),

    openConversation: (otherId: string) => {
      const existing = data.conversations.find((c) => c.participants.includes(me) && c.participants.includes(otherId));
      if (existing) return existing.id;
      const id = uid('cv');
      update((d) => ({ ...d, conversations: [{ id, participants: [d.currentUserId, otherId], messages: [], lastRead: { [d.currentUserId]: now() } }, ...d.conversations] }));
      return id;
    },
    sendMessage: (convId: string, msg: Omit<Message, 'id' | 'senderId' | 'createdAt'>) => update((d) => {
      const c = d.conversations.find((x) => x.id === convId);
      if (!c) return d;
      const other = c.participants.find((p) => p !== d.currentUserId)!;
      const u = d.users.find((x) => x.id === d.currentUserId)!;
      const recentUnreadNotif = d.notifications.some((n) => n.userId === other && n.type === 'message' && !n.read && n.link === `/messages/${convId}`);
      return {
        ...d,
        conversations: d.conversations.map((x) => x.id !== convId ? x : {
          ...x, messages: [...x.messages, { ...msg, id: uid('m'), senderId: d.currentUserId, createdAt: now() }], lastRead: { ...x.lastRead, [d.currentUserId]: now() },
        }),
        notifications: recentUnreadNotif ? d.notifications : notify(d, other, 'message', `${u.name} sent you a message`, `/messages/${convId}`, d.currentUserId),
      };
    }),
    markConversationRead: (convId: string) => update((d) => ({
      ...d,
      conversations: d.conversations.map((x) => (x.id === convId ? { ...x, lastRead: { ...x.lastRead, [d.currentUserId]: now() } } : x)),
    })),

    markNotification: (id: string, read = true) => update((d) => ({ ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, read } : n)) })),
    markAllNotifications: () => update((d) => ({ ...d, notifications: d.notifications.map((n) => (n.userId === d.currentUserId ? { ...n, read: true } : n)) })),
    deleteNotification: (id: string) => update((d) => ({ ...d, notifications: d.notifications.filter((n) => n.id !== id) })),

    createWant: (w: Omit<Want, 'id' | 'userId' | 'status' | 'createdAt' | 'responses'>) => update((d) => ({
      ...d, wants: [{ ...w, id: uid('w'), userId: d.currentUserId, status: 'open', createdAt: now(), responses: [] }, ...d.wants],
    })),
    updateWant: (id: string, patch: Partial<Want>) => update((d) => ({ ...d, wants: d.wants.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),
    deleteWant: (id: string) => update((d) => ({ ...d, wants: d.wants.filter((w) => w.id !== id) })),
    respondWant: (id: string, message: string, listingId?: string) => update((d) => {
      const w = d.wants.find((x) => x.id === id);
      if (!w) return d;
      const u = d.users.find((x) => x.id === d.currentUserId)!;
      return {
        ...d,
        wants: d.wants.map((x) => (x.id === id ? { ...x, responses: [...x.responses, { id: uid('wr'), userId: d.currentUserId, message, listingId, createdAt: now() }] } : x)),
        notifications: notify(d, w.userId, 'want_response', `${u.name} can help with "${w.title}"`, '/want-list', d.currentUserId),
      };
    }),

    toggleCommunity: (id: string) => update((d) => ({
      ...d,
      communities: d.communities.map((c) => c.id !== id ? c : {
        ...c, memberIds: c.memberIds.includes(d.currentUserId) ? c.memberIds.filter((m) => m !== d.currentUserId) : [...c.memberIds, d.currentUserId],
      }),
    })),
    postToCommunity: (id: string, text: string, listingId?: string) => update((d) => ({
      ...d,
      communities: d.communities.map((c) => (c.id !== id ? c : { ...c, posts: [{ id: uid('p'), userId: d.currentUserId, text, listingId, createdAt: now() }, ...c.posts] })),
    })),

    updateProfile: (patch: Partial<User>) => update((d) => ({ ...d, users: d.users.map((u) => (u.id === d.currentUserId ? { ...u, ...patch } : u)) })),
    updateSettings: (patch: Partial<UserSettings>) => update((d) => ({
      ...d, settings: { ...d.settings, [d.currentUserId]: { ...(d.settings[d.currentUserId] ?? defaultSettings()), ...patch } },
    })),
  }), [update, data.conversations, me]);

  const currentUser = getUser(me)!;
  const myNotifications = useMemo(() => data.notifications.filter((n) => n.userId === me), [data.notifications, me]);
  const unreadNotifications = myNotifications.filter((n) => !n.read).length;
  const unreadMessages = useMemo(() => data.conversations.filter((c) => c.participants.includes(me)).reduce((acc, c) => {
    const lr = c.lastRead[me] ?? '';
    return acc + c.messages.filter((m) => m.senderId !== me && m.createdAt > lr).length;
  }, 0), [data.conversations, me]);
  const savedIds = data.saved[me] ?? [];
  const settings = data.settings[me] ?? defaultSettings();

  return {
    data, me, currentUser, getUser, getListing, isFriend, friendsOf, myNotifications, unreadNotifications, unreadMessages,
    savedIds, settings, storageError, ...actions,
  };
}

export type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be inside AppStoreProvider');
  return v;
}
