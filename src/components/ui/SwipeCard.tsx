import React, { Dispatch, SetStateAction } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
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

  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  const isFront = id === cards[cards.length - 1].id;

  const rotate = useTransform(() => {
    const offset = isFront ? 0 : id % 2 ? 6 : -6;
    return `${rotateRaw.get() + offset}deg`;
  });

  const handleDragEnd = () => {
    if (Math.abs(x.get()) > 100) {
      const cardToRemove = cards.find(card => card.id === id);
      if (cardToRemove) {
        setLastRemovedCard(cardToRemove);
        setCards((prev) => prev.filter((card) => card.id !== id));
      }
    }
  };

  return (
    <motion.div
      className="h-[30rem] w-72 origin-bottom rounded-2xl bg-gradient-to-br from-slate-50 to-white backdrop-blur-sm border border-white/20 overflow-hidden hover:cursor-grab active:cursor-grabbing"
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
        {/* Profile Image */}
        <img
          src={profileImage}
          alt={`${name}'s profile`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Glass Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md rounded-xl mx-3 mb-3 p-3 max-h-[45%] border border-white/20">
          <div className="space-y-2">
            {/* Header */}
            <div className="mb-2">
              <h3 className="text-lg font-bold text-white leading-tight">{name}, {age}</h3>
              <p className="text-xs text-white/90 leading-tight">{course}</p>
              <p className="text-[10px] text-white/80 leading-tight">{university}</p>
            </div>

            {/* Skills */}
            <div className="mb-1.5">
              <p className="text-[9px] font-medium text-white/70 uppercase tracking-wider mb-1">Skills</p>
              <div className="flex flex-wrap gap-0.5">
                {skills.slice(0, 2).map((skill, index) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 bg-lime-500/80 backdrop-blur-sm text-white text-[8px] rounded-md border border-white/20 leading-tight"
                  >
                    {skill}
                  </span>
                ))}
                {skills.length > 2 && (
                  <span className="px-1.5 py-0.5 bg-lime-500/60 backdrop-blur-sm text-white text-[8px] rounded-md border border-white/20 leading-tight">
                    +{skills.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Interests */}
            <div>
              <p className="text-[9px] font-medium text-white/70 uppercase tracking-wider mb-1">Interests</p>
              <div className="flex flex-wrap gap-0.5">
                {interests.slice(0, 2).map((interest, index) => (
                  <span
                    key={index}
                    className="px-1.5 py-0.5 bg-green-500/80 backdrop-blur-sm text-white text-[8px] rounded-md border border-white/20 leading-tight"
                  >
                    {interest}
                  </span>
                ))}
                {interests.length > 2 && (
                  <span className="px-1.5 py-0.5 bg-green-500/60 backdrop-blur-sm text-white text-[8px] rounded-md border border-white/20 leading-tight">
                    +{interests.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;