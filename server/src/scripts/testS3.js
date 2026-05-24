import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_S3_BUCKET_NAME,
} = process.env;

const awsId = (AWS_ACCESS_KEY_ID || "").trim();
const awsSecret = (AWS_SECRET_ACCESS_KEY || "").trim();
const awsReg = (AWS_REGION || "").trim();
const awsBucket = (AWS_S3_BUCKET_NAME || "").trim();

console.log("Testing S3 client initialization with parameters:");
console.log("- AWS_ACCESS_KEY_ID:", awsId ? `[FOUND: ${awsId.substring(0, 8)}...]` : "[NOT FOUND]");
console.log("- AWS_SECRET_ACCESS_KEY:", awsSecret ? "[FOUND]" : "[NOT FOUND]");
console.log("- AWS_REGION:", awsReg);
console.log("- AWS_S3_BUCKET_NAME:", awsBucket);

const client = new S3Client({
  credentials: {
    accessKeyId: awsId,
    secretAccessKey: awsSecret,
  },
  region: awsReg,
});

const runTest = async () => {
  try {
    const textContent = "Suugaanta Soomaliyeed - AWS S3 Test connection file";
    const command = new PutObjectCommand({
      Bucket: awsBucket,
      Key: "test-connection-file.txt",
      Body: Buffer.from(textContent),
      ContentType: "text/plain",
    });

    console.log("Sending PutObjectCommand to S3...");
    const result = await client.send(command);
    console.log("S3 upload successful!");
    console.log("Result:", result);
    console.log(`URL: https://${awsBucket}.s3.${awsReg}.amazonaws.com/test-connection-file.txt`);
  } catch (error) {
    console.error("S3 upload failed with error:");
    console.error(error);
  }
};

runTest();
