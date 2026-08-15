import { User } from '../models/User.js';
import { Family } from '../models/Family.js';
import { FamilyMember } from '../models/FamilyMember.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { config } from '../config/environment.js';

export const getMe = async (req, res) => {
  try {
    const user = req.user;

    // Find all families user is associated with
    const ownedFamilies = await Family.find({ ownerId: user._id });
    const memberships = await FamilyMember.find({ userId: user._id }).populate('familyId');

    const memberFamilyIds = memberships.map((m) => m.familyId).filter(Boolean);
    const allFamilies = [...ownedFamilies];

    for (const mf of memberFamilyIds) {
      if (!allFamilies.some((f) => f._id.toString() === mf._id.toString())) {
        allFamilies.push(mf);
      }
    }

    let activeFamily = null;
    if (user.currentFamilyId) {
      activeFamily = allFamilies.find((f) => f._id.toString() === user.currentFamilyId.toString()) || null;
    }
    if (!activeFamily && allFamilies.length > 0) {
      activeFamily = allFamilies[0];
      user.currentFamilyId = activeFamily._id;
      await user.save();
    }

    return successResponse(res, {
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        language: user.language,
        currentFamilyId: user.currentFamilyId,
      },
      activeFamily,
      families: allFamilies,
      isAuthenticated: true,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const handleGoogleCallback = (req, res) => {
  // Passport sets req.user upon successful OAuth
  const frontendBase = (config.frontendUrl || 'https://smruti-ajki.vercel.app').replace(/\/$/, '');
  const returnTo = req.session?.returnTo || `${frontendBase}/`;
  delete req.session?.returnTo;
  return res.redirect(returnTo);
};

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    if (req.session) {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        return successResponse(res, null, 'Logged out successfully');
      });
    } else {
      return successResponse(res, null, 'Logged out successfully');
    }
  });
};

export const getAuthStatus = (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return successResponse(res, { isAuthenticated: true, userId: req.user._id });
  }
  return successResponse(res, { isAuthenticated: false, userId: null });
};

// Developer simulated login helper for local dev testing
export const devLogin = async (req, res) => {
  try {
    const { email = 'rohan@example.com', name = 'Rohan Mehta' } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        googleId: 'dev_google_id_' + Date.now(),
        profileImage: 'https://i.pravatar.cc/300?img=33',
        lastLoginAt: new Date(),
      });
    }

    req.login(user, (err) => {
      if (err) return errorResponse(res, err.message, 500);
      return successResponse(res, { user, isAuthenticated: true }, 'Logged in successfully');
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
