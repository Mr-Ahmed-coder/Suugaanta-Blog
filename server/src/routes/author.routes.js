import { Router } from "express";
import asyncHandler from "../utils/async-handler.js";
import { validateListQuery } from "../validators/query.validator.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import {
  createAuthor,
  deleteAuthor,
  getAuthorByIdentifier,
  getAuthors,
  updateAuthor,
} from "../controllers/author.controller.js";
import {
  getAuthorHistoryReferences,
  getAuthorPoetry,
  getAuthorProfileBySlug,
  getAuthorSongs,
  searchInsideAuthorLibrary,
} from "../controllers/authorLibrary.controller.js";

const router = Router();

router.get("/", validateListQuery, asyncHandler(getAuthors));
router.post("/", protect, restrictTo("admin", "editor"), asyncHandler(createAuthor));
router.get("/:slug/profile", asyncHandler(getAuthorProfileBySlug));
router.get("/:slug/poetry", validateListQuery, asyncHandler(getAuthorPoetry));
router.get("/:slug/songs", validateListQuery, asyncHandler(getAuthorSongs));
router.get("/:slug/history", validateListQuery, asyncHandler(getAuthorHistoryReferences));
router.get("/:slug/library/search", validateListQuery, asyncHandler(searchInsideAuthorLibrary));
router.get("/:identifier", asyncHandler(getAuthorByIdentifier));
router.put("/:identifier", protect, restrictTo("admin", "editor"), asyncHandler(updateAuthor));
router.delete("/:identifier", protect, restrictTo("admin", "editor"), asyncHandler(deleteAuthor));

export default router;
