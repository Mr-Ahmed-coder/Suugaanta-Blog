import { Router } from "express";
import {
  addFavorite,
  checkFavoriteStatus,
  getMyFavorites,
  removeFavorite,
} from "../controllers/favorite.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/async-handler.js";

const router = Router();

router.use(protect);

router.post("/", asyncHandler(addFavorite));
router.get("/me", asyncHandler(getMyFavorites));
router.get("/status/:resourceType/:resourceId", asyncHandler(checkFavoriteStatus));
router.delete("/:resourceType/:resourceId", asyncHandler(removeFavorite));

export default router;
