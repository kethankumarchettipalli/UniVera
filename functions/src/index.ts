import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

admin.initializeApp();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


if (!GEMINI_API_KEY) {
  console.error("Gemini API Key is not set.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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


export const callGemini = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated to use the function
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated.",
    );
  }

  const history = data.history || [];

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [systemInstruction, systemResponse, ...history],
  });

  // Get the last user message from the provided history
  const lastMessage = history.pop()?.parts[0]?.text || "";

  if (!lastMessage) {
      throw new functions.https.HttpsError("invalid-argument", "The history must contain at least one user message.");
  }
  
  try {
    const result = await chat.sendMessage(lastMessage);
    const response = result.response;
    const text = response.text();
    return { text };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to call Gemini API.",
    );
  }
});