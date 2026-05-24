import mongoose from "mongoose";
import buildUniqueSlug from "../utils/build-slug.js";
import normalizeStringArray from "../utils/normalize-string-array.js";

const poetrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Poetry title is required."],
      trim: true,
      minlength: [2, "Poetry title must be at least 2 characters long."],
      maxlength: [180, "Poetry title cannot exceed 180 characters."],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    poet: {
      type: String,
      trim: true,
      maxlength: [140, "Poet name cannot exceed 140 characters."],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      index: true,
    },
    content: {
      type: String,
      required: [true, "Poetry content is required."],
      trim: true,
      minlength: [10, "Poetry content must be at least 10 characters long."],
    },
    audioRecitation: {
      type: String,
      trim: true,
      maxlength: [1024, "Audio recitation URL cannot exceed 1024 characters."],
    },
    category: {
      type: String,
      required: [true, "Poetry category is required."],
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

poetrySchema.index({ title: "text", poet: "text", content: "text", tags: "text" });
poetrySchema.index({ author: 1, createdAt: -1 });
poetrySchema.index({ createdAt: -1 });

poetrySchema.pre("validate", async function setSlug(next) {
  if (!this.isModified("title") && this.slug) {
    return next();
  }

  this.slug = await buildUniqueSlug(this.constructor, this.title, this._id);
  return next();
});

const Poetry = mongoose.model("Poetry", poetrySchema);

export default Poetry;
