import { Memory } from '../models/Memory.js';
import { createActivityLog } from '../services/activityService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import mongoose from 'mongoose';

export const getMemories = async (req, res) => {
  try {
    const familyId = req.family._id;
    const { category, type, year, person, search, favorite, page = 1, limit = 50 } = req.query;

    const query = { familyId };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (year) {
      query.year = Number(year);
    }

    if (person && mongoose.Types.ObjectId.isValid(person)) {
      query.people = person;
    }

    if (favorite === 'true') {
      query.favoriteBy = req.user._id;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { description: regex }, { location: regex }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Memory.countDocuments(query);
    const memories = await Memory.find(query)
      .populate('people', 'name photo relationship')
      .sort({ dateSort: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const formatted = memories.map((m) => {
      const isFav = m.favoriteBy && m.favoriteBy.some((uid) => uid.toString() === req.user._id.toString());
      return {
        ...m.toObject(),
        id: m._id.toString(),
        favorite: isFav,
      };
    });

    return successResponse(res, {
      memories: formatted,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getMemoryById = async (req, res) => {
  try {
    const { memoryId } = req.params;
    const familyId = req.family._id;

    if (!mongoose.Types.ObjectId.isValid(memoryId)) {
      return errorResponse(res, 'Invalid memory ID', 400);
    }

    const memory = await Memory.findOne({ _id: memoryId, familyId }).populate('people', 'name photo relationship bio');

    if (!memory) {
      return errorResponse(res, 'Memory not found in this family', 404);
    }

    memory.views = (memory.views || 0) + 1;
    await memory.save();

    const isFav = memory.favoriteBy && memory.favoriteBy.some((uid) => uid.toString() === req.user._id.toString());

    return successResponse(res, {
      ...memory.toObject(),
      id: memory._id.toString(),
      favorite: isFav,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const createMemory = async (req, res) => {
  try {
    const familyId = req.family._id;
    const {
      title,
      description,
      date,
      dateSort,
      year,
      location,
      type,
      category,
      image,
      gallery,
      people,
    } = req.body;

    const computedDateSort = dateSort || (year ? year * 10000 + 101 : 20240101);
    const computedYear = year || (date ? parseInt(date.slice(-4), 10) || 2024 : 2024);

    const memory = await Memory.create({
      familyId,
      createdBy: req.user._id,
      title,
      description: description || 'A new treasured memory.',
      date: date || new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      dateSort: computedDateSort,
      year: computedYear,
      location: location || 'Family Home',
      type: type || 'Photos',
      category: category || 'Family',
      image: image || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200',
      gallery: gallery && gallery.length > 0 ? gallery : [image || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200'],
      people: people || [],
      uploadedBy: req.user.name || 'Family Member',
      uploadDate: 'Just now',
      views: 0,
      favoriteBy: [],
    });

    await createActivityLog({
      userId: req.user._id,
      familyId,
      action: 'MEMORY_ADDED',
      type: 'memory',
      text: `added a new memory "${memory.title}"`,
      member: req.user.name,
      memberPhoto: req.user.profileImage,
      entityType: 'Memory',
      entityId: memory._id,
    });

    return successResponse(
      res,
      {
        ...memory.toObject(),
        id: memory._id.toString(),
        favorite: false,
      },
      'Memory added successfully',
      201
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateMemory = async (req, res) => {
  try {
    const { memoryId } = req.params;
    const familyId = req.family._id;

    const memory = await Memory.findOne({ _id: memoryId, familyId });
    if (!memory) {
      return errorResponse(res, 'Memory not found in this family', 404);
    }

    const {
      title,
      description,
      date,
      dateSort,
      year,
      location,
      type,
      category,
      image,
      gallery,
      people,
    } = req.body;

    if (title) memory.title = title;
    if (description !== undefined) memory.description = description;
    if (date) memory.date = date;
    if (dateSort !== undefined) memory.dateSort = dateSort;
    if (year !== undefined) memory.year = year;
    if (location !== undefined) memory.location = location;
    if (type) memory.type = type;
    if (category) memory.category = category;
    if (image) memory.image = image;
    if (gallery) memory.gallery = gallery;
    if (people) memory.people = people;

    await memory.save();

    const isFav = memory.favoriteBy && memory.favoriteBy.some((uid) => uid.toString() === req.user._id.toString());

    return successResponse(res, {
      ...memory.toObject(),
      id: memory._id.toString(),
      favorite: isFav,
    }, 'Memory updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const deleteMemory = async (req, res) => {
  try {
    const { memoryId } = req.params;
    const familyId = req.family._id;

    const memory = await Memory.findOneAndDelete({ _id: memoryId, familyId });
    if (!memory) {
      return errorResponse(res, 'Memory not found in this family', 404);
    }

    return successResponse(res, null, 'Memory removed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const toggleFavoriteMemory = async (req, res) => {
  try {
    const { memoryId } = req.params;
    const familyId = req.family._id;
    const userId = req.user._id;

    const memory = await Memory.findOne({ _id: memoryId, familyId });
    if (!memory) {
      return errorResponse(res, 'Memory not found', 404);
    }

    const index = memory.favoriteBy.findIndex((id) => id.toString() === userId.toString());
    let isFav = false;

    if (index > -1) {
      memory.favoriteBy.splice(index, 1);
      isFav = false;
    } else {
      memory.favoriteBy.push(userId);
      isFav = true;
    }

    await memory.save();
    return successResponse(res, { favorite: isFav }, isFav ? 'Added to favorites' : 'Removed from favorites');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
