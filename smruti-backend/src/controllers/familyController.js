import { Family } from '../models/Family.js';
import { FamilyMember } from '../models/FamilyMember.js';
import { FamilyInvitation } from '../models/FamilyInvitation.js';
import { createActivityLog } from '../services/activityService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import crypto from 'crypto';

export const createFamily = async (req, res) => {
  try {
    const { name, description, familyPhoto } = req.body;
    const user = req.user;

    const family = await Family.create({
      name,
      description: description || 'Our private family space.',
      familyPhoto: familyPhoto || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
      ownerId: user._id,
    });

    // Create OWNER FamilyMember record for the creator
    const ownerMember = await FamilyMember.create({
      familyId: family._id,
      userId: user._id,
      name: user.name,
      relationship: 'Family Creator / Owner',
      photo: user.profileImage,
      role: 'OWNER',
      generation: 1,
      joinedDate: 'Just now',
    });

    user.currentFamilyId = family._id;
    await user.save();

    await createActivityLog({
      userId: user._id,
      familyId: family._id,
      action: 'FAMILY_CREATED',
      type: 'family',
      text: `created the family space "${family.name}"`,
      member: user.name,
      memberPhoto: user.profileImage,
      entityType: 'Family',
      entityId: family._id,
    });

    return successResponse(
      res,
      {
        family,
        membership: ownerMember,
      },
      'Family space created successfully',
      201
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getFamilyDetails = async (req, res) => {
  return successResponse(res, {
    family: req.family,
    role: req.familyRole,
    membership: req.familyMember,
  });
};

export const updateFamily = async (req, res) => {
  try {
    const { name, description, familyPhoto } = req.body;
    const family = req.family;

    if (name) family.name = name;
    if (description !== undefined) family.description = description;
    if (familyPhoto) family.familyPhoto = familyPhoto;

    await family.save();
    return successResponse(res, family, 'Family space updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { email, role = 'MEMBER' } = req.body;
    const family = req.family;

    if (!email) {
      return errorResponse(res, 'Email is required for invitation.', 400);
    }

    const token = crypto.randomBytes(24).toString('hex');
    const invitation = await FamilyInvitation.create({
      familyId: family._id,
      invitedEmail: email.toLowerCase().trim(),
      invitedBy: req.user._id,
      role,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return successResponse(res, invitation, 'Invitation generated successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.body;
    const user = req.user;

    const invitation = await FamilyInvitation.findOne({
      token,
      status: 'PENDING',
      expiresAt: { $gt: new Date() },
    });

    if (!invitation) {
      return errorResponse(res, 'Invalid or expired invitation token.', 400);
    }

    // Check if user email matches or accept
    invitation.status = 'ACCEPTED';
    await invitation.save();

    // Link or create FamilyMember
    let member = await FamilyMember.findOne({
      familyId: invitation.familyId,
      userId: user._id,
    });

    if (!member) {
      member = await FamilyMember.create({
        familyId: invitation.familyId,
        userId: user._id,
        name: user.name,
        relationship: 'Family Member',
        photo: user.profileImage,
        role: invitation.role || 'MEMBER',
        generation: 2,
        joinedDate: 'Just now',
      });
    }

    user.currentFamilyId = invitation.familyId;
    await user.save();

    return successResponse(res, { familyId: invitation.familyId, member }, 'Successfully joined the family');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
