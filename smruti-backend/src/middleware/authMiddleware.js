import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responseFormatter.js';
import { User } from '../models/User.js';
import { config } from '../config/environment.js';

export const requireAuth = async (req, res, next) => {
  // 1. Check Passport session
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }

  // 2. Check Bearer Token (Authorization header or query token)
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query?.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.sessionSecret);
      const user = await User.findById(decoded.userId || decoded.id);
      if (user && user.isActive) {
        req.user = user;
        return next();
      }
    } catch (err) {
      // invalid token, continue to check session
    }
  }

  // 3. Check fallback session
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user && user.isActive) {
        req.user = user;
        return next();
      }
    } catch (err) {
      // ignore
    }
  }

  return errorResponse(res, 'Authentication required. Please log in.', 401, [], 'AUTH_REQUIRED');
};
