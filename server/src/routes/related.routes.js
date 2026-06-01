import { Router } from "express";
import { getRelatedContent } from "../controllers/related.controller.js";
import asyncHandler from "../utils/async-handler.js";

const router = Router();

router.get("/:resourceType/:id", asyncHandler(getRelatedContent));

export default router;
