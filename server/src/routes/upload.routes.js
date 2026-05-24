import express from "express";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import {
  uploadImage,
  uploadAudio,
  uploadDocument,
  handleMulterErrors,
} from "../middleware/upload.middleware.js";
import { uploadFile } from "../services/s3Service.js";

const router = express.Router();

// Apply global auth protection to all upload endpoints
router.use(protect);
router.use(restrictTo("admin", "editor"));

/**
 * Helper to process the upload request asynchronously and return a clean payload
 */
const handleUpload = (folderName, typeLabel) => {
  return async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please provide a file to upload.",
        });
      }

      const publicUrl = await uploadFile(req.file, folderName);

      return res.status(200).json({
        success: true,
        url: publicUrl,
        fileType: typeLabel,
        fileName: req.file.originalname,
        type: typeLabel,
      });
    } catch (error) {
      console.error(`Error uploading ${typeLabel}:`, error);
      return res.status(500).json({
        success: false,
        message: `An error occurred during file upload: ${error.message}`,
      });
    }
  };
};

router.post(
  "/image",
  uploadImage.single("file"),
  handleMulterErrors,
  handleUpload("images", "image")
);

router.post(
  "/audio",
  uploadAudio.single("file"),
  handleMulterErrors,
  handleUpload("audio", "audio")
);

router.post(
  "/document",
  uploadDocument.single("file"),
  handleMulterErrors,
  handleUpload("documents", "document")
);

export default router;
