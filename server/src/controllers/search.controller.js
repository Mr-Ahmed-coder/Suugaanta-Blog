import Author from "../models/Author.js";
import History from "../models/History.js";
import Poetry from "../models/Poetry.js";
import Song from "../models/Song.js";
import { sendSuccess } from "../utils/api-response.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildSearchFilter = (query, fields) => {
  const safeQuery = escapeRegex(query);

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: safeQuery, $options: "i" },
    })),
  };
};

const resolveLimit = (limit) => Math.min(Math.max(Number(limit) || 5, 1), 20);

const searchCollection = async ({ model, query, fields, limit, projection, populate }) => {
  const filter = buildSearchFilter(query, fields);
  const findQuery = model.find(filter).sort({ createdAt: -1 }).limit(limit).select(projection);

  if (populate) {
    findQuery.populate(populate);
  }

  const [items, count] = await Promise.all([
    findQuery.lean(),
    model.countDocuments(filter),
  ]);

  return { items, count };
};

export const globalSearch = async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const limit = resolveLimit(req.query.limit);

  if (!query) {
    return sendSuccess(res, 200, "Search results retrieved successfully.", {
      authors: [],
      songs: [],
      poetry: [],
      history: [],
      meta: {
        query,
        authorsCount: 0,
        songsCount: 0,
        poetryCount: 0,
        historyCount: 0,
        totalResults: 0,
      },
    });
  }

  const [authors, songs, poetry, history] = await Promise.all([
    searchCollection({
      model: Author,
      query,
      limit,
      fields: ["name", "biography", "legacySummary", "specialties", "tags", "archiveMetadata.era", "archiveMetadata.region"],
      projection: "name slug biography legacySummary photo featuredImage specialties tags birthYear deathYear",
    }),
    searchCollection({
      model: Song,
      query,
      limit,
      fields: ["title", "artist", "performer", "description", "lyrics", "category", "tags"],
      projection: "title slug artist performer description lyrics category tags thumbnail createdAt writer composer author relatedAuthors",
      populate: [
        { path: "writer", select: "name slug" },
        { path: "composer", select: "name slug" },
        { path: "author", select: "name slug" },
        { path: "relatedAuthors", select: "name slug" },
      ],
    }),
    searchCollection({
      model: Poetry,
      query,
      limit,
      fields: ["title", "poet", "content", "category", "tags"],
      projection: "title slug poet content category tags author createdAt",
      populate: { path: "author", select: "name slug" },
    }),
    searchCollection({
      model: History,
      query,
      limit,
      fields: ["title", "content", "category", "tags", "references"],
      projection: "title slug content category tags coverImage relatedAuthors createdAt",
      populate: { path: "relatedAuthors", select: "name slug" },
    }),
  ]);

  return sendSuccess(res, 200, "Search results retrieved successfully.", {
    authors: authors.items,
    songs: songs.items,
    poetry: poetry.items,
    history: history.items,
    meta: {
      query,
      authorsCount: authors.count,
      songsCount: songs.count,
      poetryCount: poetry.count,
      historyCount: history.count,
      totalResults: authors.count + songs.count + poetry.count + history.count,
    },
  });
};
