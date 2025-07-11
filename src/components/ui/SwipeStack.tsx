import React, { useState } from "react";
import SwipeCard from "./SwipeCard";
import SwipeActions from "./SwipeActions";
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
  const handleSwipeLeft = () => {
    if (cards.length > 0) {
      const frontCard = cards[cards.length - 1];
      setLastRemovedCard(frontCard);
      setCards((prev) => prev.filter((card) => card.id !== frontCard.id));
      console.log("Swiped left on card:", frontCard.name);
    }
  };

  const handleSwipeRight = () => {
    if (cards.length > 0) {
      const frontCard = cards[cards.length - 1];
      setLastRemovedCard(frontCard);
      setCards((prev) => prev.filter((card) => card.id !== frontCard.id));
      console.log("Swiped right on card:", frontCard.name);
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
        {cards.map((card) => {
          return (
            <SwipeCard 
              key={card.id} 
              cards={cards} 
              setCards={setCards} 
              setLastRemovedCard={setLastRemovedCard} 
              {...card} 
            />
          );
        })}
      </div>
      
      <SwipeActions
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onUndo={handleUndo}
        canSwipe={cards.length > 0}
        canUndo={!!lastRemovedCard}
      />
    </div>
  );
};

export default SwipeStack;
