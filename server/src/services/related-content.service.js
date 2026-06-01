import mongoose from "mongoose";
import Author from "../models/Author.js";
import History from "../models/History.js";
import Poetry from "../models/Poetry.js";
import Song from "../models/Song.js";
import ApiError from "../utils/api-error.js";

const authorSelect = "name slug photo featuredImage specialties legacySummary biography tags";

const resourceConfig = {
  author: {
    model: Author,
    select: `${authorSelect} relatedAuthors`,
    populate: { path: "relatedAuthors", select: authorSelect },
  },
  song: {
    model: Song,
    select: "title slug artist performer description lyrics category tags thumbnail author writer composer relatedAuthors",
    populate: [
      { path: "author", select: authorSelect },
      { path: "writer", select: authorSelect },
      { path: "composer", select: authorSelect },
      { path: "relatedAuthors", select: authorSelect },
    ],
  },
  poetry: {
    model: Poetry,
    select: "title slug poet content category tags author",
    populate: { path: "author", select: authorSelect },
  },
  history: {
    model: History,
    select: "title slug content category tags coverImage relatedAuthors",
    populate: { path: "relatedAuthors", select: authorSelect },
  },
};

const contentSelect = {
  song: resourceConfig.song.select,
  poetry: resourceConfig.poetry.select,
  history: resourceConfig.history.select,
};

const contentPopulate = {
  song: resourceConfig.song.populate,
  poetry: resourceConfig.poetry.populate,
  history: resourceConfig.history.populate,
};

const normalizeList = (values = []) =>
  [...new Set((Array.isArray(values) ? values : [values]).filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];

const getIdString = (value) => {
  if (!value) return null;
  if (value._id) return value._id.toString();
  return value.toString();
};

const collectAuthorIds = (resourceType, item) => {
  const ids = new Set();

  if (resourceType === "author") {
    ids.add(item._id.toString());
    item.relatedAuthors?.forEach((author) => {
      const id = getIdString(author);
      if (id) ids.add(id);
    });
    return [...ids];
  }

  [item.author, item.writer, item.composer].forEach((author) => {
    const id = getIdString(author);
    if (id) ids.add(id);
  });

  item.relatedAuthors?.forEach((author) => {
    const id = getIdString(author);
    if (id) ids.add(id);
  });

  return [...ids];
};

const collectTags = (item) => normalizeList([...(item.tags || []), ...(item.specialties || [])]);

const buildOrFilter = (conditions) => {
  const usableConditions = conditions.filter((condition) => Object.keys(condition).length > 0);
  return usableConditions.length ? { $or: usableConditions } : {};
};

const buildContentConditions = ({ resourceType, authorIds, tags, category }) => {
  const objectAuthorIds = authorIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  const conditions = [];

  if (objectAuthorIds.length) {
    if (resourceType === "song") {
      conditions.push(
        { author: { $in: objectAuthorIds } },
        { writer: { $in: objectAuthorIds } },
        { composer: { $in: objectAuthorIds } },
        { relatedAuthors: { $in: objectAuthorIds } }
      );
    }

    if (resourceType === "poetry") {
      conditions.push({ author: { $in: objectAuthorIds } });
    }

    if (resourceType === "history") {
      conditions.push({ relatedAuthors: { $in: objectAuthorIds } });
    }
  }

  if (tags.length) {
    conditions.push({ tags: { $in: tags } });
  }

  if (category) {
    conditions.push({ category });
  }

  return buildOrFilter(conditions);
};

const buildAuthorConditions = ({ currentType, currentId, authorIds, tags }) => {
  const objectAuthorIds = authorIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  const conditions = [];

  if (objectAuthorIds.length) {
    conditions.push({ _id: { $in: objectAuthorIds } }, { relatedAuthors: { $in: objectAuthorIds } });
  }

  if (tags.length) {
    conditions.push({ tags: { $in: tags } }, { specialties: { $in: tags } });
  }

  if (currentType === "author" && mongoose.Types.ObjectId.isValid(currentId)) {
    conditions.push({ relatedAuthors: new mongoose.Types.ObjectId(currentId) });
  }

  return buildOrFilter(conditions);
};

const findResourceById = async (resourceType, id) => {
  const config = resourceConfig[resourceType];

  if (!config) {
    throw new ApiError(400, "Invalid related content resource type.");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid related content resource id.");
  }

  let query = config.model.findById(id).select(config.select);

  if (config.populate) {
    query = query.populate(config.populate);
  }

  const item = await query.lean();

  if (!item) {
    throw new ApiError(404, "Archive item not found.");
  }

  return item;
};

const runRelatedQuery = async ({ model, filter, select, populate, limit }) => {
  if (!Object.keys(filter).length) return [];

  let query = model.find(filter).select(select).sort({ createdAt: -1 }).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  return query.lean();
};

const buildExclusion = (targetType, currentType, currentId) =>
  targetType === currentType ? { _id: { $ne: new mongoose.Types.ObjectId(currentId) } } : {};

const getRelatedContent = async (resourceType, id, requestedLimit) => {
  const item = await findResourceById(resourceType, id);
  const limit = Math.min(Math.max(Number(requestedLimit) || 4, 1), 6);
  const authorIds = collectAuthorIds(resourceType, item);
  const tags = collectTags(item);
  const category = item.category;

  const authorFilter = {
    ...buildExclusion("author", resourceType, id),
    ...buildAuthorConditions({ currentType: resourceType, currentId: id, authorIds, tags }),
  };

  const songFilter = {
    ...buildExclusion("song", resourceType, id),
    ...buildContentConditions({ resourceType: "song", authorIds, tags, category }),
  };

  const poetryFilter = {
    ...buildExclusion("poetry", resourceType, id),
    ...buildContentConditions({ resourceType: "poetry", authorIds, tags, category }),
  };

  const historyFilter = {
    ...buildExclusion("history", resourceType, id),
    ...buildContentConditions({ resourceType: "history", authorIds, tags, category }),
  };

  const [relatedAuthors, relatedSongs, relatedPoetry, relatedHistory] = await Promise.all([
    runRelatedQuery({ model: Author, filter: authorFilter, select: authorSelect, limit }),
    runRelatedQuery({ model: Song, filter: songFilter, select: contentSelect.song, populate: contentPopulate.song, limit }),
    runRelatedQuery({ model: Poetry, filter: poetryFilter, select: contentSelect.poetry, populate: contentPopulate.poetry, limit }),
    runRelatedQuery({ model: History, filter: historyFilter, select: contentSelect.history, populate: contentPopulate.history, limit }),
  ]);

  return {
    relatedAuthors,
    relatedSongs,
    relatedPoetry,
    relatedHistory,
  };
};

export default {
  getRelatedContent,
};
