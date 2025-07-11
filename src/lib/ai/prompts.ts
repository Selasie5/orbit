interface UserProfile {
  name: string;
  course: string;
  university: string;
  interests: string[];
  skills: string[];
  age?: number;
}

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const toneOptions = [
  'casual and upbeat',
  'playfully curious',
  'chill but insightful',
  'curious and thoughtful',
  'lighthearted and energetic',
];

const lengthOptions = [
  'Keep it concise (under 50 words)',
  'Aim for 60–80 words — just enough to be personal',
  'Make it thoughtful but brief (under 100 words)',
];

const creativeChallenges = [
  'Add a playful metaphor or analogy if it fits.',
  'Pose a question they haven’t likely been asked before.',
  'Incorporate a fun emoji that reflects one of their interests.',
  'Use a single clever pun — but keep it tasteful.',
  'Make it feel like the start of a great hallway conversation.',
];

export function createIcebreakerPrompt(targetUser: UserProfile, currentUser?: Partial<UserProfile>): string {
  const selectedTone = getRandom(toneOptions);
  const selectedLength = getRandom(lengthOptions);
  const selectedChallenge = getRandom(creativeChallenges);

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

  const styleGuidelines = `
Instructions for writing:
- ${selectedLength}
- Use a ${selectedTone} tone
- Mention something specific and unique from the target's profile
- Ask a light, engaging question to spark conversation
- Optionally suggest a shared interest or potential collaboration
- Use 1–2 emojis (optional)
- Avoid romance — this is for professional and social networking
- Make the message feel original and not templated`;

  const creativityPrompt = `
Creative twist:
- ${selectedChallenge}`;

  return `${basePrompt}\n${targetInfo}${currentUserInfo}\n${styleGuidelines}\n${creativityPrompt}`;
}
