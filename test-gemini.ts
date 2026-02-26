import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Find the 5 most recent official NHL game highlight videos on YouTube. Return a JSON array of objects with { title, videoId }.",
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    },
  });
  console.log(response.text);
}
run();
