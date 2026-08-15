import mongoose from 'mongoose';
import { Family } from '../models/Family.js';
import { FamilyMember } from '../models/FamilyMember.js';
import { errorResponse } from '../utils/responseFormatter.js';

export const requireFamilyMember = async (req, res, next) => {
  try {
    const familyId = req.params.familyId || req.body.familyId || req.query.familyId || req.user.currentFamilyId;

    if (!familyId) {
      return errorResponse(res, 'Family ID is required.', 400, [], 'FAMILY_ID_REQUIRED');
    }

    if (!mongoose.Types.ObjectId.isValid(familyId)) {
      return errorResponse(res, 'Invalid Family ID format.', 400, [], 'INVALID_FAMILY_ID');
    }

    // 1. Check if family exists
    const family = await Family.findById(familyId);
    if (!family) {
      return errorResponse(res, 'Family not found.', 404, [], 'FAMILY_NOT_FOUND');
    }

    // 2. Check if user is the direct owner
    const isOwner = family.ownerId.toString() === req.user._id.toString();

    // 3. Check if user has an explicit FamilyMember record in this family
    const membership = await FamilyMember.findOne({
      familyId: family._id,
      userId: req.user._id,
    });

    if (!isOwner && !membership) {
      return errorResponse(
        res,
        'Access denied. You are not an authorized member of this family.',
        403,
        [],
        'FORBIDDEN_CROSS_FAMILY_ACCESS'
      );
    }

    req.family = family;
    req.familyRole = isOwner ? 'OWNER' : membership?.role || 'MEMBER';
    req.familyMember = membership;

    // Update user's currentFamilyId if changed
    if (!req.user.currentFamilyId || req.user.currentFamilyId.toString() !== family._id.toString()) {
      req.user.currentFamilyId = family._id;
      await req.user.save();
    }

    next();
  } catch (error) {
    return errorResponse(res, `Family authorization error: ${error.message}`, 500);
  }
};
