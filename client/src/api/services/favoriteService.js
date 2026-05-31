import api from "../axios";

export const addFavorite = async (data) => {
  return await api.post("/favorites", data);
};

export const removeFavorite = async (resourceType, resourceId) => {
  return await api.delete(`/favorites/${resourceType}/${resourceId}`);
};

export const getMyFavorites = async () => {
  return await api.get("/favorites/me");
};

export const getFavoriteStatus = async (resourceType, resourceId) => {
  return await api.get(`/favorites/status/${resourceType}/${resourceId}`);
};
