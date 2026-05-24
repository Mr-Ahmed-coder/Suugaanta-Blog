import { Router } from "express";
import asyncHandler from "../utils/async-handler.js";
import { validateListQuery } from "../validators/query.validator.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import {
  createHistory,
  deleteHistory,
  getHistoryByIdentifier,
  getHistoryCollection,
  updateHistory,
} from "../controllers/history.controller.js";

const router = Router();

router.get("/", validateListQuery, asyncHandler(getHistoryCollection));
router.post("/", protect, restrictTo("admin", "editor"), asyncHandler(createHistory));
router.get("/:identifier", asyncHandler(getHistoryByIdentifier));
router.put("/:identifier", protect, restrictTo("admin", "editor"), asyncHandler(updateHistory));
router.delete("/:identifier", protect, restrictTo("admin", "editor"), asyncHandler(deleteHistory));

export default router;
