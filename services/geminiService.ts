import { GoogleGenAI } from "@google/genai";

export const generateSmartCoverSheet = async (fileNames: string[]): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
    I am creating a bulk print job for the following files:
    ${fileNames.join(', ')}

    Please write a concise, professional summary text for a cover page.
    The summary should explain that this is a consolidated print package.
    Do not use markdown formatting like bold or headers in the response, just plain text suitable for drawing on a PDF canvas.
    Limit the summary to 3-4 sentences.
    Start with "This package contains..."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "Summary not available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "This cover sheet was automatically generated to organize your bulk print job.";
  }
};