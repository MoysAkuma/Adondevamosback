// middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
const authenticate = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Access denied',
      message: 'No authorization header provided' 
    });
  }

  // Handle both "Bearer token" and "bearer token" formats
  const token = authHeader.replace(/^bearer\s+/i, '');
  
  if (!token || token === authHeader) {
    return res.status(401).json({ 
      error: 'Access denied',
      message: 'Invalid authorization format. Use: Bearer <token>' 
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
 * Checks if user has admin role by verifying JWT token
 */
const authorizeAdmin = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'No authorization header provided' 
    });
  }

  // Handle both "Bearer token" and "bearer token" formats
  const token = authHeader.replace(/^bearer\s+/i, '');
  
  if (!token || token === authHeader) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid authorization format. Use: Bearer <token>' 
    });
  }

  try {
    const verified = jwt.verify(token, env.JWT_SECRET);
    req.user = verified;
    
    if (!verified.isAdmin) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Admin access required' 
      });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: 'Invalid token',
      message: err.message 
    });
  }
};

export { authenticate, authorizeAdmin };
export default authenticate;