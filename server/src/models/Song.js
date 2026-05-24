import mongoose from "mongoose";
import buildUniqueSlug from "../utils/build-slug.js";
import normalizeStringArray from "../utils/normalize-string-array.js";

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Song title is required."],
      trim: true,
      minlength: [2, "Song title must be at least 2 characters long."],
      maxlength: [180, "Song title cannot exceed 180 characters."],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    artist: {
      type: String,
      trim: true,
      maxlength: [140, "Artist name cannot exceed 140 characters."],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      index: true,
    },
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      index: true,
    },
    composer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      index: true,
    },
    relatedAuthors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
        index: true,
      },
    ],
    performer: {
      type: String,
      trim: true,
      maxlength: [140, "Performer name cannot exceed 140 characters."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters."],
    },
    lyrics: {
      type: String,
      trim: true,
      maxlength: [50000, "Lyrics cannot exceed 50000 characters."],
    },
    audioUrl: {
      type: String,
      trim: true,
      maxlength: [1024, "Audio URL cannot exceed 1024 characters."],
    },
    thumbnail: {
      type: String,
      trim: true,
      maxlength: [1024, "Thumbnail URL cannot exceed 1024 characters."],
    },
    year: {
      type: Number,
      min: [1800, "Year must be 1800 or later."],
      max: [new Date().getFullYear(), "Year cannot be in the future."],
    },
    category: {
      type: String,
      required: [true, "Song category is required."],
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

songSchema.index({ title: "text", artist: "text", description: "text", lyrics: "text", tags: "text" });
songSchema.index({ author: 1, createdAt: -1 });
songSchema.index({ writer: 1, createdAt: -1 });
songSchema.index({ composer: 1, createdAt: -1 });
songSchema.index({ relatedAuthors: 1, createdAt: -1 });
songSchema.index({ createdAt: -1 });

songSchema.pre("validate", async function setSlug(next) {
  if (!this.isModified("title") && this.slug) {
    return next();
  }

  this.slug = await buildUniqueSlug(this.constructor, this.title, this._id);
  return next();
});

const Song = mongoose.model("Song", songSchema);

export default Song;
