import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required."],
      trim: true,
      minlength: [2, "Comment must be at least 2 characters long."],
      maxlength: [1000, "Comment cannot exceed 1000 characters."],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["song", "poetry", "history", "author"],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

commentSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
commentSchema.index({ user: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
