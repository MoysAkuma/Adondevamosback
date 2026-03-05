// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

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
  if (!req.session.userId) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'User not authenticated' 
    });
  }

  if (!req.session.isAdmin) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin access required' 
    });
  }

  next();
};

export { authenticate, authorizeAdmin };
export default authenticate;