import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    characterCount: {
      type: Number,
      default: 0,
    },

    embedding: {
      type: [Number],
      required: true,
      default: [],
    },

    embeddingModel: {
      type: String,
      default: "gemini-embedding-001",
    },
  },
  {
    timestamps: true,
  }
);

const DocumentChunk = mongoose.model("DocumentChunk", documentChunkSchema);

export default DocumentChunk;