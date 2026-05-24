import User from "../models/User.js";
import ApiError from "../utils/api-error.js";
import asyncHandler from "../utils/async-handler.js";
import { sendSuccess } from "../utils/api-response.js";

/**
 * Get all users for admin management.
 * Returns users with their ID, name, email, role, and createdAt timestamp.
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 });
  
  return sendSuccess(res, 200, "Users retrieved successfully.", {
    users,
    count: users.length
  });
});

/**
 * Update a user's role. Only accessible by admins.
 * Admins cannot demote themselves.
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // 1. Basic validation
  if (!role || !["user", "editor", "admin"].includes(role)) {
    throw new ApiError(400, "Please provide a valid role: user, editor, or admin.");
  }

  // 2. Prevent self-demotion lockout
  if (id === req.user._id.toString() && role !== "admin") {
    throw new ApiError(403, "You cannot demote your own admin account. This prevents system lockouts.");
  }

  // 3. Find and update user
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.role = role;
  await user.save(); // Utilizing .save() in case there's future pre-save middleware besides password hashing

  // Strip password and return
  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;

  return sendSuccess(res, 200, `User role successfully updated to ${role}.`, sanitizedUser);
});
