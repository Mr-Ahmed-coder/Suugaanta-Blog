import slugify from "./slugify.js";

const buildUniqueSlug = async (model, sourceValue, currentId = null) => {
  const baseSlug = slugify(sourceValue) || "item";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingDocument = await model.findOne({ slug }).select("_id").lean();

    if (!existingDocument || existingDocument._id.toString() === currentId?.toString()) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

export default buildUniqueSlug;
