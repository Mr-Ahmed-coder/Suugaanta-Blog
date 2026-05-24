import Author from "../models/Author.js";
import History from "../models/History.js";
import Poetry from "../models/Poetry.js";
import Song from "../models/Song.js";
import ApiError from "../utils/api-error.js";
import { sendSuccess } from "../utils/api-response.js";
import { buildListFilter, parseListQuery, resolveSortOption } from "../utils/query-builder.js";

const getAuthorBySlug = async (slug) => {
  const author = await Author.findOne({ slug })
    .populate("relatedAuthors", "name slug photo featuredImage specialties legacySummary birthYear deathYear");

  if (!author) {
    throw new ApiError(404, "Author profile not found.");
  }

  return author;
};

const paginateModel = async ({ model, filter, query, searchFields, populate }) => {
  const options = parseListQuery(query);
  const listFilter = buildListFilter({
    search: options.search,
    category: options.category,
    searchFields,
  });

  const finalFilter = {
    $and: [filter, listFilter].filter((entry) => Object.keys(entry).length > 0),
  };

  const findQuery = model
    .find(finalFilter)
    .sort(resolveSortOption(options.sort))
    .skip(options.skip)
    .limit(options.limit);

  if (populate) {
    findQuery.populate(populate);
  }

  const [items, totalItems] = await Promise.all([
    findQuery,
    model.countDocuments(finalFilter),
  ]);

  return {
    items,
    meta: {
      page: options.page,
      limit: options.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / options.limit) || 1,
      hasNextPage: options.page * options.limit < totalItems,
      hasPreviousPage: options.page > 1,
    },
  };
};

const poetryFilterForAuthor = (author) => ({
  author: author._id,
});

const songFilterForAuthor = (author) => ({
  $or: [
    { author: author._id },
    { writer: author._id },
    { composer: author._id },
    { relatedAuthors: author._id },
  ],
});

const historyFilterForAuthor = (author) => ({
  relatedAuthors: author._id,
});

export const getAuthorProfileBySlug = async (req, res) => {
  const author = await getAuthorBySlug(req.params.slug);

  const [poetryCount, songCount, historyCount] = await Promise.all([
    Poetry.countDocuments(poetryFilterForAuthor(author)),
    Song.countDocuments(songFilterForAuthor(author)),
    History.countDocuments(historyFilterForAuthor(author)),
  ]);

  return sendSuccess(res, 200, "Author profile retrieved successfully.", {
    author,
    libraryCounts: {
      poetry: poetryCount,
      songs: songCount,
      history: historyCount,
    },
  });
};

export const getAuthorPoetry = async (req, res) => {
  const author = await getAuthorBySlug(req.params.slug);
  const result = await paginateModel({
    model: Poetry,
    filter: poetryFilterForAuthor(author),
    query: req.query,
    searchFields: ["title", "poet", "content", "tags"],
    populate: [
      { path: "author", select: "name slug photo featuredImage specialties" },
      { path: "writer", select: "name slug photo featuredImage specialties" },
      { path: "composer", select: "name slug photo featuredImage specialties" },
      { path: "relatedAuthors", select: "name slug photo featuredImage specialties" },
    ],
  });

  return sendSuccess(res, 200, "Author poetry retrieved successfully.", result.items, result.meta);
};

export const getAuthorSongs = async (req, res) => {
  const author = await getAuthorBySlug(req.params.slug);
  const result = await paginateModel({
    model: Song,
    filter: songFilterForAuthor(author),
    query: req.query,
    searchFields: ["title", "artist", "performer", "description", "lyrics", "tags"],
    populate: { path: "author", select: "name slug photo featuredImage specialties" },
  });

  return sendSuccess(res, 200, "Author songs retrieved successfully.", result.items, result.meta);
};

export const getAuthorHistoryReferences = async (req, res) => {
  const author = await getAuthorBySlug(req.params.slug);
  const result = await paginateModel({
    model: History,
    filter: historyFilterForAuthor(author),
    query: req.query,
    searchFields: ["title", "content", "category", "tags", "references"],
    populate: { path: "relatedAuthors", select: "name slug photo featuredImage specialties" },
  });

  return sendSuccess(res, 200, "Author history references retrieved successfully.", result.items, result.meta);
};

export const searchInsideAuthorLibrary = async (req, res) => {
  const author = await getAuthorBySlug(req.params.slug);
  const query = { ...req.query, limit: Math.min(Number(req.query.limit) || 6, 12) };

  const [poetry, songs, history] = await Promise.all([
    paginateModel({
      model: Poetry,
      filter: poetryFilterForAuthor(author),
      query,
      searchFields: ["title", "poet", "content", "tags"],
      populate: [
        { path: "author", select: "name slug" },
        { path: "writer", select: "name slug" },
        { path: "composer", select: "name slug" },
        { path: "relatedAuthors", select: "name slug" },
      ],
    }),
    paginateModel({
      model: Song,
      filter: songFilterForAuthor(author),
      query,
      searchFields: ["title", "artist", "performer", "description", "lyrics", "tags"],
      populate: { path: "author", select: "name slug" },
    }),
    paginateModel({
      model: History,
      filter: historyFilterForAuthor(author),
      query,
      searchFields: ["title", "content", "category", "tags", "references"],
      populate: { path: "relatedAuthors", select: "name slug" },
    }),
  ]);

  return sendSuccess(res, 200, "Author library search completed successfully.", {
    poetry: poetry.items,
    songs: songs.items,
    history: history.items,
    meta: {
      poetry: poetry.meta,
      songs: songs.meta,
      history: history.meta,
    },
  });
};
