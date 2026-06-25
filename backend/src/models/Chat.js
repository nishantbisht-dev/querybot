import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const sourceChunkSchema = new mongoose.Schema(
  {
    chunkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentChunk",
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },

    documentTitle: {
      type: String,
      trim: true,
    },

    chunkIndex: {
      type: Number,
    },

    score: {
      type: Number,
    },

    contentPreview: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      default: "New Chat",
    },

    messages: {
      type: [chatMessageSchema],
      default: [],
    },

    lastQuestion: {
      type: String,
      trim: true,
    },

    lastAnswer: {
      type: String,
      trim: true,
    },

    sources: {
      type: [sourceChunkSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;