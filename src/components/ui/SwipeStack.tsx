import React, { useState } from "react";
import { Card as ProfileCard } from "@/data/profileData";
import SwipeCard from "./SwipeCard";
import SwipeActions from "./SwipeActions";

interface SwipeStackProps {
  cards: ProfileCard[];
  setCards: React.Dispatch<React.SetStateAction<ProfileCard[]>>;
  lastRemovedCard: ProfileCard | null;
  setLastRemovedCard: React.Dispatch<React.SetStateAction<ProfileCard | null>>;
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
      <div className="grid h-[30rem] w-72 place-items-center">
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
