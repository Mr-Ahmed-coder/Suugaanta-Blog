import ApiError from "../utils/api-error.js";

const allowedSortValues = ["latest", "oldest", "newest"];

export const validateListQuery = (req, _res, next) => {
  const { page, limit, sort } = req.query;

  if (page && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    return next(new ApiError(400, "The page query parameter must be a positive integer."));
  }

  if (limit && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    return next(new ApiError(400, "The limit query parameter must be an integer between 1 and 100."));
  }

  if (sort && !allowedSortValues.includes(String(sort).toLowerCase())) {
    return next(new ApiError(400, "The sort query parameter must be either latest or oldest."));
  }

  return next();
};
