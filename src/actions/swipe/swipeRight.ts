import { Card as ProfileCard } from '@/data/profileData';
import { Conversation, Message } from '@/types/chat';
import { addConversation, addMessage, getConversationsBetweenUsers } from '@/data/chatData';

interface SwipeRightParams {
  // Card being swiped
  cardId: number;
  targetUser: ProfileCard;
  
  // Current user context
  currentUserId: string; // From auth context
  
  // State management functions
  setCards: React.Dispatch<React.SetStateAction<ProfileCard[]>>;
  setLastRemovedCard: React.Dispatch<React.SetStateAction<ProfileCard | null>>;
  cards: ProfileCard[];
  
  // Optional: Analytics/tracking
  timestamp?: Date;
  swipeMethod?: 'drag' | 'button'; // How the swipe was triggered
  
  // Optional: Callback functions
  onSwipeComplete?: (action: 'like', targetUser: ProfileCard, conversation: Conversation) => void;
  onError?: (error: Error) => void;
  onConversationCreated?: (conversation: Conversation) => void;
}

export const handleSwipeRight = async ({
  cardId,
  targetUser,
  currentUserId,
  setCards,
  setLastRemovedCard,
  cards,
  timestamp = new Date(),
  swipeMethod = 'drag',
  onSwipeComplete,
  onError,
  onConversationCreated
}: SwipeRightParams) => {
  try {
    // 1. Remove card from UI immediately for smooth UX
    setLastRemovedCard(targetUser);
    setCards(prev => prev.filter(card => card.id !== cardId));
    
    // 2. Log the like action
    console.log(`User ${currentUserId} liked ${targetUser.name} (ID: ${cardId})`);
    
    // 3. Check if conversation already exists between users
    const existingConversation = getConversationsBetweenUsers(currentUserId, cardId.toString());
    
    let conversation: Conversation;
    
    if (existingConversation) {
      conversation = existingConversation;
      console.log('Using existing conversation:', conversation.id);
    } else {
      // 4. Create new conversation immediately (no match required)
      conversation = await createConversation({
        user1Id: currentUserId,
        user2Id: cardId.toString(),
        matchedAt: timestamp
      });
      console.log('✨ New conversation created:', conversation.id);
      
      // 5. Generate and send AI icebreaker for new conversations
      const icebreaker = await generateAIIcebreaker({
        targetUser
      });
      
      await sendMessage({
        conversationId: conversation.id,
        senderId: 'AI-Assistant',
        message: icebreaker,
        isIcebreaker: true
      });
      
      console.log(`🤖 AI icebreaker sent: "${icebreaker}"`);
    }
    
    // 6. Show notification that conversation is ready
    showConversationNotification(targetUser);
    
    // 7. Notify parent component about the conversation
    onConversationCreated?.(conversation);
    
    // 8. Call completion callback with conversation
    onSwipeComplete?.('like', targetUser, conversation);
    
  } catch (error) {
    console.error('Error handling swipe right:', error);
    
    // Revert UI changes on error
    setCards(cards);
    setLastRemovedCard(null);
    
    onError?.(error as Error);
  }
};

// Helper Functions

async function createConversation({ user1Id, user2Id, matchedAt }: {
  user1Id: string;
  user2Id: string;
  matchedAt: Date;
}): Promise<Conversation> {
  const conversation: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user1Id,
    user2Id,
    createdAt: matchedAt,
    isActive: true
  };
  
  // Add to mock storage (replace with API call)
  addConversation(conversation);
  
  return conversation;
}

async function generateAIIcebreaker({ targetUser }: {
  targetUser: ProfileCard;
}): Promise<string> {
  // Generate personalized icebreaker based on user interests/skills
  const interests = targetUser.interests.slice(0, 2);
  const skills = targetUser.skills.slice(0, 2);
  
  const icebreakers = [
    `Hey ${targetUser.name}! I noticed you're into ${interests.join(' and ')}. What got you started with that? 😊`,
    `Hi ${targetUser.name}! Your ${targetUser.course} studies sound fascinating! What's been your favorite project so far?`,
    `Hello ${targetUser.name}! I see you have skills in ${skills.join(' and ')}. Any exciting projects you're working on? 🚀`,
    `Hey there ${targetUser.name}! ${targetUser.university} has such a great reputation. How are you finding your time there?`,
    `Hi ${targetUser.name}! I love that you're into ${interests[0]}. Do you have any recommendations for someone just getting started? ✨`
  ];
  
  // Return a random icebreaker
  return icebreakers[Math.floor(Math.random() * icebreakers.length)];
}

async function sendMessage({ conversationId, senderId, message, isIcebreaker = false }: {
  conversationId: string;
  senderId: string;
  message: string;
  isIcebreaker?: boolean;
}): Promise<Message> {
  const newMessage: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    conversationId,
    senderId,
    content: message,
    timestamp: new Date(),
    isRead: false,
    isIcebreaker
  };
  
  // Add to mock storage (replace with API call)
  addMessage(newMessage);
  
  console.log(`📨 Message sent to conversation ${conversationId}: ${message}`);
  
  return newMessage;
}

function showConversationNotification(targetUser: ProfileCard) {
  // Show notification that conversation is ready
  console.log(`💬 Conversation ready with ${targetUser.name}! Check your chats.`);
  
  // TODO: Implement actual notification UI
  // Could trigger a toast notification or update global state
}

// Additional helper functions for chat functionality

export function getOtherUserId(conversation: Conversation, currentUserId: string): string {
  return conversation.user1Id === currentUserId ? conversation.user2Id : conversation.user1Id;
}

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

export function getUserDisplayName(userId: string, profileData: ProfileCard[]): string {
  const user = profileData.find(p => p.id.toString() === userId);
  return user ? user.name : 'Unknown User';
}

export function getUserProfileImage(userId: string, profileData: ProfileCard[]): string {
  const user = profileData.find(p => p.id.toString() === userId);
  return user ? user.profileImage : '/default-avatar.png';
}

export function generateConversationPreview(lastMessage: Message | undefined): string {
  if (!lastMessage) return 'Start a conversation...';
  
  if (lastMessage.isIcebreaker) {
    return '🤖 AI Icebreaker sent';
  }
  
  // Truncate long messages
  if (lastMessage.content.length > 50) {
    return lastMessage.content.substring(0, 47) + '...';
  }
  
  return lastMessage.content;
}

export function sortConversationsByLastMessage(conversations: Conversation[]): Conversation[] {
  return conversations.sort((a, b) => {
    if (!a.lastMessage && !b.lastMessage) return 0;
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    
    return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
  });
}

// Utility function to check if user has unread messages in a conversation
export function hasUnreadMessages(conversationId: string, currentUserId: string, messages: Message[]): boolean {
  const conversationMessages = messages.filter(msg => msg.conversationId === conversationId);
  return conversationMessages.some(msg => !msg.isRead && msg.senderId !== currentUserId);
}

// Function to mark messages as read
export function markMessagesAsRead(conversationId: string, currentUserId: string, messages: Message[]): void {
  messages.forEach(msg => {
    if (msg.conversationId === conversationId && msg.senderId !== currentUserId) {
      msg.isRead = true;
    }
  });
}