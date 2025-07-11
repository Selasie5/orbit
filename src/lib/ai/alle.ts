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
      model: 'gpt-4o',
      maxTokens: 2000,
      temperature: 0.7
    };

    if (!this.config.apiKey) {
      console.warn('ALLE_AI_API_KEY environment variable is not set - using fallback icebreakers');
    }
  }

  async generateText(prompt: string, options?: Partial<AlleAIConfig>): Promise<AlleAIResponse> {
    try {
      if (!this.config.apiKey) {
        throw new Error('No API key configured');
      }

      const requestConfig = { ...this.config, ...options };
      
      // Enhanced debug logging
      console.log('🔍 Alle AI Request Details:', {
        baseUrl: requestConfig.baseUrl,
        fullUrl: `${requestConfig.baseUrl}/chat/completions`,
        apiKeyPresent: !!requestConfig.apiKey,
        apiKeyLength: requestConfig.apiKey.length,
        apiKeyPrefix: requestConfig.apiKey.substring(0, 8) + '...',
        model: requestConfig.model
      });

      const requestBody = {
        models: [requestConfig.model],
        messages: [
          {
            user: [
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ],
        response_format: {
          type: "text"
        },
        max_tokens: requestConfig.maxTokens,
        temperature: requestConfig.temperature,
        stream: false
      };

      // Try different authentication approaches
      const response = await fetch(`${requestConfig.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': requestConfig.apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response Status:', response.status, response.statusText);
      console.log('📥 Response URL:', response.url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error Response Body:', errorText);
        
        // If it's an auth error, try a different endpoint or format
        if (response.status === 401) {
          console.log('🔄 Trying alternative authentication...');
          return await this.tryAlternativeAuth(prompt, requestConfig);
        }
        
        throw new Error(`Alle AI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📄 Response Data:', JSON.stringify(data, null, 2));
      
      // Handle the new Alle-AI response format
      if (data.success && data.responses && data.responses.responses) {
        const responses = data.responses.responses;
        const modelName = requestConfig.model || 'gpt-4o';
        
        if (responses[modelName] && responses[modelName].message && responses[modelName].message.content) {
          return {
            success: true,
            data: responses[modelName].message.content.trim()
          };
        }
      }
      
      console.error('❌ Unexpected response format:', data);
      throw new Error('Invalid response format from Alle AI');

    } catch (error) {
      console.error('❌ Alle AI API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Try different authentication methods
  async tryAlternativeAuth(prompt: string, config: AlleAIConfig): Promise<AlleAIResponse> {
    try {
      console.log('🔄 Trying alternative endpoint...');
      
      // Try different endpoint structure
      const alternativeUrl = `${config.baseUrl}/completions`;
      
      const response = await fetch(alternativeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey, // Different header format
        },
        body: JSON.stringify({
          model: config.model,
          prompt: prompt,
          max_tokens: config.maxTokens,
          temperature: config.temperature,
        }),
      });

      console.log('📥 Alternative Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Alternative Error:', errorText);
        throw new Error(`Alternative auth failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📄 Alternative Response:', data);

      // Handle different response formats
      if (data.choices && data.choices[0] && data.choices[0].text) {
        return {
          success: true,
          data: data.choices[0].text.trim()
        };
      }

      throw new Error('Alternative format failed');

    } catch (error) {
      console.error('❌ Alternative auth failed:', error);
      return {
        success: false,
        error: 'All authentication methods failed'
      };
    }
  }
}

// Create singleton instance
const alleAIClient = new AlleAIClient();

// Main function that will be called from the API route
export async function callAlleAI(prompt: string): Promise<string> {
  const response = await alleAIClient.generateText(prompt, {
    maxTokens: 2000,
    temperature: 0.7,
    model: 'gpt-4o'
  });
  
  if (response.success && response.data) {
    return response.data;
  } else {
    // Fallback to template-based response if AI fails
    console.warn('⚠️ Alle AI failed, using fallback:', response.error);
    return JSON.stringify({
      matches: [],
      message: 'AI unavailable - using fallback matching',
      fallback: true
    });
  }
}

// Updated fallback function for networking context
function getNetworkingFallbackIcebreaker(): string {
  const networkingFallbacks = [
    "Hey! I noticed we have some similar interests. Would love to connect and maybe collaborate on something cool! 🚀",
    "Hi there! Your skills look really impressive. I'd love to learn more about your experience with that! 💡",
    "Hello! I see we're both students - what's been your favorite project or class so far? 📚",
    "Hey! Your background looks fascinating. Any exciting projects you're working on that you'd want to share? ⚡",
    "Hi! I'd love to connect and maybe grab coffee sometime to chat about our shared interests! ☕",
    "Hello! Always looking to expand my network with like-minded students. What's keeping you busy this semester? 🎯",
    "Hey there! Your profile caught my attention - would be great to connect and share experiences! ✨"
  ];
  
  return networkingFallbacks[Math.floor(Math.random() * networkingFallbacks.length)];
}

// Export the client for advanced usage if needed
export { AlleAIClient };
