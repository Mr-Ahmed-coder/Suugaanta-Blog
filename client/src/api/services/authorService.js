import api from '../axios';

export const getAuthors = async (params) => {
  return await api.get('/authors', { params });
};

export const getAuthorByIdentifier = async (identifier) => {
  return await api.get(`/authors/${identifier}`);
};

export const getAuthorProfile = async (slug) => {
  return await api.get(`/authors/${slug}/profile`);
};

export const getAuthorPoetry = async (slug, params) => {
  return await api.get(`/authors/${slug}/poetry`, { params });
};

export const getAuthorSongs = async (slug, params) => {
  return await api.get(`/authors/${slug}/songs`, { params });
};

export const getAuthorHistory = async (slug, params) => {
  return await api.get(`/authors/${slug}/history`, { params });
};

export const searchAuthorLibrary = async (slug, params) => {
  return await api.get(`/authors/${slug}/library/search`, { params });
};

export const createAuthor = async (data) => {
  return await api.post('/authors', data);
};

export const updateAuthor = async (id, data) => {
  return await api.put(`/authors/${id}`, data);
};

export const deleteAuthor = async (id) => {
  return await api.delete(`/authors/${id}`);
};
