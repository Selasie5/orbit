import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service";
import { cookies } from 'next/headers'
import { callAlleAI } from '@/lib/ai/alle';

export async function GET(request: NextRequest) {
  try {
    // Create server-side Supabase client
    const supabase = createClient(cookies())

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('User authenticated:', user.id);

    // Use service role client to bypass RLS and read all profiles
    const serviceClient = createServiceRoleClient();
    
    console.log('Fetching profiles from database with service role...');
    
    const { data: profilesFromDB, error } = await serviceClient
      .from('profiles')
      .select('*')
      .neq('id', user.id) 
    
    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        details: error.details 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Profiles fetched:', profilesFromDB?.length || 0);
    console.log('Profile data sample:', profilesFromDB?.[0]);

    const { data: currentUserProfile, error: profileError } = await serviceClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !currentUserProfile) {
      console.log('Current user profile not found, returning all profiles');
      return new Response(JSON.stringify({ 
        profiles: profilesFromDB || [],
        count: profilesFromDB?.length || 0,
        currentUser: user.id,
        message: 'No user profile found, returning all profiles'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = `You are an expert matchmaking AI that analyzes student profiles to find the best matches for collaboration, study partnerships, and networking.

You will receive:
1. Current user's profile (the person looking for matches)
2. Array of other user profiles to match against

Your task is to:
1. RANK matches from highest to lowest compatibility (1st = best match, 2nd = second best, etc.)
2. Provide detailed analysis of WHY each person is a great match
3. Consider multiple compatibility factors with specific examples

RANKING CRITERIA (in order of importance):
1. Shared academic interests and career goals (40% weight)
2. Complementary skills that benefit both parties (30% weight) 
3. Similar course/academic level for study collaboration (20% weight)
4. Personality compatibility and communication style (10% weight)

Return a JSON object with this EXACT structure:
{
  "matches": [
    {
      "rank": 1,
      "profileId": "uuid-of-matched-profile",
      "matchScore": 92,
      "matchType": "Perfect Study Partner",
      "whyBestMatch": "Sarah is your ideal match because you both are passionate about AI and machine learning, with complementary skills - your Python expertise pairs perfectly with her React frontend skills. You're both Computer Science majors looking to build full-stack AI applications.",
      "specificReasons": [
        "Both passionate about AI/ML with concrete project goals",
        "Perfect skill complement: Your Python/Backend + Her React/Frontend", 
        "Same academic level (3rd year CS) for balanced collaboration",
        "Both mention wanting to build AI-powered web applications"
      ],
      "collaborationPotential": "Could build amazing AI web apps together, with clear role division and shared learning goals",
      "highlights": ["AI/ML Passion", "Complementary Tech Stack", "Same Course Year", "Startup Interest"]
    }
  ]
}

IMPORTANT RULES:
- Return maximum 5 matches, ranked from best (1) to 5th best (5)
- Match scores: 90-100 (Excellent), 80-89 (Very Good), 70-79 (Good), 60-69 (Fair)
- Be specific in reasoning - use actual details from profiles
- Focus on mutual benefit and realistic collaboration scenarios
- For each match, explain exactly WHY they're ranked in that position
- Use different matchType categories: "Perfect Study Partner", "Skill Complement", "Course Buddy", "Project Collaborator", "Network Connection"`;

    const userMessage = `Current user profile:
${JSON.stringify(currentUserProfile, null, 2)}

Available profiles to match:
${JSON.stringify(profilesFromDB, null, 2)}

Please analyze these profiles and return the best matches for the current user.`;

    const fullPrompt = `${systemPrompt}\n\n${userMessage}`;

    try {
      console.log('Calling Alle-AI for matchmaking analysis...');
      
      const aiResponse = await callAlleAI(fullPrompt);
      
      console.log('Alle-AI response received');
      
      // Parse the JSON response from AI
      let matchingResults;
      try {
        matchingResults = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', aiResponse);
        // Fallback: return all profiles with basic ranking
        matchingResults = {
          matches: profilesFromDB?.slice(0, 5).map((profile, index) => ({
            rank: index + 1,
            profileId: profile.id,
            matchScore: 75 - (index * 5),
            matchType: "Basic Match",
            whyBestMatch: `Ranked #${index + 1} based on profile availability and basic compatibility factors. This user has a complete profile and could be a good potential match for collaboration.`,
            specificReasons: [
              "Complete profile information available",
              "Active user in the platform",
              `Course: ${profile.course || 'Not specified'}`,
              `Interests: ${profile.interests || 'Not specified'}`
            ],
            collaborationPotential: "Could explore shared interests and find collaboration opportunities through direct connection.",
            highlights: ["Available for matching", "Complete profile"]
          })) || []
        };
      }

      // Enhance matches with full profile data
      const enhancedMatches = matchingResults.matches?.map((match: any) => {
        const fullProfile = profilesFromDB?.find(p => p.id === match.profileId);
        return {
          ...match,
          profile: fullProfile
        };
      }).filter((match: any) => match.profile) || [];

      return new Response(JSON.stringify({ 
        matches: enhancedMatches,
        count: enhancedMatches.length,
        currentUser: user.id,
        currentUserProfile: currentUserProfile,
        message: 'AI-powered matchmaking completed',
        totalProfilesAnalyzed: profilesFromDB?.length || 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (aiError) {
      console.error('Alle-AI error:', aiError);
      
      // Intelligent fallback: analyze profiles programmatically
      const intelligentMatches = profilesFromDB?.map((profile, index) => {
        let matchScore = 50; // Base score
        const reasons = [];
        const highlights = [];
        
        // Course compatibility (30 points max)
        if (profile.course && currentUserProfile.course) {
          if (profile.course.toLowerCase() === currentUserProfile.course.toLowerCase()) {
            matchScore += 30;
            reasons.push(`Same course: ${profile.course}`);
            highlights.push("Same Course");
          } else if (profile.course.toLowerCase().includes('computer') && 
                    currentUserProfile.course.toLowerCase().includes('computer')) {
            matchScore += 20;
            reasons.push("Related computer/tech fields");
            highlights.push("Tech Field");
          }
        }
        
        // Skills compatibility (25 points max)
        if (profile.skills && currentUserProfile.skills) {
          const userSkills = currentUserProfile.skills.toLowerCase().split(/[,\s]+/);
          const profileSkills = profile.skills.toLowerCase().split(/[,\s]+/);
          const commonSkills: string[] = userSkills.filter((skill: string) => 
            profileSkills.some((pSkill: string) => pSkill.includes(skill) || skill.includes(pSkill))
          );
          
          if (commonSkills.length > 0) {
            matchScore += Math.min(25, commonSkills.length * 8);
            reasons.push(`Shared skills: ${commonSkills.slice(0, 3).join(', ')}`);
            highlights.push("Shared Skills");
          }
        }
        
        // Interests compatibility (25 points max)
        if (profile.interests && currentUserProfile.interests) {
          const userInterests = currentUserProfile.interests.toLowerCase().split(/[,\s]+/);
          const profileInterests = profile.interests.toLowerCase().split(/[,\s]+/);
          const commonInterests: string[] = userInterests.filter((interest: string) => 
            profileInterests.some((pInterest: string) => pInterest.includes(interest) || interest.includes(pInterest))
          );
          
          if (commonInterests.length > 0) {
            matchScore += Math.min(25, commonInterests.length * 8);
            reasons.push(`Shared interests: ${commonInterests.slice(0, 3).join(', ')}`);
            highlights.push("Common Interests");
          }
        }
        
        // Profile completeness bonus (10 points max)
        const completeness = [profile.full_name, profile.course, profile.skills, profile.interests, profile.bio]
          .filter(field => field && field.trim().length > 0).length;
        matchScore += completeness * 2;
        
        if (completeness >= 4) {
          reasons.push("Complete and detailed profile");
          highlights.push("Complete Profile");
        }
        
        // Determine match type based on score
        let matchType = "Basic Match";
        if (matchScore >= 90) matchType = "Excellent Match";
        else if (matchScore >= 80) matchType = "Very Good Match";
        else if (matchScore >= 70) matchType = "Good Match";
        else if (matchScore >= 60) matchType = "Fair Match";
        
        return {
          rank: index + 1,
          profileId: profile.id,
          matchScore: Math.min(100, matchScore),
          matchType,
          whyBestMatch: `${profile.full_name || 'This person'} scored ${Math.min(100, matchScore)}% compatibility based on profile analysis. ${reasons.length > 0 ? reasons[0] : 'Basic profile compatibility detected.'}`,
          specificReasons: reasons.length > 0 ? reasons : ["Profile available for matching", "Basic compatibility detected"],
          collaborationPotential: matchScore >= 70 ? 
            "Good potential for collaboration based on shared academic background and interests." :
            "Could explore collaboration opportunities through direct connection.",
          highlights: highlights.length > 0 ? highlights : ["Available for matching"],
          profile: profile
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore) // Sort by score descending
      .slice(0, 5) // Top 5 matches
      .map((match, index) => ({ ...match, rank: index + 1 })) || []; // Re-assign ranks

      return new Response(JSON.stringify({ 
        matches: intelligentMatches,
        count: intelligentMatches.length,
        currentUser: user.id,
        currentUserProfile: currentUserProfile,
        message: 'Intelligent fallback matching (AI unavailable)',
        note: 'Using smart algorithmic matching based on profile analysis'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}



