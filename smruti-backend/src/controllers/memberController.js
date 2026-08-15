import { FamilyMember } from '../models/FamilyMember.js';
import { FamilyRelationship } from '../models/FamilyRelationship.js';
import { Memory } from '../models/Memory.js';
import { Story } from '../models/Story.js';
import { Recipe } from '../models/Recipe.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { createActivityLog } from '../services/activityService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import mongoose from 'mongoose';

export const getMembers = async (req, res) => {
  try {
    const familyId = req.family._id;
    const members = await FamilyMember.find({ familyId }).sort({ generation: 1, birthYear: 1 });

    // Fetch counts and relationships for each member
    const relationships = await FamilyRelationship.find({ familyId });

    const enrichedMembers = await Promise.all(
      members.map(async (m) => {
        const memCount = await Memory.countDocuments({ familyId, people: m._id });
        const storyCount = await Story.countDocuments({
          familyId,
          $or: [{ authorMemberId: m._id }, { relatedMemberIds: m._id }],
        });
        const recipeCount = await Recipe.countDocuments({ familyId, sharedByMemberId: m._id });
        const eventCount = await TimelineEvent.countDocuments({ familyId, relatedMemberIds: m._id });

        // Find spouse
        const spouseRel = relationships.find(
          (r) =>
            r.relationshipType === 'SPOUSE' &&
            (r.fromMemberId.toString() === m._id.toString() || r.toMemberId.toString() === m._id.toString())
        );
        const spouseOf = spouseRel
          ? spouseRel.fromMemberId.toString() === m._id.toString()
            ? spouseRel.toMemberId.toString()
            : spouseRel.fromMemberId.toString()
          : null;

        // Find parents (where toMemberId === m._id)
        const parents = relationships
          .filter((r) => r.relationshipType === 'PARENT_CHILD' && r.toMemberId.toString() === m._id.toString())
          .map((r) => r.fromMemberId.toString());

        // Find children (where fromMemberId === m._id)
        const children = relationships
          .filter((r) => r.relationshipType === 'PARENT_CHILD' && r.fromMemberId.toString() === m._id.toString())
          .map((r) => r.toMemberId.toString());

        return {
          ...m.toObject(),
          id: m._id.toString(),
          spouseOf,
          parents,
          children,
          memories: memCount,
          stories: storyCount,
          recipes: recipeCount,
          timelineEvents: eventCount,
        };
      })
    );

    return successResponse(res, enrichedMembers);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getMemberById = async (req, res) => {
  try {
    const { memberId } = req.params;
    const familyId = req.family._id;

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return errorResponse(res, 'Invalid member ID format', 400);
    }

    const member = await FamilyMember.findOne({ _id: memberId, familyId });
    if (!member) {
      return errorResponse(res, 'Family member not found in this family', 404);
    }

    const relationships = await FamilyRelationship.find({ familyId });
    const spouseRel = relationships.find(
      (r) =>
        r.relationshipType === 'SPOUSE' &&
        (r.fromMemberId.toString() === member._id.toString() || r.toMemberId.toString() === member._id.toString())
    );
    const spouseOf = spouseRel
      ? spouseRel.fromMemberId.toString() === member._id.toString()
        ? spouseRel.toMemberId.toString()
        : spouseRel.fromMemberId.toString()
      : null;

    const parents = relationships
      .filter((r) => r.relationshipType === 'PARENT_CHILD' && r.toMemberId.toString() === member._id.toString())
      .map((r) => r.fromMemberId.toString());

    const children = relationships
      .filter((r) => r.relationshipType === 'PARENT_CHILD' && r.fromMemberId.toString() === member._id.toString())
      .map((r) => r.toMemberId.toString());

    const memCount = await Memory.countDocuments({ familyId, people: member._id });
    const storyCount = await Story.countDocuments({
      familyId,
      $or: [{ authorMemberId: member._id }, { relatedMemberIds: member._id }],
    });
    const recipeCount = await Recipe.countDocuments({ familyId, sharedByMemberId: member._id });
    const eventCount = await TimelineEvent.countDocuments({ familyId, relatedMemberIds: member._id });

    return successResponse(res, {
      ...member.toObject(),
      id: member._id.toString(),
      spouseOf,
      parents,
      children,
      memories: memCount,
      stories: storyCount,
      recipes: recipeCount,
      timelineEvents: eventCount,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const createMember = async (req, res) => {
  try {
    const familyId = req.family._id;
    const { name, relationship, photo, bio, birthYear, birthPlace, occupation, generation, role, userId } = req.body;

    const member = await FamilyMember.create({
      familyId,
      userId: userId || null,
      name,
      relationship,
      photo: photo || 'https://i.pravatar.cc/300?img=12',
      bio: bio || '',
      birthYear: birthYear || 2000,
      birthPlace: birthPlace || '',
      occupation: occupation || '',
      generation: generation !== undefined ? generation : 2,
      role: role || 'MEMBER',
      joinedDate: 'Just now',
    });

    await createActivityLog({
      userId: req.user._id,
      familyId,
      action: 'MEMBER_ADDED',
      type: 'member',
      text: `added a new family member "${member.name}"`,
      member: req.user.name,
      memberPhoto: req.user.profileImage,
      entityType: 'FamilyMember',
      entityId: member._id,
    });

    return successResponse(res, { ...member.toObject(), id: member._id.toString() }, 'Family member added', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const familyId = req.family._id;

    const member = await FamilyMember.findOne({ _id: memberId, familyId });
    if (!member) {
      return errorResponse(res, 'Family member not found in this family', 404);
    }

    const { name, relationship, photo, bio, birthYear, birthPlace, occupation, generation, role, userId } = req.body;

    if (name) member.name = name;
    if (relationship) member.relationship = relationship;
    if (photo) member.photo = photo;
    if (bio !== undefined) member.bio = bio;
    if (birthYear !== undefined) member.birthYear = birthYear;
    if (birthPlace !== undefined) member.birthPlace = birthPlace;
    if (occupation !== undefined) member.occupation = occupation;
    if (generation !== undefined) member.generation = generation;
    if (role) member.role = role;
    if (userId !== undefined) member.userId = userId;

    await member.save();

    return successResponse(res, { ...member.toObject(), id: member._id.toString() }, 'Family member updated');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const familyId = req.family._id;

    const member = await FamilyMember.findOneAndDelete({ _id: memberId, familyId });
    if (!member) {
      return errorResponse(res, 'Family member not found in this family', 404);
    }

    // Clean up relationships
    await FamilyRelationship.deleteMany({
      familyId,
      $or: [{ fromMemberId: memberId }, { toMemberId: memberId }],
    });

    return successResponse(res, null, 'Family member removed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// Link registered user to member
export const linkUserToMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { targetUserId } = req.body;
    const familyId = req.family._id;

    const member = await FamilyMember.findOne({ _id: memberId, familyId });
    if (!member) {
      return errorResponse(res, 'Member not found', 404);
    }

    member.userId = targetUserId || req.user._id;
    await member.save();

    return successResponse(res, member, 'User linked to family member record successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
