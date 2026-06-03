export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  qualityScore: number;
  dailyXpEarned: number;
  lastXpReset: number; // Timestamp in ms
  shadowBanned: boolean;
  role: 'user' | 'admin';
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // lucide icon name or emoji
}

export interface Thread {
  id: string;
  categoryId: string;
  authorId: string;
  authorName: string;
  title: string;
  slug: string;
  content: string;
  tags: string[];
  upvotes: number;
  isFeatured: boolean;
  createdAt: number;
  commentCount: number;
}

export interface Comment {
  id: string;
  threadId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  content: string;
  upvotes: number;
  isSolution: boolean;
  createdAt: number;
}

export interface XpLog {
  id: string;
  userId: string;
  action: 'CREATE_THREAD' | 'ADD_COMMENT' | 'RECEIVED_UPVOTE' | 'MARKED_SOLUTION';
  amount: number;
  timestamp: number;
  targetId: string; // The ID of the thread or comment
}

export interface Card {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
  imageUrl: string;
  dropChance: number; // 0.0 to 1.0
}

export interface UserCard {
  id: string; // Usually userId_cardId
  userId: string;
  cardId: string;
  quantity: number;
  acquiredAt: number;
}
