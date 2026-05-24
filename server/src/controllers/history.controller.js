import historyService from "../services/history.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { pickHistoryPayload } from "../validators/resource.validators.js";

export const createHistory = async (req, res) => {
  const article = await historyService.create(pickHistoryPayload(req.body));
  return sendSuccess(res, 201, "History article created successfully.", article);
};

export const getHistoryCollection = async (req, res) => {
  const result = await historyService.getAll(req.query);
  return sendSuccess(res, 200, "History articles retrieved successfully.", result.items, result.meta);
};

export const getHistoryByIdentifier = async (req, res) => {
  const article = await historyService.getByIdentifier(req.params.identifier);
  return sendSuccess(res, 200, "History article retrieved successfully.", article);
};

export const updateHistory = async (req, res) => {
  const article = await historyService.update(req.params.identifier, pickHistoryPayload(req.body));
  return sendSuccess(res, 200, "History article updated successfully.", article);
};

export const deleteHistory = async (req, res) => {
  const result = await historyService.remove(req.params.identifier);
  return sendSuccess(res, 200, "History article deleted successfully.", result);
};
