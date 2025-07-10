import React, { Dispatch, SetStateAction, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Card as ProfileCard, profileData } from "@/data/profileData";
import { XMarkIcon, HeartIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

const SwipeCards = () => {
  const [cards, setCards] = useState<ProfileCard[]>(profileData);
  const [lastRemovedCard, setLastRemovedCard] = useState<ProfileCard | null>(null);
  const [exitX, setExitX] = useState(0);

  const handleSwipeLeft = () => {
    if (cards.length > 0) {
      const frontCard = cards[cards.length - 1];
      setLastRemovedCard(frontCard);
      setExitX(-200); // Animate to the left off-screen
      setTimeout(() => {
        setCards((prev) => prev.filter((card) => card.id !== frontCard.id));
        setExitX(0);
      }, 500);
    }
  };

  const handleSwipeRight = () => {
    if (cards.length > 0) {
      const frontCard = cards[cards.length - 1];
      setLastRemovedCard(frontCard);
      setExitX(200); // Animate to the right off-screen
      setTimeout(() => {
        setCards((prev) => prev.filter((card) => card.id !== frontCard.id));
        setExitX(0);
      }, 500);
    }
  };

  const handleUndo = () => {
    if (lastRemovedCard) {
      setCards((prev) => [...prev, lastRemovedCard]);
      setLastRemovedCard(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-[32rem] w-80">
        {cards.map((card) => {
          return (
            <Card 
              key={card.id} 
              cards={cards} 
              setCards={setCards} 
              setLastRemovedCard={setLastRemovedCard} 
              exitX={exitX}
              {...card} 
            />
          );
        })}
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSwipeLeft}
          disabled={cards.length === 0}
          className="flex items-center justify-center w-14 h-14 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full shadow-lg transition-colors"
        >
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={handleUndo}
          disabled={!lastRemovedCard}
          className="flex items-center justify-center w-12 h-12 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full shadow-lg transition-colors"
        >
          <ArrowUturnLeftIcon className="w-5 h-5 text-white" />
        </button>
        
        <button
          onClick={handleSwipeRight}
          disabled={cards.length === 0}
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full shadow-lg transition-colors"
        >
          <HeartIcon className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
};

const Card = ({
  id,
  name,
  profileImage,
  course,
  university,
  skills,
  interests,
  age,
  setCards,
  cards,
  setLastRemovedCard,
  exitX,
}: {
  id: number;
  name: string;
  profileImage: string;
  course: string;
  university: string;
  skills: string[];
  interests: string[];
  age: number;
  setCards: Dispatch<SetStateAction<ProfileCard[]>>;
  cards: ProfileCard[];
  setLastRemovedCard: Dispatch<SetStateAction<ProfileCard | null>>;
  exitX: number;
}) => {
  const x = useMotionValue(0);

  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  const isFront = id === cards[cards.length - 1].id;

  const rotate = useTransform(() => {
    const offset = isFront ? 0 : id % 2 ? 6 : -6;
    return `${rotateRaw.get() + offset}deg`;
  });

  // Handle button-triggered animations
  React.useEffect(() => {
    if (isFront && exitX !== 0) {
      // Smoothly animate the card off-screen
      animate(x, exitX, {
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.5
      });
    }
  }, [exitX, isFront, x]);

  const handleDragEnd = (): void => {
    if (Math.abs(x.get()) > 50) {
      const currentCard = cards.find((card) => card.id === id);
      if (currentCard) {
        setLastRemovedCard(currentCard);
      }
      setCards((pv) => pv.filter((v) => v.id !== id));
    }
  };

  return (
    <motion.div
      className="absolute h-[32rem] w-80 origin-bottom rounded-lg bg-white shadow-lg overflow-hidden hover:cursor-grab active:cursor-grabbing"
      style={{
        x,
        opacity,
        rotate,
        boxShadow: isFront
          ? "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)"
          : undefined,
      }}
      animate={{
        scale: isFront ? 1 : 0.98,
      }}
      drag={isFront && exitX === 0 ? "x" : false}
      dragConstraints={{
        left: -200,
        right: 200,
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="relative h-full">
        {/* Background image covering the entire card */}
        <img
          src={profileImage}
          alt={`${name}'s profile`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Gradient overlay that fades from white to transparent */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
        
        {/* Content area */}
        <div className="relative h-full flex flex-col justify-end p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 drop-shadow-lg">{name}, {age}</h2>
            <p className="text-base text-gray-800 mb-1 drop-shadow-md">{course}</p>
            <p className="text-sm text-gray-700 mb-3 drop-shadow-md">{university}</p>
          </div>
          
          <div>
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-900 mb-2 drop-shadow-md">Skills:</p>
              <div className="flex flex-wrap gap-1">
                {skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="text-xs bg-blue-500/90 text-white px-2 py-1 rounded-full backdrop-blur-sm shadow-md">
                    {skill}
                  </span>
                ))}
                {skills.length > 3 && (
                  <span className="text-xs text-gray-800 drop-shadow-md">+{skills.length - 3} more</span>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2 drop-shadow-md">Interests:</p>
              <div className="flex flex-wrap gap-1">
                {interests.slice(0, 3).map((interest, index) => (
                  <span key={index} className="text-xs bg-green-500/90 text-white px-2 py-1 rounded-full backdrop-blur-sm shadow-md">
                    {interest}
                  </span>
                ))}
                {interests.length > 3 && (
                  <span className="text-xs text-gray-800 drop-shadow-md">+{interests.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCards;