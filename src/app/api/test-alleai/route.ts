import { NextRequest } from "next/server";
// @ts-ignore: No type definitions for 'alle-ai-sdk'
const alleAiSdk = require('alle-ai-sdk');

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Alle-AI connection...');
    
    // Test environment variable
    const apiKey = process.env.NEXT_ALLEAI_API_KEY;
    console.log('API Key present:', !!apiKey);
    console.log('API Key preview:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not set');
    
    // Initialize client
    const alleai = new alleAiSdk.AlleAIClient({
      apiKey: 'alle-EpjeFGwyLE2UUTNV2v81LejjMZzmo79xHhLa',
      baseUrl: 'https://api.alle-ai.com/api/v1/chat/completions'
    });
    
    console.log('Client initialized successfully');
    
    // Simple test call
    const response = await alleai.chat.completions({
      models: ["gpt-4o"],
      messages: [
        {
          user: [
            {
              type: "text",
              text: "Hello, just testing the connection. Please respond with 'Connection successful!'"
            }
          ]
        }
      ],
      response_format: {
        type: "text"
      },
      temperature: 0.1,
      max_tokens: 50,
      stream: false
    });
    
    console.log('API call successful');
    console.log('Response structure:', Object.keys(response || {}));
    
    const aiResponse = response?.responses?.responses?.["gpt-4o"]?.message?.content;
    
    return new Response(JSON.stringify({ 
      success: true,
      hasApiKey: !!apiKey,
      apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'Not set',
      responseReceived: !!response,
      aiResponse: aiResponse,
      fullResponse: response
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error:any) {
    console.error('Alle-AI test error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
