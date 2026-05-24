import api from '../axios';

export const getSongs = async (params) => {
  return await api.get('/songs', { params });
};

export const getSongByIdentifier = async (identifier) => {
  return await api.get(`/songs/${identifier}`);
};

export const createSong = async (data) => {
  return await api.post('/songs', data);
};

export const updateSong = async (id, data) => {
  return await api.put(`/songs/${id}`, data);
};

export const deleteSong = async (id) => {
  return await api.delete(`/songs/${id}`);
};
