import express from "express";
import {
  askQuestion,
  deleteChat,
  getMyChats,
  getSingleChat,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/ask", protect, askQuestion);

router.get("/", protect, getMyChats);

router.get("/:id", protect, getSingleChat);

router.delete("/:id", protect, deleteChat);

export default router;