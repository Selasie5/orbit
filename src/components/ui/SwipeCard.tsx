import React, { Dispatch, SetStateAction } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { handleSwipeRight } from "@/actions/swipe/swipeRight";
import { handleSwipeLeft } from "@/actions/swipe/swipeLeft";
import { useAuth } from "@/context/authContext";
import { MatchedProfile } from "./SwipeCards";

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
  skills,
  interests,
  age,
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

  const isFront = id === cards[cards.length - 1].id;

  const rotate = useTransform(() => {
    const offset = isFront ? 0 : Number(id) % 2 ? 6 : -6;
    return `${rotateRaw.get() + offset}deg`;
  });

  const handleDragEnd = () => {
  if (Math.abs(x.get()) > 100) {
    // Use the actual profile ID from database, not the sequential card ID
    const actualUserId = profile?.id || id.toString();
    
    const targetUser: MatchedProfile = {
      id,
      name,
      profileImage,
      course,
      university,
      skills,
      interests,
      age,
      matchData,
      profile,
    };

    if (x.get() > 0) {
      // Swipe Right (Like) - Creates conversation immediately
      handleSwipeRight({
        cardId: actualUserId, // Use actual user ID instead of sequential card ID
        targetUser,
        currentUserId: user?.id || '',
        currentUserProfile, // Pass current user's profile data
        setCards,
        setLastRemovedCard,
        cards,
        swipeMethod: 'drag',
        onSwipeComplete: (action, user, conversation) => {
          console.log(`✅ ${action} completed for ${user.name} - Conversation: ${conversation.id}`);
        },
        onConversationCreated: (conversation) => {
          console.log(`💬 Ready to chat with ${targetUser.name}! Conversation ID: ${conversation.id}`);
          // TODO: Could navigate to chat or show notification
        },
        onError: (error) => {
          console.error('Swipe right error:', error);
        }
      });
    } else {
      // Swipe Left (Reject) - existing code unchanged
      handleSwipeLeft({
        cardId: actualUserId, // Use actual user ID instead of sequential card ID
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
      className="h-[32rem] w-80 origin-bottom rounded-2xl bg-gradient-to-br from-slate-50 to-white backdrop-blur-sm border border-white/20 overflow-hidden hover:cursor-grab active:cursor-grabbing"
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
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md rounded-xl mx-3 mb-3 p-4 max-h-[55%] overflow-y-auto border border-white/30">
          <div className="space-y-3">
            {/* Header with Match Score */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{name}, {age}</h3>
                <p className="text-xs text-gray-600 leading-tight">{course}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{university}</p>
              </div>
              {matchData && (
                <div className="flex flex-col items-end">
                  <div className="bg-gradient-to-r from-lime-500 to-green-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                    {matchData.matchScore}% Match
                  </div>
                  <div className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] mt-1">
                    #{matchData.rank} • {matchData.matchType}
                  </div>
                </div>
              )}
            </div>

            {/* AI Match Analysis */}
            {matchData && (
              <div className="bg-gradient-to-r from-lime-50 to-green-50 rounded-lg p-3 border border-lime-200">
                <p className="text-xs font-medium text-gray-700 mb-2">🤖 AI Match Insight:</p>
                <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-3">
                  {matchData.whyBestMatch}
                </p>
                
                {/* Highlights */}
                {matchData.highlights && matchData.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {matchData.highlights.slice(0, 3).map((highlight, index) => (
                      <span
                        key={index}
                        className="px-1.5 py-0.5 bg-lime-100 text-lime-700 text-[9px] rounded border border-lime-300 leading-tight"
                      >
                        ✨ {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="mb-2">
                <p className="text-[9px] font-medium text-gray-600 uppercase tracking-wider mb-1">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] rounded border border-blue-200 leading-tight"
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.length > 3 && (
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] rounded border border-blue-200 leading-tight">
                      +{skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Interests */}
            {interests && interests.length > 0 && (
              <div>
                <p className="text-[9px] font-medium text-gray-600 uppercase tracking-wider mb-1">Interests</p>
                <div className="flex flex-wrap gap-1">
                  {interests.slice(0, 3).map((interest, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] rounded border border-purple-200 leading-tight"
                    >
                      {interest}
                    </span>
                  ))}
                  {interests.length > 3 && (
                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[9px] rounded border border-purple-200 leading-tight">
                      +{interests.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Collaboration Potential */}
            {matchData?.collaborationPotential && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
                <p className="text-[9px] font-medium text-yellow-700 mb-1">🚀 Collaboration Potential:</p>
                <p className="text-[10px] text-yellow-600 leading-relaxed">
                  {matchData.collaborationPotential}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
