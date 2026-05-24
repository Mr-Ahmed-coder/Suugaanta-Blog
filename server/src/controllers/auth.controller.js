import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/api-error.js";
import asyncHandler from "../utils/async-handler.js";
import { sendSuccess } from "../utils/api-response.js";

// Helper function to sign JWT tokens
const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "your_jwt_secret_key",
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

// Helper function to send token securely in cookies
const sendTokenResponse = (user, statusCode, message, res) => {
  const token = signToken(user._id);

  // Set HTTPOnly secure cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + 24 * 60 * 60 * 1000 // expires in 1 day (default matches 1d expire config)
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  // Strip password before sending response
  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;

  res.cookie("token", token, cookieOptions);

  return sendSuccess(res, statusCode, message, {
    user: sanitizedUser,
    token, // Return token for versatility (e.g. storage by clients not supporting cookies)
  });
};

/**
 * Register a new user profile.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // 1. Basic validation
  if (!name || !email || !password) {
    throw new ApiError(400, "All fields (name, email, password) are required to register.");
  }

  // 2. Prevent role-escalation in public registrations (ALWAYS forcing 'user')
  // We completely ignore the `role` from req.body to prevent payload hijacking.
  const registrationRole = "user";

  // 3. Create user
  const newUser = await User.create({
    name,
    email,
    password,
    role: registrationRole,
  });

  return sendTokenResponse(newUser, 201, "Registration completed successfully!", res);
});

/**
 * Authenticate existing credentials and sign a login token.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Check if email and password are provided
  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password credentials.");
  }

  // 2. Query user and explicitly select hidden password field
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password. Please try again.");
  }

  return sendTokenResponse(user, 200, "Login completed successfully!", res);
});

/**
 * Terminate the user session and clear active token cookies.
 */
export const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return sendSuccess(res, 200, "Logout completed successfully!");
});

/**
 * Retrieve authenticated profile context.
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user.toObject();
  delete user.password;

  return sendSuccess(res, 200, "Session profile retrieved successfully.", user);
});
