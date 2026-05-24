const sortMap = {
  latest: { createdAt: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
};

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const parseListQuery = (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const category = typeof query.category === "string" ? query.category.trim() : "";
  const sort = typeof query.sort === "string" ? query.sort.trim().toLowerCase() : "latest";

  return {
    page,
    limit,
    search,
    category,
    sort,
    skip: (page - 1) * limit,
  };
};

export const buildListFilter = ({ search, category, searchFields = [] }) => {
  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (search && searchFields.length > 0) {
    const safeSearch = escapeRegex(search);

    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: safeSearch, $options: "i" },
    }));
  }

  return filter;
};

export const resolveSortOption = (sort) => sortMap[sort] || sortMap.latest;
