import mongoose from "mongoose";
import dotenv from "dotenv";
import Author from "../models/Author.js";
import normalizeAuthorName from "../utils/normalize-author-name.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const migrateAuthorIdentities = async () => {
  if (!MONGO_URI) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env before running this script.");
  }

  await mongoose.connect(MONGO_URI);

  const authors = await Author.find({}).select("+normalizedName name slug createdAt");
  const groups = new Map();

  for (const author of authors) {
    const normalizedName = normalizeAuthorName(author.name);
    if (!groups.has(normalizedName)) {
      groups.set(normalizedName, []);
    }
    groups.get(normalizedName).push(author);
  }

  const duplicateGroups = Array.from(groups.entries()).filter(([, group]) => group.length > 1);

  if (duplicateGroups.length > 0) {
    console.log("Duplicate author identities were found. No changes were made.");
    console.log("Review these groups and merge content into one canonical author before enforcing uniqueness:");
    for (const [normalizedName, group] of duplicateGroups) {
      console.log(`- ${normalizedName}: ${group.map((author) => `${author.name} (${author._id})`).join(", ")}`);
    }
    await mongoose.disconnect();
    process.exit(1);
  }

  let updated = 0;

  for (const author of authors) {
    const normalizedName = normalizeAuthorName(author.name);
    if (author.normalizedName === normalizedName) continue;

    author.normalizedName = normalizedName;
    await author.save();
    updated += 1;
  }

  console.log("Author identity migration completed.");
  console.log(`Authors scanned: ${authors.length}`);
  console.log(`Authors updated: ${updated}`);

  await mongoose.disconnect();
};

migrateAuthorIdentities().catch(async (error) => {
  console.error("Failed to migrate author identities:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
