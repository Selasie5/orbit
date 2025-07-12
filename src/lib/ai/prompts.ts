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
  'friendly and warm like a quick campus chat',
  'lively and kind with a Ghanaian touch',
  'welcoming and fun like a uni hangout',
  'engaging and easygoing like a group project vibe',
];

const lengthOptions = [
  'Keep it short and sweet (30–50 words)',
];

const creativeChallenges = [
  'Mention a Ghanaian campus vibe, like a canteen meetup.',
  'Ask a fun, simple question tied to their interests.',
  'Add a 😊 or 🇬🇭 emoji for a friendly touch.',
  'Make it feel like a quick chat before a lecture.',
];

export function createIcebreakerPrompt(targetUser: UserProfile, currentUser?: Partial<UserProfile>): string {
  const selectedTone = getRandom(toneOptions);
  const selectedLength = getRandom(lengthOptions);
  const selectedChallenge = getRandom(creativeChallenges);

  const basePrompt = `Generate a short, friendly networking icebreaker message for a college networking app that feels authentically Ghanaian and natural.`;

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
- Mention one specific thing from the target's profile
- Ask a simple, engaging question to spark a chat
- Suggest a casual connection, like grabbing food or a study vibe
- Use 1 emoji (e.g., 😊, 🇬🇭, or 📚) for warmth
- Avoid romantic vibes — this is for professional and social networking
- Sound like a Ghanaian uni student, natural and friendly
- Avoid heavy slang (e.g., no "chale" or "dey bee")`;

  const creativityPrompt = `
Creative twist:
- ${selectedChallenge}`;

  return `${basePrompt}\n${targetInfo}${currentUserInfo}\n${styleGuidelines}\n${creativityPrompt}`;
}