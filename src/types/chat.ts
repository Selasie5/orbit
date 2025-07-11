export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  lastMessage?: Message;
  isActive: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isIcebreaker?: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  profileImage: string;
}