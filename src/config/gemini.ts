import { ChatMessage, College, PG } from '../types';

// ⚠️ SECURITY NOTE: API key is still in frontend for testing only.
// Move requests to a server and store the key in env vars when possible.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Map the chat history to the message format the Generative Language API expects.
 * Use roles 'user' and 'model' (NOT 'system'/'assistant').
 */
const formatChatHistoryForApi = (chatHistory: ChatMessage[]) => {
  return chatHistory.map(message => ({
    role: message.sender === 'user' ? 'user' : 'model',
    parts: [{ text: message.message }],
  }));
};

// IMPORTANT: Use 'user' for system-like instructions (the API uses only user/model roles)
const systemInstruction = {
  role: 'user',
  parts: [{
    text: `You are UniVera — a friendly, concise, and helpful AI assistant for students in India. 
Your job is to answer questions about colleges, PG/hostels, admissions, placements, fees, career guidance, and motivation in a supportive and India-focused way.
Rules:
1. You do not have live data or external APIs. If a user asks for cutoffs, current admissions, or real-time hostel availability, respond positively with the best general guidance you can, then suggest checking the official college website or notice for confirmation.
2. Always answer in a constructive and encouraging tone. Never say "I don't know" directly. Instead, use phrases like "According to typical records…", "Usually…", or "You can confirm the latest details on the official site."
3. Do not invent specific numbers, rankings, or dates unless provided in your context. When giving approximate information, clearly frame it as "typical" or "general."
4. Provide short, clear answers (2–5 sentences). Offer more details, resources, or next steps if the user asks.
5. Career guidance and motivation are allowed: give practical advice and short supportive messages when relevant.
6. If a question is unrelated to education or careers, politely refuse and redirect.
7. Always use INR (₹) when mentioning fees.`
  }]
};

// Reply seed should use role 'model' for the assistant greeting
const systemResponse = {
  role: 'model',
  parts: [{ text: "Hello! I'm UniVera, your AI assistant. How can I help you find the perfect college or accommodation today?" }],
};


/**
 * Debug wrapper: logs full response body for non-2xx responses.
 */
async function callGeminiDebug(url: string, opts: RequestInit) {
  const res = await fetch(url, opts);
  const text = await res.text();
  console.log('GEMINI-DEBUG status:', res.status);
  try {
    console.log('GEMINI-DEBUG body:', JSON.parse(text));
  } catch (e) {
    console.log('GEMINI-DEBUG raw body:', text);
  }
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${text}`);
  return JSON.parse(text);
}


export const runChat = async (chatHistory: ChatMessage[]): Promise<string> => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    return "Please configure your Gemini API key in `src/config/gemini.ts` to enable the AI chatbot.";
  }

  const contents = [
    systemInstruction,
    systemResponse,
    ...formatChatHistoryForApi(chatHistory)
  ];

  try {
    const response = await callGeminiDebug(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
    });

    const data = response;
    if (data.candidates && data.candidates.length > 0) {
      const first = data.candidates[0];
      if (first && first.content && first.content.parts && first.content.parts[0]) {
        return first.content.parts[0].text || "Sorry, I couldn't retrieve a reply.";
      }
    }

    if (data.outputText) return data.outputText;
    if (data.result && typeof data.result === 'string') return data.result;

    return "I'm not sure how to respond to that. Could you try asking in a different way?";
  } catch (error) {
    console.error('Failed to fetch from Gemini API:', error);
    throw error;
  }
};
