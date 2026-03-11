import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from './apiError.js';

const getTokenFromRequest = (req) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice(7);
};

const getAuthenticatedUser = (req) => {
  let tokenPayload = req.user || null;

  if (!tokenPayload) {
    const token = getTokenFromRequest(req);

    if (token) {
      try {
        tokenPayload = jwt.verify(token, env.JWT_SECRET);
      } catch (error) {
        tokenPayload = null;
      }
    }
  }

  const userId = tokenPayload?.id ?? tokenPayload?.userId ?? tokenPayload?.userid ?? null;
  const isAdmin = !!tokenPayload?.isAdmin || tokenPayload?.role === 'admin';

  return { userId, isAdmin };
};

const requireAuthenticatedUser = (req) => {
  const user = getAuthenticatedUser(req);

  if (!user.userId) {
    throw new ApiError(401, 'User not authenticated');
  }

  return user;
};

const requireAdminUser = (req) => {
  const user = requireAuthenticatedUser(req);

  if (!user.isAdmin) {
    throw new ApiError(403, 'Admin access required');
  }

  return user;
};

export {
  getTokenFromRequest,
  getAuthenticatedUser,
  requireAuthenticatedUser,
  requireAdminUser
};
