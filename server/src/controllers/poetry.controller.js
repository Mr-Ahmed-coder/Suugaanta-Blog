import poetryService from "../services/poetry.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { pickPoetryPayload } from "../validators/resource.validators.js";

export const createPoetry = async (req, res) => {
  const poetry = await poetryService.create(pickPoetryPayload(req.body));
  return sendSuccess(res, 201, "Poetry created successfully.", poetry);
};

export const getPoetryCollection = async (req, res) => {
  const result = await poetryService.getAll(req.query);
  return sendSuccess(res, 200, "Poetry retrieved successfully.", result.items, result.meta);
};

export const getPoetryByIdentifier = async (req, res) => {
  const poetry = await poetryService.getByIdentifier(req.params.identifier);
  return sendSuccess(res, 200, "Poetry retrieved successfully.", poetry);
};

export const updatePoetry = async (req, res) => {
  const poetry = await poetryService.update(req.params.identifier, pickPoetryPayload(req.body));
  return sendSuccess(res, 200, "Poetry updated successfully.", poetry);
};

export const deletePoetry = async (req, res) => {
  const result = await poetryService.remove(req.params.identifier);
  return sendSuccess(res, 200, "Poetry deleted successfully.", result);
};
