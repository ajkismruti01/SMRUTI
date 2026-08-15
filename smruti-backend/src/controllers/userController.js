import { User } from '../models/User.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export const getProfile = async (req, res) => {
  return successResponse(res, req.user);
};

export const updateProfile = async (req, res) => {
  try {
    const { name, profileImage, language, dateOfBirth } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (profileImage) user.profileImage = profileImage;
    if (language) user.language = language;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;

    await user.save();
    return successResponse(res, user, 'Profile updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
