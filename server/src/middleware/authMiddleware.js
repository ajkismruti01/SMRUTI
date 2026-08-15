import { errorResponse } from '../utils/responseFormatter.js';
import { User } from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  // Check Passport session
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }

  // Check fallback session/cookie or bearer token
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
