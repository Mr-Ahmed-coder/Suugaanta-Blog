import { Router } from "express";
import asyncHandler from "../utils/async-handler.js";
import { validateListQuery } from "../validators/query.validator.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import {
  createSong,
  deleteSong,
  getSongByIdentifier,
  getSongs,
  updateSong,
} from "../controllers/song.controller.js";

const router = Router();

router.get("/", validateListQuery, asyncHandler(getSongs));
router.post("/", protect, restrictTo("admin", "editor"), asyncHandler(createSong));
router.get("/:identifier", asyncHandler(getSongByIdentifier));
router.put("/:identifier", protect, restrictTo("admin", "editor"), asyncHandler(updateSong));
router.delete("/:identifier", protect, restrictTo("admin", "editor"), asyncHandler(deleteSong));

export default router;
