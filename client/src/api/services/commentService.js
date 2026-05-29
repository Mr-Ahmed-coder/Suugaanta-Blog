import api from "../axios";

export const getCommentsByResource = async (resourceType, resourceId) => {
  return await api.get(`/comments/${resourceType}/${resourceId}`);
};

export const createComment = async (data) => {
  return await api.post("/comments", data);
};

export const updateComment = async (id, data) => {
  return await api.patch(`/comments/${id}`, data);
};

export const deleteComment = async (id) => {
  return await api.delete(`/comments/${id}`);
};
