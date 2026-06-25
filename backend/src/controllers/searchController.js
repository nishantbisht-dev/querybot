import { searchRelevantChunks } from "../services/vectorSearchService.js";

export const searchKnowledgeBase = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Question must be at least 3 characters long",
      });
    }

    const chunks = await searchRelevantChunks({
      question,
      limit: 5,
    });

    return res.status(200).json({
      success: true,
      question,
      count: chunks.length,
      chunks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to search knowledge base",
      error: error.message,
    });
  }
};