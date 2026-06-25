import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
      maxlength: [120, "Title cannot be more than 120 characters"],
    },

    originalFileName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      enum: ["pdf", "txt"],
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    totalCharacters: {
      type: Number,
      default: 0,
    },

    totalChunks: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["processed", "failed"],
      default: "processed",
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;