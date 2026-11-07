export type ListingType = 'sell' | 'giveaway' | 'borrow' | 'exchange';
export type Condition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Well Used';
export type Availability = 'Available' | 'Reserved' | 'Unavailable';
export type RequestType = 'buy' | 'giveaway' | 'borrow' | 'exchange';
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';

export interface User {
  id: string;
  name: string;
  username: string;
  campus: string;
  department: string;
  year: string;
  bio: string;
  interests: string[];
  hue: number;
  online: boolean;
  email: string;
  avatar?: string;
  joinedAt: string;
}

export interface Comment { id: string; userId: string; text: string; createdAt: string }

export interface Listing {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  type: ListingType;
  price?: number;
  quantity: number;
  condition: Condition;
  campus: string;
  location: string;
  availability: Availability;
  createdAt: string;
  borrowDuration?: string;
  returnConditions?: string;
  deposit?: number;
  availableFrom?: string;
  availableTo?: string;
  desiredItem?: string;
  pickupDetails?: string;
  communityId?: string;
  likes: string[];
  comments: Comment[];
}

export interface ItemRequest {
  id: string;
  listingId: string;
  requesterId: string;
  ownerId: string;
  type: RequestType;
  quantity: number;
  message: string;
  startDate?: string;
  returnDate?: string;
  duration?: string;
  offeredItem?: string;
  offeredCondition?: string;
  status: RequestStatus;
  confirmations: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  requestId: string;
  fromId: string;
  toId: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface WantResponse { id: string; userId: string; listingId?: string; message: string; createdAt: string }

export interface Want {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  condition: string;
  neededBy: string;
  campus: string;
  status: 'open' | 'fulfilled';
  createdAt: string;
  responses: WantResponse[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  listingId?: string;
  attachment?: { name: string; dataUrl: string; isImage: boolean };
}

export interface Conversation {
  id: string;
  participants: [string, string];
  messages: Message[];
  lastRead: Record<string, string>;
}

export type NotificationType =
  | 'friend_request' | 'friend_accepted' | 'message' | 'item_request' | 'borrow_request'
  | 'exchange_request' | 'request_accepted' | 'request_rejected' | 'listing_update' | 'handover' | 'want_response';

export interface AppNotification {
  id: string;
  userId: string;
  actorId?: string;
  type: NotificationType;
  text: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface FriendRequest { id: string; fromId: string; toId: string; createdAt: string }

export interface CommunityPost { id: string; userId: string; text: string; createdAt: string; listingId?: string }

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberIds: string[];
  baseMembers: number;
  posts: CommunityPost[];
}

export interface UserSettings {
  visibility: 'public' | 'campus' | 'friends';
  showOnline: boolean;
  notify: Record<string, boolean>;
}

export interface AppData {
  version: number;
  currentUserId: string;
  loggedOut: boolean;
  users: User[];
  listings: Listing[];
  requests: ItemRequest[];
  reviews: Review[];
  wants: Want[];
  conversations: Conversation[];
  notifications: AppNotification[];
  friendships: [string, string][];
  friendRequests: FriendRequest[];
  communities: Community[];
  saved: Record<string, string[]>;
  settings: Record<string, UserSettings>;
}
