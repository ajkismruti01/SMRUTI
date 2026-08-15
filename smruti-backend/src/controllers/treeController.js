import { FamilyMember } from '../models/FamilyMember.js';
import { FamilyRelationship } from '../models/FamilyRelationship.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import mongoose from 'mongoose';

export const getFamilyTree = async (req, res) => {
  try {
    const familyId = req.family._id;

    // 1. Fetch all members of the family
    const members = await FamilyMember.find({ familyId }).sort({ generation: 1, birthYear: 1 });
    const relationships = await FamilyRelationship.find({ familyId });

    const memberMap = new Map();
    members.forEach((m) => {
      memberMap.set(m._id.toString(), {
        ...m.toObject(),
        id: m._id.toString(),
      });
    });

    // 2. Identify all couples (SPOUSE relationships)
    const spouseRels = relationships.filter((r) => r.relationshipType === 'SPOUSE');
    const parentChildRels = relationships.filter((r) => r.relationshipType === 'PARENT_CHILD');

    // Build couples list
    const couples = [];
    const processedCouples = new Set();

    spouseRels.forEach((sr, index) => {
      const p1 = sr.fromMemberId.toString();
      const p2 = sr.toMemberId.toString();
      const coupleKey = [p1, p2].sort().join('_');

      if (!processedCouples.has(coupleKey)) {
        processedCouples.add(coupleKey);

        // Find children of this couple (children who have p1 or p2 as parent)
        const children = parentChildRels
          .filter((pc) => pc.fromMemberId.toString() === p1 || pc.fromMemberId.toString() === p2)
          .map((pc) => pc.toMemberId.toString());

        // Deduplicate children
        const uniqueChildren = [...new Set(children)];

        couples.push({
          id: `c_${p1}_${p2}`,
          members: [p1, p2],
          parent: null, // will be resolved below
          children: uniqueChildren,
        });
      }
    });

    // Link parent couple for each child couple
    couples.forEach((c) => {
      const coupleMembers = c.members;
      // Check if any member of this couple is a child of another couple
      for (const parentCouple of couples) {
        if (parentCouple.id !== c.id) {
          if (coupleMembers.some((m) => parentCouple.children.includes(m))) {
            c.parent = parentCouple.id;
            break;
          }
        }
      }
    });

    // Fallback if no couples exist yet: create root couple or single branch
    if (couples.length === 0 && members.length > 0) {
      couples.push({
        id: 'c_root',
        members: [members[0]._id.toString()],
        parent: null,
        children: members.slice(1).map((m) => m._id.toString()),
      });
    }

    const generations = [
      { label: 'First Generation', subtitle: 'Our Roots · 1940s' },
      { label: 'Second Generation', subtitle: 'Growing Branches · 1970s' },
      { label: 'Third Generation', subtitle: 'New Leaves · 2000s' },
      { label: 'Fourth Generation', subtitle: 'Next Generation · 2020s' },
    ];

    return successResponse(res, {
      members: members.map((m) => ({ ...m.toObject(), id: m._id.toString() })),
      couples,
      generations,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const addRelationship = async (req, res) => {
  try {
    const familyId = req.family._id;
    const { fromMemberId, toMemberId, relationshipType } = req.body;

    if (!fromMemberId || !toMemberId || !relationshipType) {
      return errorResponse(res, 'fromMemberId, toMemberId, and relationshipType are required', 400);
    }

    if (fromMemberId === toMemberId) {
      return errorResponse(res, 'A family member cannot have a relationship with themselves', 400);
    }

    // Verify both members belong to this family
    const count = await FamilyMember.countDocuments({
      _id: { $in: [fromMemberId, toMemberId] },
      familyId,
    });

    if (count !== 2) {
      return errorResponse(res, 'Both family members must belong to this family', 400);
    }

    // Check for circular parent-child
    if (relationshipType === 'PARENT_CHILD') {
      const reverseExists = await FamilyRelationship.findOne({
        familyId,
        fromMemberId: toMemberId,
        toMemberId: fromMemberId,
        relationshipType: 'PARENT_CHILD',
      });
      if (reverseExists) {
        return errorResponse(res, 'Cannot create circular parent-child relationship', 400);
      }
    }

    // Check existing or upsert
    let rel = await FamilyRelationship.findOne({
      familyId,
      fromMemberId,
      toMemberId,
      relationshipType,
    });

    if (!rel) {
      rel = await FamilyRelationship.create({
        familyId,
        fromMemberId,
        toMemberId,
        relationshipType,
      });
    }

    return successResponse(res, rel, 'Relationship created successfully', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const removeRelationship = async (req, res) => {
  try {
    const familyId = req.family._id;
    const { fromMemberId, toMemberId, relationshipType } = req.body;

    await FamilyRelationship.deleteMany({
      familyId,
      fromMemberId,
      toMemberId,
      ...(relationshipType ? { relationshipType } : {}),
    });

    return successResponse(res, null, 'Relationship removed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
