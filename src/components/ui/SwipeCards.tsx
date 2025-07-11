import React, { useState } from "react";
import { useSwipe } from "@/context/SwipeContext";
import SwipeStack from "./SwipeStack";

const SwipeCards = () => {
  const { cards, setCards, lastRemovedCard, setLastRemovedCard } = useSwipe();

  return (
    <SwipeStack
      cards={cards}
      setCards={setCards}
      lastRemovedCard={lastRemovedCard}
      setLastRemovedCard={setLastRemovedCard}
    />
  );
};

export default SwipeCards;