import DocumentChunk from "../models/DocumentChunk.js";
import { generateEmbedding } from "./geminiEmbeddingService.js";

const VECTOR_INDEX_NAME = "document_chunks_vector_index";

export const searchRelevantChunks = async ({ question, limit = 5 }) => {
  if (!question || question.trim().length < 3) {
    throw new Error("Question must be at least 3 characters long");
  }

  const queryEmbedding = await generateEmbedding(question.trim());

  const results = await DocumentChunk.aggregate([
    {
      $vectorSearch: {
        index: VECTOR_INDEX_NAME,
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit,
      },
    },
    {
      $lookup: {
        from: "documents",
        localField: "document",
        foreignField: "_id",
        as: "document",
      },
    },
    {
      $unwind: "$document",
    },
    {
      $project: {
        _id: 1,
        content: 1,
        chunkIndex: 1,
        characterCount: 1,
        score: {
          $meta: "vectorSearchScore",
        },
        document: {
          _id: "$document._id",
          title: "$document.title",
          originalFileName: "$document.originalFileName",
          fileType: "$document.fileType",
        },
      },
    },
  ]);

  return results;
};