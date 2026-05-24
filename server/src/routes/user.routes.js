import express from "express";
import { getAllUsers, updateUserRole } from "../controllers/user.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply protection to all user management routes
router.use(protect);

// Only admins can access these routes
router.use(restrictTo("admin"));

// Route to fetch all users
router.route("/").get(getAllUsers);

// Route to update a specific user's role
router.route("/:id/role").patch(updateUserRole);

export default router;
