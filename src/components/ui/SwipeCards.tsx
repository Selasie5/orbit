import React, { useState, useEffect } from "react";
import { Card as ProfileCard } from "@/data/profileData";
import SwipeStack from "./SwipeStack";
import { useAuth } from "@/context/authContext";

// Enhanced interface to include AI matchmaking data
export interface MatchedProfile extends ProfileCard {
  matchData?: {
    rank: number;
    matchScore: number;
    matchType: string;
    whyBestMatch: string;
    specificReasons: string[];
    collaborationPotential: string;
    highlights: string[];
  };
  profile?: {
    id: string;
    full_name: string;
    email: string;
    course: string;
    skills: string;
    interests: string;
    bio: string;
    avatar_url: string;
    university: string;
  };
}

const SwipeCards = () => {
  const [cards, setCards] = useState<MatchedProfile[]>([]);
  const [lastRemovedCard, setLastRemovedCard] = useState<MatchedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMatchingData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching matchmaking data...');
        const response = await fetch('/api/matchmaking');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch matchmaking data: ${response.status}`);
        }

        const data = await response.json();
        console.log('Matchmaking API response:', data);

        // Transform the API response into MatchedProfile format
        const matchedProfiles: MatchedProfile[] = data.matches?.map((match: any, index: number) => ({
          id: parseInt(match.profileId) || index + 1,
          name: match.profile?.full_name || 'Unknown',
          profileImage: match.profile?.avatar_url || `https://images.unsplash.com/photo-${1494790108755 + index}?q=80&w=400&auto=format&fit=crop`,
          course: match.profile?.course || 'Course not specified',
          university: match.profile?.university || 'University not specified',
          skills: match.profile?.skills ? match.profile.skills.split(',').map((s: string) => s.trim()) : [],
          interests: match.profile?.interests ? match.profile.interests.split(',').map((i: string) => i.trim()) : [],
          age: 22, // Default age since it's not in the API response
          matchData: {
            rank: match.rank,
            matchScore: match.matchScore,
            matchType: match.matchType,
            whyBestMatch: match.whyBestMatch,
            specificReasons: match.specificReasons || [],
            collaborationPotential: match.collaborationPotential,
            highlights: match.highlights || []
          },
          profile: match.profile
        })) || [];

        setCards(matchedProfiles);
        setError(null);
      } catch (err) {
        console.error('Error fetching matchmaking data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fallback to empty array
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchingData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[32rem] w-80">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
        <p className="mt-4 text-gray-600">Finding your perfect matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[32rem] w-80 text-center">
        <div className="text-red-500 text-lg mb-2">⚠️</div>
        <p className="text-gray-600">Failed to load matches</p>
        <p className="text-sm text-gray-500 mt-2">{error}</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[32rem] w-80 text-center">
        <div className="text-4xl mb-4">🎯</div>
        <p className="text-gray-600">No matches found</p>
        <p className="text-sm text-gray-500 mt-2">Try updating your profile to find better matches</p>
      </div>
    );
  }

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
