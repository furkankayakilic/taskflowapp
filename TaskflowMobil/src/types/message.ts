import { User } from './user';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

export interface SendMessagePayload {
  content: string;
  receiverId: string;
} 