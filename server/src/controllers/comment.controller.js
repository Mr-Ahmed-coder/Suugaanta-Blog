import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import ApiError from "../utils/api-error.js";
import { sendSuccess } from "../utils/api-response.js";

const allowedResourceTypes = ["song", "poetry", "history", "author"];

const validateResourceTarget = (resourceType, resourceId) => {
  if (!allowedResourceTypes.includes(resourceType)) {
    throw new ApiError(400, "Invalid comment resource type.");
  }

  if (!mongoose.Types.ObjectId.isValid(resourceId)) {
    throw new ApiError(400, "Invalid comment resource id.");
  }
};

const canModerate = (user) => ["admin", "editor"].includes(user?.role);

const serializeComment = (comment) => comment.populate("user", "name email role avatar");

export const createComment = async (req, res) => {
  const { content, resourceType, resourceId } = req.body;

  validateResourceTarget(resourceType, resourceId);

  const comment = await Comment.create({
    content,
    resourceType,
    resourceId,
    user: req.user._id,
  });

  return sendSuccess(res, 201, "Comment added successfully.", await serializeComment(comment));
};

export const getCommentsByResource = async (req, res) => {
  const { resourceType, resourceId } = req.params;

  validateResourceTarget(resourceType, resourceId);

  const comments = await Comment.find({ resourceType, resourceId })
    .populate("user", "name email role avatar")
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, "Comments retrieved successfully.", comments);
};

export const updateComment = async (req, res) => {
  const { content } = req.body;
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new ApiError(404, "Comment not found.");
  }

  if (!comment.user.equals(req.user._id)) {
    throw new ApiError(403, "You can only edit your own comments.");
  }

  comment.content = content;
  await comment.save();

  return sendSuccess(res, 200, "Comment updated successfully.", await serializeComment(comment));
};

export const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new ApiError(404, "Comment not found.");
  }

  if (!comment.user.equals(req.user._id) && !canModerate(req.user)) {
    throw new ApiError(403, "You can only delete your own comments.");
  }

  await comment.deleteOne();

  return sendSuccess(res, 200, "Comment deleted successfully.", { id: req.params.id });
};
