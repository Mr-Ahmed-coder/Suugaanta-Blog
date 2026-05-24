import mongoose from "mongoose";
import ApiError from "../utils/api-error.js";
import buildUniqueSlug from "../utils/build-slug.js";
import { buildListFilter, parseListQuery, resolveSortOption } from "../utils/query-builder.js";

const findByIdentifier = async (model, identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const byId = await model.findById(identifier);

    if (byId) {
      return byId;
    }
  }

  return model.findOne({ slug: identifier });
};

export const createCrudService = ({
  model,
  entityName,
  titleField,
  searchFields,
  supportsCategory = true,
  populate = null,
}) => ({
  async create(payload) {
    const document = await model.create(payload);
    return populate ? document.populate(populate) : document;
  },

  async getAll(query) {
    const options = parseListQuery(query);
    const filter = buildListFilter({
      search: options.search,
      category: supportsCategory ? options.category : "",
      searchFields,
    });

    const findQuery = model
      .find(filter)
      .sort(resolveSortOption(options.sort))
      .skip(options.skip)
      .limit(options.limit);

    if (populate) {
      findQuery.populate(populate);
    }

    const [items, totalItems] = await Promise.all([
      findQuery,
      model.countDocuments(filter),
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
  },

  async getByIdentifier(identifier) {
    const document = await findByIdentifier(model, identifier);

    if (!document) {
      throw new ApiError(404, `${entityName} not found.`);
    }

    return populate ? document.populate(populate) : document;
  },

  async update(identifier, payload) {
    if (Object.keys(payload).length === 0) {
      throw new ApiError(400, `No valid ${entityName.toLowerCase()} fields were provided for update.`);
    }

    const existingDocument = await findByIdentifier(model, identifier);

    if (!existingDocument) {
      throw new ApiError(404, `${entityName} not found.`);
    }

    Object.assign(existingDocument, payload);

    if (payload[titleField]) {
      existingDocument.slug = await buildUniqueSlug(model, payload[titleField], existingDocument._id);
    }

    await existingDocument.save();
    return populate ? existingDocument.populate(populate) : existingDocument;
  },

  async remove(identifier) {
    const document = await findByIdentifier(model, identifier);

    if (!document) {
      throw new ApiError(404, `${entityName} not found.`);
    }

    await document.deleteOne();

    return {
      id: document._id,
      slug: document.slug,
    };
  },
});
