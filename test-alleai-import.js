// Test file to check Alle-AI SDK import
const alleAiSdk = require('alle-ai-sdk');

console.log('Available exports:', Object.keys(alleAiSdk));
console.log('AlleAIClient constructor:', typeof alleAiSdk.AlleAIClient);

// Test initialization
try {
  const client = new alleAiSdk.AlleAIClient({
    apiKey: 'test-key'
  });
  console.log('Initialization successful');
  console.log('Client methods:', Object.getOwnPropertyNames(client).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(client))));
  console.log('Has chat property:', 'chat' in client);
} catch (error) {
  console.error('Initialization failed:', error.message);
}
