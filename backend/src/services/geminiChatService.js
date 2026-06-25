import { GoogleGenAI } from "@google/genai";

const CHAT_MODEL = "gemini-2.5-flash";

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env file");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

export const generateSupportAnswer = async ({ question, relevantChunks }) => {
  try {
    if (!question || question.trim().length < 3) {
      throw new Error("Question must be at least 3 characters long");
    }

    if (!relevantChunks || !relevantChunks.length) {
      return {
        answer:
          "I could not find enough information in the knowledge base to answer this question. Please contact support for more help.",
      };
    }

    const context = relevantChunks
      .map((chunk, index) => {
        return `
Source ${index + 1}
Document: ${chunk.document?.title || "Unknown document"}
Content: ${chunk.content}
`;
      })
      .join("\n");

    const prompt = `
You are QueryBot, a helpful customer support chatbot.

You must answer the user's question using ONLY the knowledge base context provided below.

Rules:
- Do not invent information.
- If the answer is not available in the context, say you do not have enough information.
- Keep the answer clear, short, and customer-friendly.
- Mention useful details like time limits, conditions, steps, or contact options if available.
- Do not say "based on the context" again and again.
- Do not include markdown tables.

Knowledge Base Context:
${context}

User Question:
${question}

Answer:
`;

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: CHAT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.2,
      },
    });

    const answer =
      typeof response.text === "function" ? response.text() : response.text;

    if (!answer || !answer.trim()) {
      throw new Error("Gemini returned an empty answer");
    }

    return {
      answer: answer.trim(),
    };
  } catch (error) {
    throw new Error(`Gemini chat failed: ${error.message}`);
  }
};