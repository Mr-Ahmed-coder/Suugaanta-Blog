import mongoose from "mongoose";
import buildUniqueSlug from "../utils/build-slug.js";
import normalizeStringArray from "../utils/normalize-string-array.js";

const historySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "History title is required."],
      trim: true,
      minlength: [2, "History title must be at least 2 characters long."],
      maxlength: [180, "History title cannot exceed 180 characters."],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "History content is required."],
      trim: true,
      minlength: [20, "History content must be at least 20 characters long."],
    },
    coverImage: {
      type: String,
      trim: true,
      maxlength: [1024, "Cover image URL cannot exceed 1024 characters."],
    },
    category: {
      type: String,
      required: [true, "History category is required."],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters."],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      set: normalizeStringArray,
      index: true,
    },
    references: {
      type: [String],
      default: [],
      set: normalizeStringArray,
    },
    relatedAuthors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
        index: true,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

historySchema.index({ title: "text", content: "text", category: "text", tags: "text", references: "text" });
historySchema.index({ relatedAuthors: 1, createdAt: -1 });
historySchema.index({ createdAt: -1 });

historySchema.pre("validate", async function setSlug(next) {
  if (!this.isModified("title") && this.slug) {
    return next();
  }

  this.slug = await buildUniqueSlug(this.constructor, this.title, this._id);
  return next();
});

const History = mongoose.model("History", historySchema);

export default History;
