import { Conversation, Message } from '@/types/chat';

// Mock chat storage - replace with database/API calls later
export let conversations: Conversation[] = [];
export let messages: Message[] = [];

export const addConversation = (conversation: Conversation) => {
  conversations.push(conversation);
};

export const addMessage = (message: Message) => {
  messages.push(message);
  
  // Update conversation's last message
  const conversationIndex = conversations.findIndex(conv => conv.id === message.conversationId);
  if (conversationIndex !== -1) {
    conversations[conversationIndex].lastMessage = message;
  }
};

export const getConversationById = (id: string) => {
  return conversations.find(conv => conv.id === id);
};

export const getConversationsBetweenUsers = (user1Id: string, user2Id: string) => {
  return conversations.find(conv => 
    (conv.user1Id === user1Id && conv.user2Id === user2Id) ||
    (conv.user1Id === user2Id && conv.user2Id === user1Id)
  );
};

// NEW: Get all conversations for a specific user
export const getConversationsForUser = (userId: string) => {
  return conversations.filter(conv => 
    conv.user1Id === userId || conv.user2Id === userId
  );
};

export const getMessagesByConversation = (conversationId: string) => {
  return messages.filter(msg => msg.conversationId === conversationId);
};

// Helper to get all conversations (for development/debugging)
export const getAllConversations = () => {
  return conversations;
};

// Helper to get all messages (for development/debugging)
export const getAllMessages = () => {
  return messages;
};