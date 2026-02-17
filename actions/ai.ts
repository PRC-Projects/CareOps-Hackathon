"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateFormQuestions(businessDescription: string) {

  const prompt = `
    You are an expert business consultant. 
    Generate a list of 5-7 essential intake form questions for a business described as: "${businessDescription}".
    
    Return ONLY a raw JSON array (no markdown, no code blocks).
    The JSON structure must be:
    [
      { "id": "unique_string", "label": "Question text", "type": "text" | "textarea" | "checkbox" }
    ]
    
    Example:
    [
      { "id": "q1", "label": "Do you have any allergies?", "type": "textarea" },
      { "id": "q2", "label": "Is this your first visit?", "type": "checkbox" }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown if Gemini adds it
    const cleanJson = text.replace(/```json|```/g, "").trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
}

export async function generateSmartReply(conversationHistory: string[]) {
  // conversationHistory is an array of strings like ["Customer: When are you open?", "Staff: 9-5", "Customer: Ok thanks"]
  
  const prompt = `
    You are a helpful customer support assistant for a service business.
    Read the following conversation history and generate a polite, professional, and concise response for the Staff member to send next.
    
    Conversation History:
    ${conversationHistory.join("\n")}
    
    Return ONLY the suggested response text. Do not include quotes or "Suggested Reply:".
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Reply Error:", error);
    return "";
  }
}

// 2. Conversation Summarizer
export async function summarizeConversation(messages: string[]) {
  const prompt = `
    Summarize the following customer service conversation into 3 short bullet points for the business owner.
    Focus on: What the customer wanted, what was agreed, and any follow-up needed.
    
    Messages:
    ${messages.join("\n")}

    Return ONLY the text of the summary. No quotes.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Could not summarize.";
  }
}

// 3. Inventory Insight
export async function getInventoryInsight(itemName: string, quantity: number) {
  const prompt = `
    Item: "${itemName}", Current Quantity: ${quantity}.
    Give me a 1-sentence warnings about what service stops if this runs out.
    Example: "If N95 Masks run out, you cannot perform surgeries safely."

    Return ONLY the text of the insight. No quotes.
  `;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "No insights available.";
  }
}


// 4. Voice Note Polisher (New)
export async function cleanVoiceNote(rawTranscript: string) {
  const prompt = `
    Turn this raw voice transcript into a professional clinical or service note.
    Fix grammar, remove filler words (um, uh), and make it concise.
    
    Raw: "${rawTranscript}"
    
    Return ONLY the polished text.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return rawTranscript;
  }
}

// 5. Audio Transcriber (Replaces flaky browser API)
export async function transcribeAudio(formData: FormData) {
  const file = formData.get("audio") as File;
  
  if (!file) return { error: "No audio file provided" };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/webm", // MediaRecorder usually creates webm
          data: base64Audio
        }
      },
      { text: "Transcribe this audio exactly as spoken. Ignore filler words like 'um' or 'uh'." }
    ]);

    return { text: result.response.text() };
  } catch (error) {
    console.error("Transcription Error:", error);
    return { error: "Failed to transcribe audio." };
  }
}