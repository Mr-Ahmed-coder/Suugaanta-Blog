import mongoose from "mongoose";
import buildUniqueSlug from "../utils/build-slug.js";
import normalizeAuthorName from "../utils/normalize-author-name.js";
import normalizeStringArray from "../utils/normalize-string-array.js";

const socialLinksSchema = new mongoose.Schema(
  {
    website: {
      type: String,
      trim: true,
      maxlength: [1024, "Website URL cannot exceed 1024 characters."],
    },
    facebook: {
      type: String,
      trim: true,
      maxlength: [1024, "Facebook URL cannot exceed 1024 characters."],
    },
    instagram: {
      type: String,
      trim: true,
      maxlength: [1024, "Instagram URL cannot exceed 1024 characters."],
    },
    x: {
      type: String,
      trim: true,
      maxlength: [1024, "X URL cannot exceed 1024 characters."],
    },
    youtube: {
      type: String,
      trim: true,
      maxlength: [1024, "YouTube URL cannot exceed 1024 characters."],
    },
  },
  {
    _id: false,
  }
);

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Author name is required."],
      trim: true,
      minlength: [2, "Author name must be at least 2 characters long."],
      maxlength: [160, "Author name cannot exceed 160 characters."],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false,
    },
    legacySummary: {
      type: String,
      trim: true,
      maxlength: [3000, "Legacy summary cannot exceed 3000 characters."],
    },
    biography: {
      type: String,
      trim: true,
      minlength: [20, "Biography must be at least 20 characters long."],
      maxlength: [20000, "Biography cannot exceed 20000 characters."],
    },
    birthYear: {
      type: Number,
      min: [1000, "Birth year must be 1000 or later."],
      max: [new Date().getFullYear(), "Birth year cannot be in the future."],
    },
    deathYear: {
      type: Number,
      min: [1000, "Death year must be 1000 or later."],
      max: [new Date().getFullYear(), "Death year cannot be in the future."],
    },
    photo: {
      type: String,
      trim: true,
      maxlength: [1024, "Photo URL cannot exceed 1024 characters."],
    },
    featuredImage: {
      type: String,
      trim: true,
      maxlength: [1024, "Featured image URL cannot exceed 1024 characters."],
    },
    specialties: {
      type: [String],
      default: [],
      set: normalizeStringArray,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      set: normalizeStringArray,
      index: true,
    },
    relatedAuthors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
        index: true,
      },
    ],
    archiveMetadata: {
      type: {
        era: {
          type: String,
          trim: true,
          maxlength: [120, "Era cannot exceed 120 characters."],
        },
        region: {
          type: String,
          trim: true,
          maxlength: [120, "Region cannot exceed 120 characters."],
        },
        languages: {
          type: [String],
          default: [],
          set: normalizeStringArray,
        },
        citationName: {
          type: String,
          trim: true,
          maxlength: [180, "Citation name cannot exceed 180 characters."],
        },
      },
      default: () => ({}),
    },
    mediaAssets: [
      {
        type: {
          type: String,
          enum: ["image", "audio", "video", "document", "manuscript", "other"],
          default: "image",
        },
        title: {
          type: String,
          trim: true,
          maxlength: [180, "Media title cannot exceed 180 characters."],
        },
        url: {
          type: String,
          trim: true,
          maxlength: [1024, "Media URL cannot exceed 1024 characters."],
        },
        description: {
          type: String,
          trim: true,
          maxlength: [2000, "Media description cannot exceed 2000 characters."],
        },
      },
    ],
    socialLinks: {
      type: socialLinksSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

authorSchema.index({
  name: "text",
  biography: "text",
  legacySummary: "text",
  specialties: "text",
  tags: "text",
  "archiveMetadata.era": "text",
  "archiveMetadata.region": "text",
  "archiveMetadata.citationName": "text",
});
authorSchema.index({ createdAt: -1 });

authorSchema.pre("validate", async function setCanonicalIdentity(next) {
  if (this.isModified("name") || !this.normalizedName) {
    this.normalizedName = normalizeAuthorName(this.name);
  }

  if (!this.normalizedName) {
    this.invalidate("name", "Author name is required.");
    return next();
  }

  if (this.isModified("name") || !this.slug) {
    this.slug = await buildUniqueSlug(this.constructor, this.name, this._id);
  }

  const duplicate = await this.constructor
    .findOne({ normalizedName: this.normalizedName })
    .select("_id name")
    .lean();

  if (duplicate && duplicate._id.toString() !== this._id?.toString()) {
    this.invalidate("name", `Author already exists as "${duplicate.name}". Use the existing canonical profile.`);
  }

  return next();
});

const Author = mongoose.model("Author", authorSchema);

export default Author;
