import { Card as ProfileCard } from '@/data/profileData';
import { MatchedProfile } from '@/components/ui/SwipeCards';
import { Conversation, Message, ChatUser } from '@/types/chat';
import { addConversation, addMessage, getConversationsBetweenUsers } from '@/data/chatData';

interface SwipeRightParams {
  // Card being swiped
  cardId: string; // Changed to string to support UUIDs
  targetUser: MatchedProfile; // Use MatchedProfile instead of ProfileCard
  
  // Current user context
  currentUserId: string; // From auth context
  currentUserProfile?: any; // Current user's profile data from auth context
  
  // State management functions
  setCards: React.Dispatch<React.SetStateAction<MatchedProfile[]>>;
  setLastRemovedCard: React.Dispatch<React.SetStateAction<MatchedProfile | null>>;
  cards: MatchedProfile[];
  
  // Optional: Analytics/tracking
  timestamp?: Date;
  swipeMethod?: 'drag' | 'button'; // How the swipe was triggered
  
  // Optional: Callback functions
  onSwipeComplete?: (action: 'like', targetUser: MatchedProfile, conversation: Conversation) => void;
  onError?: (error: Error) => void;
  onConversationCreated?: (conversation: Conversation) => void;
}

export const handleSwipeRight = async ({
  cardId,
  targetUser,
  currentUserId,
  currentUserProfile,
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
        matchedAt: timestamp,
        user1Profile: currentUserProfile,
        user2Profile: targetUser.profile || targetUser // Pass the profile data
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

async function createConversation({ user1Id, user2Id, matchedAt, user1Profile, user2Profile }: {
  user1Id: string;
  user2Id: string;
  matchedAt: Date;
  user1Profile?: any; // The current user's profile data
  user2Profile?: any; // The matched user's profile data
}): Promise<Conversation> {
  const conversation: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user1Id,
    user2Id,
    createdAt: matchedAt,
    isActive: true,
    // Store profile data for easy access
    user1Profile: user1Profile ? {
      id: user1Profile.id || user1Id,
      name: getUserDisplayNameFromProfile(user1Profile),
      profileImage: getUserProfileImageFromProfile(user1Profile),
      course: user1Profile.course,
      university: user1Profile.university
    } : undefined,
    user2Profile: user2Profile ? {
      id: user2Profile.id || user2Id,
      name: getUserDisplayNameFromProfile(user2Profile),
      profileImage: getUserProfileImageFromProfile(user2Profile),
      course: user2Profile.course,
      university: user2Profile.university
    } : undefined
  };
  
  // Add to mock storage (replace with API call)
  addConversation(conversation);
  
  return conversation;
}

async function generateAIIcebreaker({ targetUser, currentUserId }: {
  targetUser: MatchedProfile;
  currentUserId?: string;
}): Promise<string> {
  try {
    const response = await fetch('/api/ai/icebreaker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetUser: {
          name: targetUser.name,
          interests: targetUser.interests,
          skills: targetUser.skills,
          course: targetUser.course,
          university: targetUser.university,
        },
        currentUser: {
          id: currentUserId,
          // Add more current user context if available
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.icebreaker) {
      return data.icebreaker;
    } else {
      throw new Error('No icebreaker returned from API');
    }
    
  } catch (error) {
    console.error('Error generating AI icebreaker:', error);
    
    // Fallback to template-based icebreaker
    return generateFallbackIcebreaker(targetUser);
  }
}

// Fallback function when AI fails
function generateFallbackIcebreaker(targetUser: MatchedProfile): string {
  const interests = targetUser.interests.slice(0, 2);
  const skills = targetUser.skills.slice(0, 2);
  
  const networkingTemplates = [
    `Hey ${targetUser.name}! I noticed you're into ${interests.join(' and ')}. I'm exploring those areas too - any resources or projects you'd recommend? 🚀`,
    `Hi ${targetUser.name}! Your ${targetUser.course} studies sound fascinating! I'd love to hear about any cool projects you've worked on recently 💡`,
    `Hello ${targetUser.name}! I see you have skills in ${skills.join(' and ')}. I'm working on something similar - would love to connect and maybe collaborate! ⚡`,
    `Hey there ${targetUser.name}! ${targetUser.university} has such a great reputation. How are you finding the program? Always looking to connect with fellow students! 📚`,
    `Hi ${targetUser.name}! Your background in ${interests[0]} looks really interesting. Any chance you'd want to grab coffee and chat about it sometime? ☕`,
    `Hello! I see we might have some overlapping interests. Would love to connect and see if there are any collaboration opportunities! ✨`,
    `Hey ${targetUser.name}! Your skill set looks impressive. I'm always looking to learn from other students - any tips for someone getting started? 🎯`
  ];
  
  return networkingTemplates[Math.floor(Math.random() * networkingTemplates.length)];
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

function showConversationNotification(targetUser: MatchedProfile) {
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
  // First try to find in cached profile data (for backward compatibility)
  const user = profileData.find(p => p.id.toString() === userId);
  if (user) return user.name;
  
  // For UUID-based users, we need to fetch from database
  // This is a temporary fallback - ideally we should pass the actual profile data
  return 'Loading...';
}

export function getUserProfileImage(userId: string, profileData: ProfileCard[]): string {
  // First try to find in cached profile data (for backward compatibility)
  const user = profileData.find(p => p.id.toString() === userId);
  if (user) return user.profileImage;
  
  // For UUID-based users, we need to fetch from database
  // This is a temporary fallback - ideally we should pass the actual profile data
  return '/default-avatar.png';
}

// Enhanced functions that work with actual user profiles
export function getUserDisplayNameFromProfile(profile: any): string {
  return profile?.full_name || profile?.name || 'Unknown User';
}

export function getUserProfileImageFromProfile(profile: any): string {
  return profile?.avatar_url || profile?.profileImage || `https://images.unsplash.com/photo-1494790108755-6d2b9d80580a?q=80&w=400&auto=format&fit=crop`;
}

// Enhanced conversation helper functions
export function getOtherUserProfile(conversation: Conversation, currentUserId: string): ChatUser | null {
  if (conversation.user1Id === currentUserId && conversation.user2Profile) {
    return conversation.user2Profile;
  } else if (conversation.user2Id === currentUserId && conversation.user1Profile) {
    return conversation.user1Profile;
  }
  return null;
}

export function getUserDisplayNameFromConversation(conversation: Conversation, currentUserId: string, fallbackProfileData: ProfileCard[]): string {
  const otherUserProfile = getOtherUserProfile(conversation, currentUserId);
  if (otherUserProfile) {
    return otherUserProfile.name;
  }
  
  // Fallback to old method
  const otherUserId = getOtherUserId(conversation, currentUserId);
  return getUserDisplayName(otherUserId, fallbackProfileData);
}

export function getUserProfileImageFromConversation(conversation: Conversation, currentUserId: string, fallbackProfileData: ProfileCard[]): string {
  const otherUserProfile = getOtherUserProfile(conversation, currentUserId);
  if (otherUserProfile) {
    return otherUserProfile.profileImage;
  }
  
  // Fallback to old method
  const otherUserId = getOtherUserId(conversation, currentUserId);
  return getUserProfileImage(otherUserId, fallbackProfileData);
}

export function generateConversationPreview(lastMessage: Message | undefined): string {
if (!lastMessage) return 'Start networking...';
  
  if (lastMessage.isIcebreaker) {
    return '🤖 Orbit Icebreaker sent';
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
