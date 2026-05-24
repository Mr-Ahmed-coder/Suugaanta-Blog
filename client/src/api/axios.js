import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toLowerCase();
    const url = response.config?.url || "";
    const shouldInvalidateStats =
      ["post", "put", "patch", "delete"].includes(method) &&
      /^\/(songs|poetry|history|authors|abwaano)(\/|$)/.test(url);

    if (shouldInvalidateStats && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("archive:stats-invalidated"));
    }

    return response.data;
  },
  (error) => {
    // Handle global errors here
    return Promise.reject(error);
  }
);

export default api;
