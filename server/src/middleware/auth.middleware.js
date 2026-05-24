import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/api-error.js";
import asyncHandler from "../utils/async-handler.js";
import env from "../config/env.js";

/**
 * Middleware to protect routes against unauthenticated requests.
 * Extracts the JWT from secure HTTPOnly cookies or the standard Authorization Bearer header.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  let token;

  // 1. Retrieve token from Cookies or Authorization Header
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "You are not logged in. Please log in to gain access.");
  }

  // 2. Verify token
  let decoded;
  try {
    if (!env.jwtSecret) {
      throw new ApiError(500, "JWT_SECRET is missing from the server environment.");
    }

    decoded = jwt.verify(token, env.jwtSecret);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Your login session has expired. Please log in again.");
    }
    throw new ApiError(401, "Invalid login credentials. Please log in again.");
  }

  // 3. Fetch user and verify they still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new ApiError(401, "The user belonging to this login token no longer exists.");
  }

  // 4. Attach user to request context for subsequent routing and logging
  req.user = currentUser;
  next();
});

/**
 * Role-based authorization middleware (RBAC).
 * Restricts access to specified roles (e.g. 'admin', 'editor').
 */
export const restrictTo = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(500, "Authentication context is missing. Ensure protect middleware is placed before restrictTo.");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Access Denied. You do not have permissions to perform this action.");
    }

    next();
  };
};
