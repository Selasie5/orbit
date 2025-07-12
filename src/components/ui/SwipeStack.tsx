import React, { useState } from "react";
import SwipeCard from "./SwipeCard";
import SwipeActions from "./SwipeActions";

import { handleSwipeRight } from "@/actions/swipe/swipeRight";
import { handleSwipeLeft } from "@/actions/swipe/swipeLeft";
import { useAuth } from "@/context/authContext";

import { MatchedProfile } from "./SwipeCards";


interface SwipeStackProps {
  cards: MatchedProfile[];
  setCards: React.Dispatch<React.SetStateAction<MatchedProfile[]>>;
  lastRemovedCard: MatchedProfile | null;
  setLastRemovedCard: React.Dispatch<React.SetStateAction<MatchedProfile | null>>;
}

const SwipeStack = ({
  cards,
  setCards,
  lastRemovedCard,
  setLastRemovedCard,
}: SwipeStackProps) => {
  const { user } = useAuth(); // Add this line

  const swipeLeft = () => {
    if (cards.length > 0) {
      const frontCard = cards[cards.length - 1];
      setLastRemovedCard(frontCard);
      setCards((prev) => prev.filter((card) => card.id !== frontCard.id));
      console.log("Swiped left on card:", frontCard.name);
    }
  };

  const swipeRight = () => {
    if (cards.length > 0) {
      const frontCard = cards[cards.length - 1];
      
      handleSwipeRight({
        cardId: frontCard.id,
        targetUser: frontCard,
        currentUserId: user?.id || '',
        setCards,
        setLastRemovedCard,
        cards,
        swipeMethod: 'button',
        onSwipeComplete: (action, user, conversation) => {
          console.log(`✅ ${action} completed for ${user.name} - Conversation: ${conversation.id}`);
        },
        onConversationCreated: (conversation) => {
          console.log(`💬 Ready to chat with ${frontCard.name}! Conversation ID: ${conversation.id}`);
        },
        onError: (error) => {
          console.error('Swipe right error:', error);
        }
      });
    }
  };

  const handleUndo = () => {
    if (lastRemovedCard) {
      setCards((prev) => [...prev, lastRemovedCard]);
      setLastRemovedCard(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="grid h-[32rem] w-80 place-items-center">
        {cards.map((card) => (
          <SwipeCard 
            key={card.id}
            id={card.id}
            name={card.name}
            profileImage={card.profileImage}
            course={card.course}
            university={card.university}
            skills={card.skills}
            interests={card.interests}
            age={card.age}
            matchData={card.matchData}
            profile={card.profile}
            cards={cards}
            setCards={setCards}
            lastRemovedCard={lastRemovedCard}
            setLastRemovedCard={setLastRemovedCard}
            user={user} // Pass user context
          />
        ))}
      </div>
      
      <SwipeActions
        onSwipeLeft={swipeLeft}
        onSwipeRight={swipeRight}
        onUndo={handleUndo}
        canSwipe={cards.length > 0}
        canUndo={!!lastRemovedCard}
      />
    </div>
  );
};

export default SwipeStack;
