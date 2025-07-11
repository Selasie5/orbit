interface UserProfile {
  name: string;
  course: string;
  university: string;
  interests: string[];
  skills: string[];
  age?: number;
}

export function createIcebreakerPrompt(targetUser: UserProfile, currentUser?: Partial<UserProfile>): string {
  const basePrompt = `Generate a personalized, friendly networking icebreaker message for a college networking app.`;
  
  const targetInfo = `
Target person details:
- Name: ${targetUser.name}
- Studies: ${targetUser.course} at ${targetUser.university}
- Interests: ${targetUser.interests.join(', ')}
- Skills: ${targetUser.skills.join(', ')}
${targetUser.age ? `- Age: ${targetUser.age}` : ''}`;

  const currentUserInfo = currentUser ? `
Your details (for context):
- Studies: ${currentUser.course || 'Not specified'}
- Interests: ${currentUser.interests?.join(', ') || 'Not specified'}
- Skills: ${currentUser.skills?.join(', ') || 'Not specified'}` : '';

  const guidelines = `
Guidelines for networking icebreaker:
- Keep it casual and friendly (50-80 words max)
- Reference something specific from their profile (course, skills, interests, or university)
- Ask an engaging question about their work, projects, or experiences
- Use appropriate emojis sparingly (1-2 max)
- Focus on collaboration, learning, or professional development
- Make it feel natural and conversational
- This is for NETWORKING/PROFESSIONAL connections, not dating
- Suggest potential collaboration, knowledge sharing, or coffee chat

Examples of good networking icebreakers:
- "Hey Sarah! I noticed you're studying Computer Science at MIT. I'm working on a React project and saw you have experience with that - any tips for a fellow student? 💻"
- "Hi there! Your photography interest caught my eye. I'm organizing a campus photo walk event - would you be interested in joining or have any location suggestions? 📸"
- "Hello! I see we're both into data science. Have you worked on any interesting projects lately? Always looking to learn from fellow students! 📊"`;

  return `${basePrompt}\n${targetInfo}${currentUserInfo}\n${guidelines}`;
}

export function createConnectionPrompt(user1: UserProfile, user2: UserProfile): string {
  return `Generate a brief explanation of why ${user1.name} and ${user2.name} might be great networking connections based on their profiles.
  
${user1.name}: ${user1.course} at ${user1.university}, interests: ${user1.interests.join(', ')}, skills: ${user1.skills.join(', ')}
${user2.name}: ${user2.course} at ${user2.university}, interests: ${user2.interests.join(', ')}, skills: ${user2.skills.join(', ')}

Focus on professional synergies, collaboration opportunities, or shared learning interests. Keep it positive, specific, and under 30 words.`;
}

export function createEventInvitePrompt(targetUser: UserProfile, eventType: string): string {
  return `Generate a friendly invitation message for ${targetUser.name} to join a ${eventType} event.
  
Consider their interests: ${targetUser.interests.join(', ')} and skills: ${targetUser.skills.join(', ')}.
Make it personal but not pushy, and explain why this event might interest them.`;
}