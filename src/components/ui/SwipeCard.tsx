import React, { Dispatch, SetStateAction } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { handleSwipeRight } from "@/actions/swipe/swipeRight";
import { handleSwipeLeft } from "@/actions/swipe/swipeLeft";
import { useAuth } from "@/context/authContext";
import { MatchedProfile } from "./SwipeCards";
import { SparklesIcon, StarIcon, UserIcon } from "@heroicons/react/24/solid";

interface SwipeCardProps extends MatchedProfile {
  setCards: Dispatch<SetStateAction<MatchedProfile[]>>;
  cards: MatchedProfile[];
  setLastRemovedCard: Dispatch<SetStateAction<MatchedProfile | null>>;
}

const SwipeCard = ({
  id,
  name,
  profileImage,
  course,
  university,
  skills = [],
  interests = [],
  matchData,
  profile,
  setCards,
  cards,
  setLastRemovedCard,
}: SwipeCardProps) => {
  const { user, profile: currentUserProfile } = useAuth();

  const x = useMotionValue(0);
  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);

  const isFront = id === cards[cards.length - 1]?.id;

  const rotate = useTransform(() => {
    const offset = isFront ? 0 : Number(id) % 2 ? 6 : -6;
    return `${rotateRaw.get() + offset}deg`;
  });

  const handleDragEnd = () => {
    if (Math.abs(x.get()) > 100) {
      const actualUserId = profile?.id || id.toString();

      const targetUser: MatchedProfile = {
        id,
        name,
        profileImage,
        course,
        university,
        skills,
        interests,
        matchData,
        profile,
      };

      if (x.get() > 0) {
        handleSwipeRight({
          cardId: actualUserId,
          targetUser,
          currentUserId: user?.id || '',
          currentUserProfile,
          setCards,
          setLastRemovedCard,
          cards,
          swipeMethod: 'drag',
          onSwipeComplete: (action, user, conversation) => {
            console.log(`✅ ${action} completed for ${user.name} - Conversation: ${conversation.id}`);
          },
          onConversationCreated: (conversation) => {
            console.log(`💬 Ready to chat with ${targetUser.name}! Conversation ID: ${conversation.id}`);
          },
          onError: (error) => {
            console.error('Swipe right error:', error);
          }
        });
      } else {
        handleSwipeLeft({
          cardId: actualUserId,
          targetUser,
          currentUserId: user?.id || '',
          setCards,
          setLastRemovedCard,
          cards,
          swipeMethod: 'drag',
          onSwipeComplete: (action, user) => {
            console.log(`Swipe ${action} completed for ${user.name}`);
          },
          onError: (error) => {
            console.error('Swipe left error:', error);
          }
        });
      }
    }
  };

  return (
    <motion.div
      className="h-[32rem] w-80 origin-bottom rounded-3xl bg-gradient-to-br from-lime-50 to-white shadow-2xl border border-lime-300/70 overflow-hidden hover:cursor-grab active:cursor-grabbing transition-shadow"
      style={{
        gridRow: 1,
        gridColumn: 1,
        x,
        opacity,
        rotate,
        transition: "0.125s transform",
        boxShadow: isFront
          ? "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)"
          : undefined,
      }}
      animate={{
        scale: isFront ? 1 : 0.96,
        y: isFront ? 0 : (cards.length - cards.findIndex(card => card.id === id) - 1) * -8,
      }}
      whileDrag={{
        scale: 1.05,
        transition: { duration: 0.1 }
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{
        left: -300,
        right: 300,
      }}
      dragElastic={0.2}
      dragMomentum={false}
      onDrag={(event, info) => {
        // Debug: Log drag events
        console.log('Dragging:', info.point.x, info.offset.x);
      }}
      onDragStart={() => {
        console.log('Drag started for card:', name);
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="relative h-full">
        {/* Swipe Indicators */}
        <motion.div
          style={{ opacity: 1 }}
          className="absolute top-10 left-10 z-10 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg -rotate-12"
        >
          LIKE
        </motion.div>
        <motion.div
          style={{ opacity: 0.5 }}
          className="absolute top-10 right-10 z-10 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg rotate-12"
        >
          NOPE
        </motion.div>
        {/* Profile Image */}
        <img
          src={profileImage}
          alt={`${name}'s profile`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        {/* Glass Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent" />
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md rounded-2xl mx-3 mb-3 p-5 max-h-[60%] overflow-y-auto border border-white/30 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-xl font-extrabold text-lime-700 leading-tight flex items-center gap-2 drop-shadow">
                <UserIcon className="w-5 h-5 text-lime-400" />
                {name}
              </h3>
              <p className="text-xs text-gray-700 font-medium leading-tight">{course}</p>
              <p className="text-[11px] text-gray-500 leading-tight">{university}</p>
            </div>
            {matchData && (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 bg-gradient-to-r from-lime-500 to-green-600 text-white px-3 py-1 rounded-xl text-base font-bold shadow border border-lime-300">
                  <StarIcon className="w-4 h-4 text-yellow-200" />
                  {matchData.matchScore}%
                </div>
                <div className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] mt-1 font-semibold">
                  #{matchData.rank} • {matchData.matchType}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SwipeCard;
