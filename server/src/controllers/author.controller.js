import authorService from "../services/author.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { pickAuthorPayload } from "../validators/resource.validators.js";

export const createAuthor = async (req, res) => {
  const author = await authorService.create(pickAuthorPayload(req.body));
  return sendSuccess(res, 201, "Author created successfully.", author);
};

export const getAuthors = async (req, res) => {
  const result = await authorService.getAll(req.query);
  return sendSuccess(res, 200, "Authors retrieved successfully.", result.items, result.meta);
};

export const getAuthorByIdentifier = async (req, res) => {
  const author = await authorService.getByIdentifier(req.params.identifier);
  return sendSuccess(res, 200, "Author retrieved successfully.", author);
};

export const updateAuthor = async (req, res) => {
  const author = await authorService.update(req.params.identifier, pickAuthorPayload(req.body));
  return sendSuccess(res, 200, "Author updated successfully.", author);
};

export const deleteAuthor = async (req, res) => {
  const result = await authorService.remove(req.params.identifier);
  return sendSuccess(res, 200, "Author deleted successfully.", result);
};
