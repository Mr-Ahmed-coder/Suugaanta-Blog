import { Router } from "express";
import {
  createComment,
  deleteComment,
  getCommentsByResource,
  updateComment,
} from "../controllers/comment.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/async-handler.js";

const router = Router();

router.get("/:resourceType/:resourceId", asyncHandler(getCommentsByResource));
router.post("/", protect, asyncHandler(createComment));
router.patch("/:id", protect, asyncHandler(updateComment));
router.delete("/:id", protect, asyncHandler(deleteComment));

export default router;
