import { useLocation } from 'wouter';
import { useStore } from '@/context/AppStore';

/** Opens (or creates) a conversation with a user and optionally pre-shares a listing. */
export function useMessageOwner() {
  const { openConversation } = useStore();
  const [, nav] = useLocation();
  return (ownerId: string, listingId?: string) => {
    const id = openConversation(ownerId);
    nav(`/messages/${id}${listingId ? `?share=${listingId}` : ''}`);
  };
}
