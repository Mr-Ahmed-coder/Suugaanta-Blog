import Author from "../models/Author.js";
import History from "../models/History.js";
import Poetry from "../models/Poetry.js";
import Song from "../models/Song.js";
import User from "../models/User.js";
import { sendSuccess } from "../utils/api-response.js";

export const getStats = async (_req, res) => {
  const [songs, poetry, history, authors, users] = await Promise.all([
    Song.countDocuments(),
    Poetry.countDocuments(),
    History.countDocuments(),
    Author.countDocuments(),
    User.countDocuments(),
  ]);

  return sendSuccess(res, 200, "Statistics retrieved successfully.", {
    songs,
    poetry,
    history,
    authors,
    users,
  });
};
