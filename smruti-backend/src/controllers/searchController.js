import { Memory } from '../models/Memory.js';
import { Story } from '../models/Story.js';
import { Recipe } from '../models/Recipe.js';
import { FamilyMember } from '../models/FamilyMember.js';
import { TimelineEvent } from '../models/TimelineEvent.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

export const globalSearch = async (req, res) => {
  try {
    const familyId = req.family._id;
    const { q } = req.query;

    if (!q || !q.trim()) {
      return successResponse(res, {
        memories: [],
        stories: [],
        recipes: [],
        members: [],
        timeline: [],
        total: 0,
      });
    }

    const regex = new RegExp(q.trim(), 'i');

    const [memories, stories, recipes, members, timeline] = await Promise.all([
      Memory.find({
        familyId,
        $or: [{ title: regex }, { description: regex }, { location: regex }, { category: regex }],
      }).limit(15),
      Story.find({
        familyId,
        $or: [{ title: regex }, { text: regex }, { author: regex }, { category: regex }, { tags: regex }],
      }).limit(15),
      Recipe.find({
        familyId,
        $or: [{ name: regex }, { story: regex }, { sharedBy: regex }, { ingredients: regex }, { category: regex }],
      }).limit(15),
      FamilyMember.find({
        familyId,
        $or: [{ name: regex }, { relationship: regex }, { bio: regex }, { occupation: regex }, { birthPlace: regex }],
      }).limit(15),
      TimelineEvent.find({
        familyId,
        $or: [{ title: regex }, { description: regex }, { category: regex }, { location: regex }],
      }).limit(15),
    ]);

    const total = memories.length + stories.length + recipes.length + members.length + timeline.length;

    return successResponse(res, {
      memories: memories.map((m) => ({ ...m.toObject(), id: m._id.toString() })),
      stories: stories.map((s) => ({ ...s.toObject(), id: s._id.toString() })),
      recipes: recipes.map((r) => ({ ...r.toObject(), id: r._id.toString() })),
      members: members.map((m) => ({ ...m.toObject(), id: m._id.toString() })),
      timeline: timeline.map((t) => ({ ...t.toObject(), id: t._id.toString() })),
      total,
      query: q.trim(),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
