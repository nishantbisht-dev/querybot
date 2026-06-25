import fs from "fs";
import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import { extractDocumentText } from "../utils/extractDocumentText.js";
import { chunkText } from "../utils/chunkText.js";
import {
  generateEmbedding,
  getEmbeddingConfig,
} from "../services/geminiEmbeddingService.js";

const deleteUploadedFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const uploadKnowledgeDocument = async (req, res) => {
  let uploadedFilePath;
  let createdDocumentId;

  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    uploadedFilePath = req.file.path;

    if (!title || title.trim().length < 3) {
      deleteUploadedFile(uploadedFilePath);

      return res.status(400).json({
        success: false,
        message: "Document title must be at least 3 characters long",
      });
    }

    const { text, fileType } = await extractDocumentText(
      uploadedFilePath,
      req.file.originalname
    );

    const chunks = chunkText(text);

    if (!chunks.length) {
      deleteUploadedFile(uploadedFilePath);

      return res.status(400).json({
        success: false,
        message: "Could not create readable chunks from this document",
      });
    }

    const embeddingConfig = getEmbeddingConfig();

    const document = await Document.create({
      title: title.trim(),
      originalFileName: req.file.originalname,
      fileType,
      uploadedBy: req.user.id,
      totalCharacters: text.length,
      totalChunks: chunks.length,
      status: "processed",
    });

    createdDocumentId = document._id;

    const chunkDocs = [];

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);

      chunkDocs.push({
        document: document._id,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        characterCount: chunk.characterCount,
        embedding,
        embeddingModel: embeddingConfig.model,
      });
    }

    await DocumentChunk.insertMany(chunkDocs);

    deleteUploadedFile(uploadedFilePath);

    return res.status(201).json({
      success: true,
      message: "Knowledge document uploaded, chunked, and embedded successfully",
      document,
      chunksCreated: chunks.length,
      embeddingModel: embeddingConfig.model,
      embeddingDimensions: embeddingConfig.dimensions,
    });
  } catch (error) {
    deleteUploadedFile(uploadedFilePath);

    if (createdDocumentId) {
      await Document.findByIdAndDelete(createdDocumentId);
      await DocumentChunk.deleteMany({ document: createdDocumentId });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to upload knowledge document",
      error: error.message,
    });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};

export const getSingleDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate(
      "uploadedBy",
      "name email role"
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const chunks = await DocumentChunk.find({
      document: document._id,
    })
      .select("-embedding")
      .sort({ chunkIndex: 1 });

    return res.status(200).json({
      success: true,
      document,
      chunks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch document",
      error: error.message,
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    await DocumentChunk.deleteMany({
      document: document._id,
    });

    await document.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Document and related chunks deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message,
    });
  }
};