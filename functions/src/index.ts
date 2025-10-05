import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

admin.initializeApp();

// WARNING: INSECURE - Hardcoding the API key directly in the code.
const GEMINI_API_KEY = "AIzaSyBdbTN_Sux72DzJg8J2OkVjQj6HwQw3h3w";

if (!GEMINI_API_KEY) {
  console.error("Gemini API Key is not set.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// System instruction to guide the AI's behavior
const systemInstruction = {
  role: "user",
  parts: [{
    text: "You are UniVera, a friendly and helpful AI assistant for a platform that helps students in India find colleges and accommodations (PGs/Hostels). Your goal is to assist users by answering their questions about colleges, fees, placements, locations, and suitable accommodations. Keep your responses concise, helpful, and relevant to the Indian education context. Do not answer questions unrelated to education, colleges, or student life in India.",
  }],
};

const systemResponse = {
  role: "model",
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