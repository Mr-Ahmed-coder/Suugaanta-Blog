import api from "../axios";

export const getRelatedContent = async (resourceType, resourceId, params = {}) => {
  return await api.get(`/related/${resourceType}/${resourceId}`, { params });
};
