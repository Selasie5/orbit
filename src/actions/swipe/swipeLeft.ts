// import { Card as ProfileCard } from '@/data/profileData';
import { MatchedProfile } from '@/components/ui/SwipeCards';

interface SwipeLeftParams {
  // Card being swiped
  cardId: string; // Changed to string to support UUIDs
  targetUser: MatchedProfile;
  
  // Current user context
  currentUserId: string; // From auth context
  
  // State management functions
  setCards: React.Dispatch<React.SetStateAction<MatchedProfile[]>>;
  setLastRemovedCard: React.Dispatch<React.SetStateAction<MatchedProfile | null>>;
  cards: MatchedProfile[];
  
  // Optional: Analytics/tracking
  timestamp?: Date;
  swipeMethod?: 'drag' | 'button'; // How the swipe was triggered
  
  // Optional: Callback functions
  onSwipeComplete?: (action: 'reject', targetUser: MatchedProfile) => void;
  onError?: (error: Error) => void;
}

export const handleSwipeLeft = async ({
  cardId,
  targetUser,
  currentUserId,
  setCards,
  setLastRemovedCard,
  cards,
  // timestamp = new Date(),
  // swipeMethod = 'drag',
  onSwipeComplete,
  onError
}: SwipeLeftParams) => {
  try {
    // 1. Remove card from UI immediately for smooth UX
    setLastRemovedCard(targetUser);
    setCards(prev => prev.filter(card => card.id !== cardId));
    
    // 2. Log the reject action
    console.log(`User ${currentUserId} rejected ${targetUser.name} (ID: ${cardId})`);
    
    // 3. TODO: Send reject to backend API
    // const response = await fetch('/api/swipe/reject', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     userId: currentUserId,
    //     targetUserId: cardId,
    //     action: 'reject',
    //     timestamp,
    //     method: swipeMethod
    //   })
    // });
    
    // 4. TODO: Analytics tracking
    // trackSwipeEvent({
    //   action: 'reject',
    //   userId: currentUserId,
    //   targetUserId: cardId,
    //   method: swipeMethod
    // });
    
    // 5. Call completion callback
    onSwipeComplete?.('reject', targetUser);
    
  } catch (error) {
    console.error('Error handling swipe left:', error);
    
    // Revert UI changes on error
    setCards(cards);
    setLastRemovedCard(null);
    
    onError?.(error as Error);
  }
};
