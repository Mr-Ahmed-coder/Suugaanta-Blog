import api from '../axios';

export const getHistory = async (params) => {
  return await api.get('/history', { params });
};

export const getHistoryByIdentifier = async (identifier) => {
  return await api.get(`/history/${identifier}`);
};

export const createHistory = async (data) => {
  return await api.post('/history', data);
};

export const updateHistory = async (id, data) => {
  return await api.put(`/history/${id}`, data);
};

export const deleteHistory = async (id) => {
  return await api.delete(`/history/${id}`);
};
