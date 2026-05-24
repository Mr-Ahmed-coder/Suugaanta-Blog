import mongoose from "mongoose";

const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  let details = error.details || null;

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed.";
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error?.code === 11000) {
    statusCode = 409;
    message = error.keyPattern?.normalizedName
      ? "This author already exists. Use the existing canonical author profile."
      : "A unique field value already exists.";
    details = error.keyValue;
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};

export { notFound, errorHandler };
