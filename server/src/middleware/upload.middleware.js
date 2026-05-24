import multer from "multer";

// We use memory storage to buffer the file cleanly in memory before dispatching to S3/Disk
const storage = multer.memoryStorage();

// File size limits in bytes
const IMAGE_LIMIT = 5 * 1024 * 1024;      // 5MB
const AUDIO_LIMIT = 20 * 1024 * 1024;    // 20MB
const DOCUMENT_LIMIT = 10 * 1024 * 1024; // 10MB

// Supported mime-types
const SUPPORTED_IMAGES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const SUPPORTED_AUDIO = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4", "audio/m4a", "audio/ogg"];
const SUPPORTED_DOCS = ["application/pdf"];

const fileFilterCreator = (allowedTypes, typeName) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type for ${typeName}.`
        ),
        false
      );
    }
  };
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: IMAGE_LIMIT },
  fileFilter: fileFilterCreator(SUPPORTED_IMAGES, "image"),
});

export const uploadAudio = multer({
  storage,
  limits: { fileSize: AUDIO_LIMIT },
  fileFilter: fileFilterCreator(SUPPORTED_AUDIO, "audio"),
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: DOCUMENT_LIMIT },
  fileFilter: fileFilterCreator(SUPPORTED_DOCS, "pdf document"),
});

/**
 * Global multer error handling wrapper to output clean localized responses
 */
export const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the allowed limit.",
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};
