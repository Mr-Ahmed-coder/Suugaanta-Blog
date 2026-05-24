import api from "../../api/axios";

/**
 * Uploads a file to the backend server.
 * @param {File} file - Browser File object
 * @param {string} type - 'image' | 'audio' | 'document'
 * @param {Function} onProgress - Optional callback for upload progress events
 * @returns {Promise<Object>} The API response payload containing the S3 or fallback URL
 */
export const uploadMediaFile = async (file, type, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const endpoint = `/upload/${type}`;

  const response = await api.post(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });

  return response;
};
