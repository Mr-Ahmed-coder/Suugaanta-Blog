import api from "../axios";

export const globalSearch = async (params) => {
  return await api.get("/search", { params });
};
