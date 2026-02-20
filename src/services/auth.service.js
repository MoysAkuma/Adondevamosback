/**
 * Authentication Service
 * Handles all authentication-related business logic
 */

import jwt from 'jsonwebtoken';
import userService from './users.service.js';
import sessionService from './session.service.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

/**
 * Email validation function
 * @param {string} input - String to validate
 * @returns {boolean} True if valid email
 */
const isEmail = (input) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

/**
 * Generates a JWT token for a user
 * @param {Object} payload - User data to include in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  try {
    const token = jwt.sign(
      payload,
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
    return token;
  } catch (error) {
    throw new ApiError(500, 'Error generating token', error);
  }
};

/**
 * Verifies and decodes a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
};

/**
 * Authenticates a user and creates a session
 * @param {string} id - Email or tag
 * @param {string} password - User password
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} User data and authentication status
 */
const login = async (id, password, req) => {
  try {
    // Check if id is email or tag
    const checkisEmail = isEmail(id);
    
    // Search user
    const data = checkisEmail
      ? await userService.searchByEmail(id, password)
      : await userService.searchByTag(id, password);
    
    // Validate user found
    if (data.status !== 200) {
      throw new ApiError(500, "Service error");
    }
    
    if (!data.data || data.data.id == null) {
      throw new ApiError(404, 'User not found');
    }
    
    // Check if user is admin
    const isAdmin = (await userService.checkAdminRole(data.data.id)).data.isAdmin;
    
    // Generate JWT token
    const token = generateToken({
      id: data.data.id,
      tag: data.data.tag,
      isAdmin: !!isAdmin,
      role: isAdmin ? 'admin' : 'user'
    });
    
    // Create session (optional - you can remove this if you want JWT-only auth)
    await sessionService.createSession(req, {
      id: data.data.id,
      isAdmin: !!isAdmin
    });
    
    return {
      user: {
        id: data.data.id,
        tag: data.data.tag,
        role: isAdmin ? 'admin' : 'user',
        name: data.data.name,
        lastname: data.data.lastname
      },
      token,
      status: data.status
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Logs out a user by destroying their session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const logout = async (req, res) => {
  try {
    await sessionService.destroySession(req, res);
  } catch (error) {
    throw new ApiError(500, 'Error logging out', error);
  }
};

/**
 * Checks if a user is authenticated
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Authentication status and user info
 */
const checkAuth = async (req) => {
  try {
    const sessionData = sessionService.validateSession(req);
    
    if (!sessionData.isValid) {
      throw new ApiError(401, 'User not authenticated');
    }
    
    // Verify user still exists in database
    const data = await userService.getUserById(sessionData.userId);
    
    if (data.status !== 200) {
      throw new ApiError(401, 'Invalid session');
    }
    
    return {
      isAuthenticated: true,
      userId: sessionData.userId,
      isAdmin: sessionData.isAdmin
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Validates user credentials
 * @param {string} id - Email or tag
 * @param {string} password - User password
 * @returns {Promise<Object>} Validation result
 */
const validateCredentials = async (id, password) => {
  if (!id || !password) {
    throw new ApiError(400, 'ID and password are required');
  }
  
  const checkisEmail = isEmail(id);
  
  const data = checkisEmail
    ? await userService.searchByEmail(id, password)
    : await userService.searchByTag(id, password);
  
  return data;
};

const authService = {
  login,
  logout,
  checkAuth,
  validateCredentials,
  isEmail,
  generateToken,
  verifyToken
};

export default authService;
