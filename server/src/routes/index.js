import { Router } from "express";
import songRoutes from "./song.routes.js";
import poetryRoutes from "./poetry.routes.js";
import historyRoutes from "./history.routes.js";
import authorRoutes from "./author.routes.js";
import authRoutes from "./auth.routes.js";
import uploadRoutes from "./upload.routes.js";
import statsRoutes from "./stats.routes.js";
import commentRoutes from "./comment.routes.js";
import searchRoutes from "./search.routes.js";
import favoriteRoutes from "./favorite.routes.js";
import relatedRoutes from "./related.routes.js";

import userRoutes from "./user.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
router.use("/stats", statsRoutes);
router.use("/comments", commentRoutes);
router.use("/search", searchRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/related", relatedRoutes);
router.use("/users", userRoutes);
router.use("/songs", songRoutes);
router.use("/poetry", poetryRoutes);
router.use("/history", historyRoutes);
router.use("/abwaano", authorRoutes);
router.use("/authors", authorRoutes);

export default router;
