// actions/onboarding-ai.ts
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateBusinessSuggestions(businessName: string, businessType: string) {
  // 1. Check API Key immediately
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ FATAL: GEMINI_API_KEY is missing in .env");
    return null;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert business consultant. 
      A user is starting a business called "${businessName}" which is a "${businessType}".
      
      Generate a short, professional business description (max 100 words) and a list of 3 common services they might offer.
      
      Return ONLY a valid JSON object. Do not include markdown formatting.
      Format:
      {
        "description": "string",
        "services": [
          { "name": "string", "duration": 30, "price": 100 }
        ]
      }
    `;

    console.log(`🤖 Sending prompt to Gemini for: ${businessName}`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("💎 Raw AI Response:", text); // Check your VS Code Terminal for this

    // Cleaning Logic
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("❌ Error: Could not find JSON brackets in response");
      return null;
    }

    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString);

  } catch (error) {
    // THIS IS THE IMPORTANT PART
    console.error("❌ AI GENERATION FAILED:", error); 
    return null; 
  }
}