import { TimelineEvent } from '../models/TimelineEvent.js';
import { createActivityLog } from '../services/activityService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import mongoose from 'mongoose';

export const getTimeline = async (req, res) => {
  try {
    const familyId = req.family._id;
    const { year, category } = req.query;

    const query = { familyId };
    if (year) query.year = Number(year);
    if (category && category !== 'All') query.category = category;

    const events = await TimelineEvent.find(query)
      .populate('relatedMemberIds', 'name photo relationship')
      .populate('relatedMemoryIds', 'title image')
      .sort({ year: 1, dateSort: 1 });

    return successResponse(
      res,
      events.map((e) => ({ ...e.toObject(), id: e._id.toString() }))
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const createTimelineEvent = async (req, res) => {
  try {
    const familyId = req.family._id;
    const { title, description, date, dateSort, year, category, image, location, relatedMemberIds, relatedMemoryIds } = req.body;

    const event = await TimelineEvent.create({
      familyId,
      createdBy: req.user._id,
      title,
      description: description || '',
      date: date || '',
      dateSort: dateSort || (year ? year * 10000 + 101 : 20240101),
      year: Number(year) || 2024,
      category: category || 'Milestone',
      image: image || '',
      location: location || '',
      relatedMemberIds: relatedMemberIds || [],
      relatedMemoryIds: relatedMemoryIds || [],
    });

    await createActivityLog({
      userId: req.user._id,
      familyId,
      action: 'TIMELINE_EVENT_ADDED',
      type: 'event',
      text: `added a milestone event "${event.title}" to the timeline`,
      member: req.user.name,
      memberPhoto: req.user.profileImage,
      entityType: 'TimelineEvent',
      entityId: event._id,
    });

    return successResponse(res, { ...event.toObject(), id: event._id.toString() }, 'Timeline event created', 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateTimelineEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const familyId = req.family._id;

    const event = await TimelineEvent.findOne({ _id: eventId, familyId });
    if (!event) {
      return errorResponse(res, 'Timeline event not found in this family', 404);
    }

    const { title, description, date, dateSort, year, category, image, location, relatedMemberIds, relatedMemoryIds } = req.body;

    if (title) event.title = title;
    if (description !== undefined) event.description = description;
    if (date) event.date = date;
    if (dateSort !== undefined) event.dateSort = dateSort;
    if (year !== undefined) event.year = Number(year);
    if (category) event.category = category;
    if (image !== undefined) event.image = image;
    if (location !== undefined) event.location = location;
    if (relatedMemberIds) event.relatedMemberIds = relatedMemberIds;
    if (relatedMemoryIds) event.relatedMemoryIds = relatedMemoryIds;

    await event.save();

    return successResponse(res, { ...event.toObject(), id: event._id.toString() }, 'Timeline event updated');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const deleteTimelineEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const familyId = req.family._id;

    const event = await TimelineEvent.findOneAndDelete({ _id: eventId, familyId });
    if (!event) {
      return errorResponse(res, 'Timeline event not found in this family', 404);
    }

    return successResponse(res, null, 'Timeline event removed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
