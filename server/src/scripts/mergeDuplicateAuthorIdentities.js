import mongoose from "mongoose";
import dotenv from "dotenv";
import Author from "../models/Author.js";
import History from "../models/History.js";
import Poetry from "../models/Poetry.js";
import Song from "../models/Song.js";
import normalizeAuthorName from "../utils/normalize-author-name.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const uniqueByString = (items = []) => Array.from(new Set(items.filter(Boolean).map((item) => item.toString())));

const mergeStringArrays = (...arrays) => Array.from(new Set(arrays.flat().filter(Boolean)));

const mergeSocialLinks = (canonicalLinks = {}, duplicateLinks = {}) => {
  const merged = { ...canonicalLinks };
  for (const [key, value] of Object.entries(duplicateLinks || {})) {
    if (!merged[key] && value) {
      merged[key] = value;
    }
  }
  return merged;
};

const fieldScore = (author) => {
  const data = author.toObject();
  return [
    data.biography,
    data.legacySummary,
    data.photo,
    data.featuredImage,
    data.birthYear,
    data.deathYear,
    ...(data.specialties || []),
    ...(data.tags || []),
    ...(data.mediaAssets || []),
  ].filter(Boolean).length;
};

const chooseCanonical = (group) =>
  [...group].sort((a, b) => {
    const scoreDifference = fieldScore(b) - fieldScore(a);
    if (scoreDifference !== 0) return scoreDifference;
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  })[0];

const mergeDuplicateAuthorIdentities = async () => {
  if (!MONGO_URI) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env before running this script.");
  }

  await mongoose.connect(MONGO_URI);

  const authors = await Author.find({}).select("+normalizedName");
  const groups = new Map();

  for (const author of authors) {
    const normalizedName = normalizeAuthorName(author.name);
    if (!groups.has(normalizedName)) {
      groups.set(normalizedName, []);
    }
    groups.get(normalizedName).push(author);
  }

  const duplicateGroups = Array.from(groups.entries()).filter(([, group]) => group.length > 1);

  if (duplicateGroups.length === 0) {
    console.log("No duplicate author identities found.");
    await mongoose.disconnect();
    return;
  }

  let mergedGroups = 0;
  let removedDuplicates = 0;

  for (const [normalizedName, group] of duplicateGroups) {
    const canonical = chooseCanonical(group);
    const duplicates = group.filter((author) => author._id.toString() !== canonical._id.toString());
    const duplicateIds = duplicates.map((author) => author._id);

    await Poetry.updateMany({ author: { $in: duplicateIds } }, { $set: { author: canonical._id, poet: canonical.name } });
    await Song.updateMany({ author: { $in: duplicateIds } }, { $set: { author: canonical._id } });
    await Song.updateMany({ writer: { $in: duplicateIds } }, { $set: { writer: canonical._id } });
    await Song.updateMany({ composer: { $in: duplicateIds } }, { $set: { composer: canonical._id } });
    await Song.updateMany({ relatedAuthors: { $in: duplicateIds } }, { $addToSet: { relatedAuthors: canonical._id } });
    await Song.updateMany({ relatedAuthors: { $in: duplicateIds } }, { $pull: { relatedAuthors: { $in: duplicateIds } } });
    await History.updateMany({ relatedAuthors: { $in: duplicateIds } }, { $addToSet: { relatedAuthors: canonical._id } });
    await History.updateMany({ relatedAuthors: { $in: duplicateIds } }, { $pull: { relatedAuthors: { $in: duplicateIds } } });
    await Author.updateMany({ relatedAuthors: { $in: duplicateIds } }, { $addToSet: { relatedAuthors: canonical._id } });
    await Author.updateMany({ relatedAuthors: { $in: duplicateIds } }, { $pull: { relatedAuthors: { $in: [...duplicateIds, canonical._id] } } });

    for (const duplicate of duplicates) {
      canonical.legacySummary ||= duplicate.legacySummary;
      canonical.biography ||= duplicate.biography;
      canonical.birthYear ||= duplicate.birthYear;
      canonical.deathYear ||= duplicate.deathYear;
      canonical.photo ||= duplicate.photo;
      canonical.featuredImage ||= duplicate.featuredImage;
      canonical.specialties = mergeStringArrays(canonical.specialties, duplicate.specialties);
      canonical.tags = mergeStringArrays(canonical.tags, duplicate.tags);
      canonical.relatedAuthors = uniqueByString([
        ...(canonical.relatedAuthors || []),
        ...(duplicate.relatedAuthors || []),
      ]).filter((id) => id !== canonical._id.toString() && !duplicateIds.some((duplicateId) => duplicateId.toString() === id));
      canonical.mediaAssets = [...(canonical.mediaAssets || []), ...(duplicate.mediaAssets || [])];
      canonical.socialLinks = mergeSocialLinks(canonical.socialLinks, duplicate.socialLinks);
    }

    await Author.deleteMany({ _id: { $in: duplicateIds } });

    canonical.normalizedName = normalizedName;
    await canonical.save();

    mergedGroups += 1;
    removedDuplicates += duplicates.length;
    console.log(`Merged ${duplicates.length} duplicate(s) into canonical author: ${canonical.name} (${canonical._id})`);
  }

  console.log("Duplicate author merge completed.");
  console.log(`Duplicate groups merged: ${mergedGroups}`);
  console.log(`Duplicate author documents removed: ${removedDuplicates}`);

  await mongoose.disconnect();
};

mergeDuplicateAuthorIdentities().catch(async (error) => {
  console.error("Failed to merge duplicate author identities:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
