import express from "express";
import { addFile, getAllFiles, getFileById } from "../controller/file.controller.js";
import {upload} from "../middleware/upload.middleware.js"
import { protectRoute, isTeacher } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/addfile",protectRoute,isTeacher,upload.single("file"),addFile)
router.get("/", getAllFiles)
router.get("/:id", getFileById)

export default router;