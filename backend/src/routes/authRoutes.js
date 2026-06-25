import express from "express";
import {
  getAdminCheck,
  getMe,
  loginUser,
  registerUser,
} from "../controllers/authController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, getMe);
router.get("/admin-check", protect, adminOnly, getAdminCheck);

export default router;