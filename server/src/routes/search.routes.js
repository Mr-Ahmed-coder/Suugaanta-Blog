import { Router } from "express";
import { globalSearch } from "../controllers/search.controller.js";
import asyncHandler from "../utils/async-handler.js";

const router = Router();

router.get("/", asyncHandler(globalSearch));

export default router;
