import React, { useState } from "react";
import { Card as ProfileCard, profileData } from "@/data/profileData";
import SwipeStack from "./SwipeStack";

const SwipeCards = () => {
  const [cards, setCards] = useState<ProfileCard[]>(profileData);
  const [lastRemovedCard, setLastRemovedCard] = useState<ProfileCard | null>(null);

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