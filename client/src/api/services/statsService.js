import api from "../axios";

export const getStats = async () => {
  return await api.get("/stats");
};
