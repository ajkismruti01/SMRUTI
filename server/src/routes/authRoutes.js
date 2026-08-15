import { Router } from 'express';
import passport from 'passport';
import { getMe, handleGoogleCallback, logout, getAuthStatus, devLogin } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';
import { config } from '../config/environment.js';

const router = Router();

// Initiate Google OAuth
router.get('/google', authLimiter, (req, res, next) => {
  if (req.query.returnTo) {
    req.session.returnTo = req.query.returnTo;
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })(req, res, next);
});

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${config.frontendUrl}/login?error=auth_failed`,
  }),
  handleGoogleCallback
);

// Current logged in user info
router.get('/me', requireAuth, getMe);

// Logout
router.post('/logout', logout);

// Auth status check
router.get('/status', getAuthStatus);

// Local developer login for offline testing
router.post('/dev-login', devLogin);

export default router;
