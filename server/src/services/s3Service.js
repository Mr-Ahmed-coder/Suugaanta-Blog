import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

import env from "../config/env.js";

let s3Client = null;

/**
 * Lazily initializes and returns the S3 client using trimmed environment credentials.
 */
const getS3Client = () => {
  if (s3Client) return s3Client;

  const awsId = (process.env.AWS_ACCESS_KEY_ID || "").trim();
  const awsSecret = (process.env.AWS_SECRET_ACCESS_KEY || "").trim();
  const awsRegion = (process.env.AWS_REGION || "").trim();
  const awsBucket = (env.awsBucketName || "").trim();

  if (awsId && awsSecret && awsRegion && awsBucket) {
    s3Client = new S3Client({
      credentials: {
        accessKeyId: awsId,
        secretAccessKey: awsSecret,
      },
      region: awsRegion,
    });
    console.log("🚀 S3 client successfully initialized dynamically.");
    return s3Client;
  }
  
  console.warn(
    "⚠️ AWS S3 credentials missing or incomplete. S3 uploads disabled."
  );
  return null;
};

/**
 * Clean and sanitize filename, preventing path traversals
 */
const sanitizeFilename = (filename) => {
  const extension = path.extname(filename);
  const base = path.basename(filename, extension);
  const cleanBase = base
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  return `${cleanBase}-${randomSuffix}${extension}`;
};

/**
 * Uploads a file buffer either to S3 or writes it to local disk fallback.
 * @param {Object} file - Multer file object
 * @param {string} folder - Destination subfolder (e.g. 'images', 'audio')
 * @returns {Promise<string>} Public URL of the uploaded asset
 */
export const uploadFile = async (file, folder) => {
  const cleanName = sanitizeFilename(file.originalname);
  const key = `${folder}/${cleanName}`;

  const client = getS3Client();
  const awsBucket = (env.awsBucketName || "").trim();
  const awsRegion = (process.env.AWS_REGION || "").trim();

  if (client && awsBucket) {
    try {
      // S3 Cloud Upload
      const command = new PutObjectCommand({
        Bucket: awsBucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await client.send(command);
      return `https://${awsBucket}.s3.${awsRegion}.amazonaws.com/${key}`;
    } catch (s3Error) {
      console.warn(
        `⚠️ S3 upload failed (Error: ${s3Error.message}). Gracefully falling back to local storage.`
      );
    }
  }

  // Local Fallback Upload
  const uploadDir = path.join(process.cwd(), "uploads", folder);
  
  // Ensure nested folder exists
  await fs.mkdir(uploadDir, { recursive: true });
  
  const filePath = path.join(uploadDir, cleanName);
  await fs.writeFile(filePath, file.buffer);
  
  // Construct local server public URL
  const publicBaseUrl = env.serverUrl.replace(/\/$/, "");
  return `${publicBaseUrl}/uploads/${folder}/${cleanName}`;
};
