// This service is intentionally kept as a placeholder for future AWS S3 integration.
// Keeping storage concerns isolated now will make the later media upload work cleaner.
export const storageService = {
  uploadFile: async () => {
    throw new Error("S3 integration has not been implemented yet.");
  },
};
