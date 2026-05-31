import mongoose from "mongoose";
import Author from "../models/Author.js";
import Favorite from "../models/Favorite.js";
import History from "../models/History.js";
import Poetry from "../models/Poetry.js";
import Song from "../models/Song.js";
import ApiError from "../utils/api-error.js";
import { sendSuccess } from "../utils/api-response.js";

const resourceConfig = {
  author: {
    model: Author,
    select: "name slug biography legacySummary photo featuredImage specialties birthYear deathYear",
  },
  song: {
    model: Song,
    select: "title slug artist performer description lyrics category thumbnail writer composer author",
    populate: [
      { path: "writer", select: "name slug" },
      { path: "composer", select: "name slug" },
      { path: "author", select: "name slug" },
    ],
  },
  poetry: {
    model: Poetry,
    select: "title slug poet content category author",
    populate: { path: "author", select: "name slug" },
  },
  history: {
    model: History,
    select: "title slug content category coverImage relatedAuthors",
    populate: { path: "relatedAuthors", select: "name slug" },
  },
};

const validateFavoriteTarget = (resourceType, resourceId) => {
  if (!resourceConfig[resourceType]) {
    throw new ApiError(400, "Invalid favorite resource type.");
  }

  if (!mongoose.Types.ObjectId.isValid(resourceId)) {
    throw new ApiError(400, "Invalid favorite resource id.");
  }
};

const getResourceDocument = async (resourceType, resourceId) => {
  const config = resourceConfig[resourceType];
  let query = config.model.findById(resourceId).select(config.select);

  if (config.populate) {
    query = query.populate(config.populate);
  }

  const item = await query.lean();

  if (!item) {
    throw new ApiError(404, "The archive item you are trying to save was not found.");
  }

  return item;
};

const attachItemsToFavorites = async (favorites) => {
  const groupedIds = favorites.reduce((groups, favorite) => {
    groups[favorite.resourceType] = groups[favorite.resourceType] || [];
    groups[favorite.resourceType].push(favorite.resourceId);
    return groups;
  }, {});

  const itemMaps = {};

  await Promise.all(
    Object.entries(groupedIds).map(async ([resourceType, ids]) => {
      const config = resourceConfig[resourceType];
      let query = config.model.find({ _id: { $in: ids } }).select(config.select);

      if (config.populate) {
        query = query.populate(config.populate);
      }

      const items = await query.lean();
      itemMaps[resourceType] = new Map(items.map((item) => [item._id.toString(), item]));
    })
  );

  return favorites.map((favorite) => ({
    _id: favorite._id,
    user: favorite.user,
    resourceType: favorite.resourceType,
    resourceId: favorite.resourceId,
    createdAt: favorite.createdAt,
    updatedAt: favorite.updatedAt,
    item: itemMaps[favorite.resourceType]?.get(favorite.resourceId.toString()) || null,
  }));
};

const groupFavorites = (favorites) => ({
  authors: favorites.filter((favorite) => favorite.resourceType === "author" && favorite.item),
  songs: favorites.filter((favorite) => favorite.resourceType === "song" && favorite.item),
  poetry: favorites.filter((favorite) => favorite.resourceType === "poetry" && favorite.item),
  history: favorites.filter((favorite) => favorite.resourceType === "history" && favorite.item),
});

export const addFavorite = async (req, res) => {
  const { resourceType, resourceId } = req.body;

  validateFavoriteTarget(resourceType, resourceId);
  const item = await getResourceDocument(resourceType, resourceId);

  const existingFavorite = await Favorite.findOne({
    user: req.user._id,
    resourceType,
    resourceId,
  }).lean();

  if (existingFavorite) {
    return sendSuccess(res, 200, "Archive item is already saved in your library.", {
      ...existingFavorite,
      item,
    });
  }

  let favorite;

  try {
    favorite = await Favorite.create({ user: req.user._id, resourceType, resourceId });
  } catch (error) {
    if (error?.code !== 11000) {
      throw error;
    }

    favorite = await Favorite.findOne({ user: req.user._id, resourceType, resourceId }).lean();

    return sendSuccess(res, 200, "Archive item is already saved in your library.", {
      ...favorite,
      item,
    });
  }

  return sendSuccess(res, 201, "Archive item saved to your library.", {
    ...favorite.toObject(),
    item,
  });
};

export const removeFavorite = async (req, res) => {
  const { resourceType, resourceId } = req.params;

  validateFavoriteTarget(resourceType, resourceId);

  const favorite = await Favorite.findOneAndDelete({
    user: req.user._id,
    resourceType,
    resourceId,
  }).lean();

  return sendSuccess(res, 200, "Archive item removed from your library.", {
    removed: Boolean(favorite),
    resourceType,
    resourceId,
  });
};

export const getMyFavorites = async (req, res) => {
  const favorites = await Favorite.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  const hydratedFavorites = await attachItemsToFavorites(favorites);
  const grouped = groupFavorites(hydratedFavorites);

  return sendSuccess(res, 200, "Your library was retrieved successfully.", {
    ...grouped,
    meta: {
      authorsCount: grouped.authors.length,
      songsCount: grouped.songs.length,
      poetryCount: grouped.poetry.length,
      historyCount: grouped.history.length,
      totalItems: grouped.authors.length + grouped.songs.length + grouped.poetry.length + grouped.history.length,
    },
  });
};

export const checkFavoriteStatus = async (req, res) => {
  const { resourceType, resourceId } = req.params;

  validateFavoriteTarget(resourceType, resourceId);

  const favorite = await Favorite.findOne({
    user: req.user._id,
    resourceType,
    resourceId,
  }).select("_id").lean();

  return sendSuccess(res, 200, "Favorite status retrieved successfully.", {
    saved: Boolean(favorite),
    favoriteId: favorite?._id || null,
  });
};
