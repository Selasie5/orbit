import { NextRequest, NextResponse } from "next/server";
import { callAlleAI } from "@/lib/ai/alle";
import { createIcebreakerPrompt } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const { targetUser, currentUser } = await request.json();
    
    // Validate required fields
    if (!targetUser || !targetUser.name) {
      return NextResponse.json(
        { error: 'Target user information is required' }, 
        { status: 400 }
      );
    }

    // Create optimized prompt
    const prompt = createIcebreakerPrompt(targetUser, currentUser);
    
    // Generate icebreaker using Alle AI
    const icebreaker = await callAlleAI(prompt);
    
    return NextResponse.json({ 
      icebreaker,
      success: true 
    });

  } catch (error) {
    console.error('Icebreaker API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate icebreaker',
        success: false 
      }, 
      { status: 500 }
    );
  }
}