import express from "express";
import {
  deleteDocument,
  getAllDocuments,
  getSingleDocument,
  uploadKnowledgeDocument,
} from "../controllers/documentController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { uploadDocument } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  adminOnly,
  uploadDocument.single("document"),
  uploadKnowledgeDocument
);

router.get("/", protect, adminOnly, getAllDocuments);

router.get("/:id", protect, adminOnly, getSingleDocument);

router.delete("/:id", protect, adminOnly, deleteDocument);

export default router;