import { GoogleGenAI } from "@google/genai";

const EMBEDDING_MODEL = "gemini-embedding-001";
const OUTPUT_DIMENSIONALITY = 768;

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env file");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

const extractEmbeddingValues = (response) => {
  const embedding =
    response?.embeddings?.[0]?.values ||
    response?.embedding?.values ||
    response?.embeddings?.[0];

  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error("Gemini embedding response did not contain vector values");
  }

  return embedding.map((value) => Number(value));
};

export const generateEmbedding = async (text) => {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Text is required to generate embedding");
    }

    const ai = getGeminiClient();

    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
      config: {
        outputDimensionality: OUTPUT_DIMENSIONALITY,
      },
    });

    return extractEmbeddingValues(response);
  } catch (error) {
    throw new Error(`Gemini embedding failed: ${error.message}`);
  }
};

export const getEmbeddingConfig = () => {
  return {
    model: EMBEDDING_MODEL,
    dimensions: OUTPUT_DIMENSIONALITY,
  };
};