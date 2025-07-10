import React, { Dispatch, SetStateAction, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Card as ProfileCard } from "@/data/profileData";

interface SwipeCardProps {
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
}

const SwipeCard = ({
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
}: SwipeCardProps) => {
  const x = useMotionValue(0);
  const [wasFront, setWasFront] = useState(false);

  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  const isFront = id === cards[cards.length - 1].id;

  const rotate = useTransform(() => {
    const offset = isFront ? 0 : id % 2 ? 6 : -6;
    return `${rotateRaw.get() + offset}deg`;
  });

  // Track when card becomes front and animate to center
  React.useEffect(() => {
    if (isFront && !wasFront) {
      // Card just became front, smooth animation to center with slight delay
      setTimeout(() => {
        animate(x, 0, {
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.6
        });
      }, 100); // Small delay to let the scale animation start first
    }
    setWasFront(isFront);
  }, [isFront, wasFront, x]);

  const handleDragEnd = (): void => {
    if (Math.abs(x.get()) > 100) {
      const currentCard = cards.find((card) => card.id === id);
      if (currentCard) {
        setLastRemovedCard(currentCard);
      }
      setCards((pv) => pv.filter((v) => v.id !== id));
    }
  };

  return (
    <motion.div
      className="h-[36rem] w-80 origin-bottom rounded-2xl bg-gradient-to-br from-slate-50 to-white backdrop-blur-sm border border-white/20 shadow-2xl overflow-hidden hover:cursor-grab active:cursor-grabbing"
      style={{
        gridRow: 1,
        gridColumn: 1,
        x,
        opacity,
        rotate,
        transition: "0.125s transform",
        boxShadow: isFront
          ? "0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 0 1px rgb(255 255 255 / 0.1), inset 0 1px 0 rgb(255 255 255 / 0.1)"
          : "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(255 255 255 / 0.05)",
      }}
      animate={{
        scale: isFront ? 1 : 0.96,
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{
        left: 0,
        right: 0,
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
        
        {/* Modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Subtle noise texture overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
        
        {/* Content area with glassmorphism effect */}
        <div className="relative h-full flex flex-col justify-end">
          {/* Glass card for content - now smaller to show more of the image */}
          <div className="mx-4 mb-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl max-h-[40%]">
            <div className="mb-3">
              <h2 className="text-xl font-bold text-white mb-1 tracking-tight leading-tight">{name}, {age}</h2>
              <p className="text-sm text-white/90 mb-0.5 font-medium">{course}</p>
              <p className="text-xs text-white/80 font-light tracking-wide">{university}</p>
            </div>
            
            <div className="space-y-2.5">
              <div>
                <p className="text-[10px] font-semibold text-white/90 mb-1.5 uppercase tracking-wider">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="text-[10px] bg-blue-500/80 text-white px-2 py-1 rounded-full backdrop-blur-sm border border-white/20 font-medium">
                      {skill}
                    </span>
                  ))}
                  {skills.length > 3 && (
                    <span className="text-[10px] text-white/70 self-center ml-1 font-light">+{skills.length - 3} more</span>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-semibold text-white/90 mb-1.5 uppercase tracking-wider">Interests</p>
                <div className="flex flex-wrap gap-1">
                  {interests.slice(0, 3).map((interest, index) => (
                    <span key={index} className="text-[10px] bg-emerald-500/80 text-white px-2 py-1 rounded-full backdrop-blur-sm border border-white/20 font-medium">
                      {interest}
                    </span>
                  ))}
                  {interests.length > 3 && (
                    <span className="text-[10px] text-white/70 self-center ml-1 font-light">+{interests.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
