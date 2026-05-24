import songService from "../services/song.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { pickSongPayload } from "../validators/resource.validators.js";

export const createSong = async (req, res) => {
  const song = await songService.create(pickSongPayload(req.body));
  return sendSuccess(res, 201, "Song created successfully.", song);
};

export const getSongs = async (req, res) => {
  const result = await songService.getAll(req.query);
  return sendSuccess(res, 200, "Songs retrieved successfully.", result.items, result.meta);
};

export const getSongByIdentifier = async (req, res) => {
  const song = await songService.getByIdentifier(req.params.identifier);
  return sendSuccess(res, 200, "Song retrieved successfully.", song);
};

export const updateSong = async (req, res) => {
  const song = await songService.update(req.params.identifier, pickSongPayload(req.body));
  return sendSuccess(res, 200, "Song updated successfully.", song);
};

export const deleteSong = async (req, res) => {
  const result = await songService.remove(req.params.identifier);
  return sendSuccess(res, 200, "Song deleted successfully.", result);
};
