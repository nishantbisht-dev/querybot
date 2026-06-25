import Chat from "../models/Chat.js";
import { searchRelevantChunks } from "../services/vectorSearchService.js";
import { generateSupportAnswer } from "../services/geminiChatService.js";

const createChatTitle = (question) => {
  const cleanQuestion = question.trim();

  if (cleanQuestion.length <= 45) {
    return cleanQuestion;
  }

  return `${cleanQuestion.slice(0, 45)}...`;
};

const buildSources = (chunks) => {
  return chunks.map((chunk) => ({
    chunkId: chunk._id,
    documentId: chunk.document?._id,
    documentTitle: chunk.document?.title || "Unknown Document",
    chunkIndex: chunk.chunkIndex,
    score: chunk.score,
    contentPreview:
      chunk.content.length > 160
        ? `${chunk.content.slice(0, 160)}...`
        : chunk.content,
  }));
};

export const askQuestion = async (req, res) => {
  try {
    const { question, chatId } = req.body;

    if (!question || question.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Question must be at least 3 characters long",
      });
    }

    const relevantChunks = await searchRelevantChunks({
      question: question.trim(),
      limit: 5,
    });

    const { answer } = await generateSupportAnswer({
      question: question.trim(),
      relevantChunks,
    });

    const userMessage = {
      role: "user",
      content: question.trim(),
    };

    const assistantMessage = {
      role: "assistant",
      content: answer,
    };

    const sources = buildSources(relevantChunks);

    let chat;

    if (chatId) {
      chat = await Chat.findOne({
        _id: chatId,
        user: req.user.id,
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }

      chat.messages.push(userMessage, assistantMessage);
      chat.lastQuestion = question.trim();
      chat.lastAnswer = answer;
      chat.sources = sources;

      await chat.save();
    } else {
      chat = await Chat.create({
        user: req.user.id,
        title: createChatTitle(question),
        messages: [userMessage, assistantMessage],
        lastQuestion: question.trim(),
        lastAnswer: answer,
        sources,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Answer generated successfully",
      chat,
      answer,
      sources,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate chat answer",
      error: error.message,
    });
  }
};

export const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      user: req.user.id,
    })
      .select("title lastQuestion lastAnswer sources createdAt updatedAt")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: chats.length,
      chats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
      error: error.message,
    });
  }
};

export const getSingleChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    return res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat",
      error: error.message,
    });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    await chat.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete chat",
      error: error.message,
    });
  }
};