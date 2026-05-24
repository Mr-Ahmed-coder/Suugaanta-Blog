import api from '../axios';

export const getPoetry = async (params) => {
  return await api.get('/poetry', { params });
};

export const getPoetryByIdentifier = async (identifier) => {
  return await api.get(`/poetry/${identifier}`);
};

export const createPoetry = async (data) => {
  return await api.post('/poetry', data);
};

export const updatePoetry = async (id, data) => {
  return await api.put(`/poetry/${id}`, data);
};

export const deletePoetry = async (id) => {
  return await api.delete(`/poetry/${id}`);
};
