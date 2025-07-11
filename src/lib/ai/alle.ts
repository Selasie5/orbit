interface AlleAIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

interface AlleAIConfig {
  apiKey: string;
  baseUrl: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

class AlleAIClient {
  private config: AlleAIConfig;

  constructor() {
    this.config = {
      apiKey: process.env.ALLE_AI_API_KEY || '',
      baseUrl: process.env.ALLE_AI_BASE_URL || 'https://api.alle-ai.com/api/v1',
      model: 'claude-3-sonnet', // ✅ Use Claude by default
      maxTokens: 150,
      temperature: 0.7,
    };

    if (!this.config.apiKey) {
      console.warn('⚠️ ALLE_AI_API_KEY is not set — fallback will be used.');
    }
  }

  async generateText(prompt: string, options?: Partial<AlleAIConfig>): Promise<AlleAIResponse> {
    try {
      if (!this.config.apiKey) throw new Error('No API key configured');

      const config = { ...this.config, ...options };

      const requestBody = {
        model: config.model,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that creates engaging, friendly networking icebreaker messages for a fun college networking app. This is NOT a dating app — it's for students to connect professionally and socially in a casual, approachable way. Keep messages friendly, collaborative, and focused on shared interests, skills, or academic experiences. Include a question to encourage conversation.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
      };

      console.log('📤 Sending to Alle AI:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'X-API-Key': config.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const htmlError = await response.text();
        console.error('❌ Non-JSON response:', htmlError.slice(0, 300));
        throw new Error('Non-JSON response from Alle AI — check endpoint or model.');
      }

      const data = await response.json();
      console.log('📥 Alle AI JSON Response:', JSON.stringify(data, null, 2));

      const responses = data.responses?.responses ?? [];
      if (responses.length > 0) {
        const content = responses[0].message?.content || responses[0].text || '';
        return {
          success: true,
          data: content.trim(),
        };
      }

      throw new Error('Empty or invalid response from Alle AI');

    } catch (error) {
      console.error('❌ Alle AI Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Singleton instance
const alleAIClient = new AlleAIClient();

// Main function
export async function callAlleAI(prompt: string): Promise<string> {
  const response = await alleAIClient.generateText(prompt);

  if (response.success && response.data) {
    return response.data;
  }

  console.warn('⚠️ Fallback triggered due to error:', response.error);
  return getNetworkingFallbackIcebreaker();
}

// Local fallback
function getNetworkingFallbackIcebreaker(): string {
  const messages = [
    "Hey! I noticed we have some similar interests. Would love to connect and maybe collaborate on something cool! 🚀",
    "Hi there! Your skills look really impressive. I'd love to learn more about your experience with that! 💡",
    "Hello! I see we're both students — what's been your favorite project or class so far? 📚",
    "Hey! Your background looks fascinating. Any exciting projects you're working on that you'd want to share? ⚡",
    "Hi! I'd love to connect and maybe grab coffee sometime to chat about our shared interests! ☕",
    "Hello! Always looking to expand my network with like-minded students. What's keeping you busy this semester? 🎯",
    "Hey there! Your profile caught my attention — would be great to connect and share experiences! ✨"
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

export { AlleAIClient };
