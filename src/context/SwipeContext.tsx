"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Card as ProfileCard, profileData } from '@/data/profileData';

interface SwipeContextType {
  cards: ProfileCard[];
  setCards: React.Dispatch<React.SetStateAction<ProfileCard[]>>;
  lastRemovedCard: ProfileCard | null;
  setLastRemovedCard: React.Dispatch<React.SetStateAction<ProfileCard | null>>;
  removedCardIds: Set<number>;
}

const SwipeContext = createContext<SwipeContextType | undefined>(undefined);

export const SwipeProvider = ({ children }: { children: React.ReactNode }) => {
  const [removedCardIds, setRemovedCardIds] = useState<Set<number>>(new Set());
  const [cards, setCards] = useState<ProfileCard[]>([]);
  const [lastRemovedCard, setLastRemovedCard] = useState<ProfileCard | null>(null);

  // Initialize cards excluding already swiped ones
  useEffect(() => {
    const availableCards = profileData.filter(card => !removedCardIds.has(card.id));
    setCards(availableCards);
  }, [removedCardIds]);

  // Custom setCards that also tracks removed cards
  const setCardsWithTracking = (newCards: React.SetStateAction<ProfileCard[]>) => {
    setCards(prev => {
      const updated = typeof newCards === 'function' ? newCards(prev) : newCards;
      // Track which cards were removed
      const currentIds = new Set(updated.map(card => card.id));
      const originalIds = new Set(profileData.map(card => card.id));
      const newRemovedIds = new Set([...removedCardIds]);
      
      originalIds.forEach(id => {
        if (!currentIds.has(id)) {
          newRemovedIds.add(id);
        }
      });
      
      setRemovedCardIds(newRemovedIds);
      return updated;
    });
  };

  return (
    <SwipeContext.Provider value={{
      cards,
      setCards: setCardsWithTracking,
      lastRemovedCard,
      setLastRemovedCard,
      removedCardIds
    }}>
      {children}
    </SwipeContext.Provider>
  );
};

export const useSwipe = () => {
  const context = useContext(SwipeContext);
  if (!context) {
    throw new Error('useSwipe must be used within SwipeProvider');
  }
  return context;
};