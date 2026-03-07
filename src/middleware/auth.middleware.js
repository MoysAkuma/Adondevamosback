// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { requireAdminUser } from '../utils/auth-user.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied',
      message: 'No token provided' 
    });
  }

  try {
    const verified = jwt.verify(token, env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: 'Invalid token',
      message: err.message 
    });
  }
};

/**
 * Admin authorization middleware
 * Checks if user has admin role
 */
const authorizeAdmin = (req, res, next) => {
  try {
    requireAdminUser(req);
    next();
  } catch (error) {
    if (error?.statusCode === 401) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error.message || 'User not authenticated'
      });
    }

    if (error?.statusCode === 403) {
      return res.status(403).json({
        error: 'Forbidden',
        message: error.message || 'Admin access required'
      });
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
};

export { authenticate, authorizeAdmin };
export default authenticate;