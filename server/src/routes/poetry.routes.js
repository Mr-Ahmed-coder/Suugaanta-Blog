import { Router } from "express";
import asyncHandler from "../utils/async-handler.js";
import { validateListQuery } from "../validators/query.validator.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import {
  createPoetry,
  deletePoetry,
  getPoetryByIdentifier,
  getPoetryCollection,
  updatePoetry,
} from "../controllers/poetry.controller.js";

const router = Router();

router.get("/", validateListQuery, asyncHandler(getPoetryCollection));
router.post("/", protect, restrictTo("admin", "editor"), asyncHandler(createPoetry));
router.get("/:identifier", asyncHandler(getPoetryByIdentifier));
router.put("/:identifier", protect, restrictTo("admin", "editor"), asyncHandler(updatePoetry));
router.delete("/:identifier", protect, restrictTo("admin", "editor"), asyncHandler(deletePoetry));

export default router;
