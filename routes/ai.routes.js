import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getFileInsights } from "../controller/ai.controller.js";
const router = express.Router();

router.get("/:fileId", protectRoute, getFileInsights);
export default router;