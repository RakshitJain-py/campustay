import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client. It will automatically use the GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // We get the latest user message to send to Gemini
    const latestMessage = messages[messages.length - 1].text;
    
    // Add context so Gemini knows its role
    const systemPrompt = "You are a helpful assistant for CampuStay, a student accommodation finder. Keep your answers concise, friendly, and helpful. Guide users to find cheap stays, verified listings, and answer general questions about student housing.";
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser: ${latestMessage}` }] }
      ]
    });
    
    return Response.json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return Response.json(
      { text: "Sorry, I am having trouble connecting right now." },
      { status: 500 }
    );
  }
}