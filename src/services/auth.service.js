/**
 * Authentication Service
 * Handles all authentication-related business logic
 */

import jwt from 'jsonwebtoken';
import usersRepository from '../repositories/users.repository.js';
import sessionService from './session.service.js';
import { userClient } from '../config/supabase.js';
import exceptions from '../middleware/exceptions.middleware.js';
import { env } from '../config/env.js';
import { comparePassword } from '../utils/password.js';

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
    throw exceptions.internal('Error generating token');
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
    throw exceptions.unauthorized('Invalid or expired token');
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
    // Initialize repository
    const userRepo = new usersRepository({ userClient });
    
    // Check if id is email or tag
    const checkisEmail = isEmail(id);
    
    // Search user with password verification and get profile photo
    const user = checkisEmail
      ? await userRepo.searchByEmail(id, "id, name, tag, lastname, password, profile_photo_tn")
      : await userRepo.searchByTag(id, "id, name, tag, lastname, password, profile_photo_tn");

    if (!user || user.id == null) {
      throw exceptions.notFound('User not found');
    }
    
    // Verify password using bcrypt
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw exceptions.unauthorized('Invalid credentials');
    }
    
    // Check if user is admin
    const adminRows = await userRepo.checkAdminRole(user.id);
    const isAdmin = adminRows.length > 0;
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      tag: user.tag,
      isAdmin: !!isAdmin,
      role: isAdmin ? 'admin' : 'user'
    });
    
    // Create session (optional - you can remove this if you want JWT-only auth)
    await sessionService.createSession(req, {
      id: user.id,
      isAdmin: !!isAdmin
    });
    
    return {
      user: {
        id: user.id,
        tag: user.tag,
        role: isAdmin ? 'admin' : 'user',
        name: user.name,
        lastname: user.lastname,
        thumbnail: user.profile_photo_tn || null
      },
      token
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
    throw exceptions.internal('Error logging out');
  }
};

/**
 * Checks if a user is authenticated
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Authentication status and user info
 */
const checkAuth = async (req) => {
  try {
    const userRepo = new usersRepository({ userClient: userClient });
    const sessionData = sessionService.validateSession(req);

    const authenticatedUserId = sessionData.isValid
      ? sessionData.userId
      : (req.user?.id ?? req.user?.userId ?? req.user?.userid ?? null);

    if (!authenticatedUserId) {
      throw exceptions.unauthorized('User not authenticated');
    }

    // Verify user still exists in database
    const userRows = await userRepo.getUserById(authenticatedUserId);
    if (!userRows || userRows.length === 0) {
      throw exceptions.unauthorized('Invalid session');
    }

    const userRecord = userRows[0];
    const adminRows = await userRepo.checkAdminRole(authenticatedUserId);
    const isAdmin = adminRows.length > 0;
    
    return {
      isAuthenticated: true,
      userId: authenticatedUserId,
      id: authenticatedUserId,
      tag: userRecord?.tag || req.user?.tag || '',
      role: isAdmin ? 'admin' : 'user',
      isAdmin
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
    throw exceptions.badRequest('ID and password are required');
  }
  
  const userRepo = new usersRepository({ userClient: userClient });
  const checkisEmail = isEmail(id);
  
  const user = checkisEmail
    ? await userRepo.searchByEmail(id, "id, name, tag, lastname, password")
    : await userRepo.searchByTag(id, "id, name, tag, lastname, password");

  if (!user) {
    throw exceptions.notFound('User not found');
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw exceptions.unauthorized('Invalid credentials');
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
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
