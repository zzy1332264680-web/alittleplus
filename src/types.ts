/**
 * 功能：定义应用中使用的所有 TypeScript 类型
 */

/** 页面路由类型 */
export type Page = 'dashboard' | 'market' | 'forum' | 'chat' | 'profile' | 'settings' | 'help' | 'login' | 'register' | 'new-post' | 'new-market-post' | 'market-detail' | 'forum-detail' | 'edit-profile';

/** 用户资料（与数据库 profiles 表对应） */
export interface ProfileData {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

/** 帖子（含作者信息，API 返回格式） */
export interface PostWithAuthor {
  id: string;
  author_id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  visibility: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  is_liked?: boolean;
  author: {
    id: string;
    username: string;
    email?: string;
    avatar_url: string;
  };
}

/** 评论（含作者信息） */
export interface CommentWithAuthor {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

/** 商品（含卖家信息，API 返回格式） */
export interface ProductWithSeller {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  category: string;
  condition: string;
  location: string;
  images: string[];
  status: string;
  created_at: string;
  updated_at: string;
  seller: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

/** 会话列表项（含对方用户信息和最后消息） */
export interface ConversationItem {
  id: string;
  participant: {
    id: string;
    username: string;
    avatar_url: string;
  };
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

/** 消息（含发送者信息） */
export interface MessageWithSender {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

/* ============================================
 * 以下为旧类型定义，保留用于向后兼容
 * ============================================ */

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorHandle: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  category: string;
  likes: number;
  comments: number;
  views: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  description: string;
  location: string;
  time: string;
  condition: string;
  image: string;
  seller: {
    name: string;
    avatar: string;
    rating: string;
    sales: number;
  };
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  status: 'online' | 'offline' | 'away';
}
