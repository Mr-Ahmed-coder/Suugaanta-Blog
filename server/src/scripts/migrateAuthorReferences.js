import mongoose from "mongoose";
import dotenv from "dotenv";
import Author from "../models/Author.js";
import History from "../models/History.js";
import Poetry from "../models/Poetry.js";
import Song from "../models/Song.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const normalizeName = (value = "") => value.trim().toLowerCase();

const migrateAuthorReferences = async () => {
  if (!MONGO_URI) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env before running this script.");
  }

  await mongoose.connect(MONGO_URI);

  const authors = await Author.find({}).select("_id name");
  const authorByName = new Map(authors.map((author) => [normalizeName(author.name), author._id]));

  let poetryUpdated = 0;
  let songsUpdated = 0;
  let historyUpdated = 0;

  const poetryItems = await Poetry.find({ author: { $exists: false }, poet: { $type: "string", $ne: "" } });
  for (const poem of poetryItems) {
    const authorId = authorByName.get(normalizeName(poem.poet));
    if (!authorId) continue;

    poem.author = authorId;
    await poem.save();
    poetryUpdated += 1;
  }

  const songItems = await Song.find({
    writer: { $exists: false },
    $or: [
      { artist: { $type: "string", $ne: "" } },
      { performer: { $type: "string", $ne: "" } },
    ],
  });
  for (const song of songItems) {
    const authorId =
      authorByName.get(normalizeName(song.artist)) ||
      authorByName.get(normalizeName(song.performer));

    if (!authorId) continue;

    song.writer = authorId;
    if (!song.author) {
      song.author = authorId;
    }
    await song.save();
    songsUpdated += 1;
  }

  const historyItems = await History.find({ references: { $type: "array", $ne: [] } });
  for (const article of historyItems) {
    const existingIds = new Set((article.relatedAuthors || []).map((id) => String(id)));
    const matchedIds = article.references
      .map((reference) => authorByName.get(normalizeName(reference)))
      .filter(Boolean);

    let changed = false;
    for (const authorId of matchedIds) {
      if (!existingIds.has(String(authorId))) {
        article.relatedAuthors.push(authorId);
        existingIds.add(String(authorId));
        changed = true;
      }
    }

    if (!changed) continue;

    await article.save();
    historyUpdated += 1;
  }

  console.log("Author reference migration completed.");
  console.log(`Authors indexed: ${authors.length}`);
  console.log(`Poetry linked: ${poetryUpdated}`);
  console.log(`Songs linked: ${songsUpdated}`);
  console.log(`History articles updated: ${historyUpdated}`);

  await mongoose.disconnect();
};

migrateAuthorReferences().catch(async (error) => {
  console.error("Failed to migrate author references:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
