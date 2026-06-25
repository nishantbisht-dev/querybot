import express from "express";
import { searchKnowledgeBase } from "../controllers/searchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, searchKnowledgeBase);

export default router;