import { Story } from '../models/Story.js';
import { createActivityLog } from '../services/activityService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import mongoose from 'mongoose';

export const getStories = async (req, res) => {
  try {
    const familyId = req.family._id;
    const { category, search, favorite, page = 1, limit = 50 } = req.query;

    const query = { familyId };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (favorite === 'true') {
      query.favoriteBy = req.user._id;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { text: regex }, { author: regex }, { tags: regex }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Story.countDocuments(query);
    const stories = await Story.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const formatted = stories.map((s) => {
      const isFav = s.favoriteBy && s.favoriteBy.some((uid) => uid.toString() === req.user._id.toString());
      return {
        ...s.toObject(),
        id: s._id.toString(),
        favorite: isFav,
      };
    });

    return successResponse(res, {
      stories: formatted,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getStoryById = async (req, res) => {
  try {
    const { storyId } = req.params;
    const familyId = req.family._id;

    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return errorResponse(res, 'Invalid story ID', 400);
    }

    const story = await Story.findOne({ _id: storyId, familyId });
    if (!story) {
      return errorResponse(res, 'Story not found in this family', 404);
    }

    story.views = (story.views || 0) + 1;
    await story.save();

    const isFav = story.favoriteBy && story.favoriteBy.some((uid) => uid.toString() === req.user._id.toString());

    return successResponse(res, {
      ...story.toObject(),
      id: story._id.toString(),
      favorite: isFav,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const createStory = async (req, res) => {
  try {
    const familyId = req.family._id;
    const {
      title,
      text,
      author,
      authorPhoto,
      authorMemberId,
      description,
      preview,
      image,
      audio,
      audioUrl,
      audioDuration,
      duration,
      transcript,
      category,
      date,
      tags,
    } = req.body;

    const story = await Story.create({
      familyId,
      createdBy: req.user._id,
      authorMemberId: authorMemberId || null,
      author: author || req.user.name || 'Family Member',
      authorPhoto: authorPhoto || req.user.profileImage || 'https://i.pravatar.cc/300?img=33',
      title,
      description: description || '',
      preview: preview || (text ? text.slice(0, 140) + '...' : ''),
      text,
      image: image || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1000',
      audio: Boolean(audio),
      audioUrl: audioUrl || '',
      audioDuration: audioDuration || '',
      duration: duration || '5 min',
      transcript: transcript || '',
      category: category || 'Family',
      date: date || new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      tags: tags || ['family', 'story'],
      views: 0,
      favoriteBy: [],
    });

    await createActivityLog({
      userId: req.user._id,
      familyId,
      action: 'STORY_ADDED',
      type: 'story',
      text: `recorded a new story "${story.title}"`,
      member: req.user.name,
      memberPhoto: req.user.profileImage,
      entityType: 'Story',
      entityId: story._id,
    });

    return successResponse(
      res,
      {
        ...story.toObject(),
        id: story._id.toString(),
        favorite: false,
      },
      'Story created successfully',
      201
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const familyId = req.family._id;

    const story = await Story.findOne({ _id: storyId, familyId });
    if (!story) {
      return errorResponse(res, 'Story not found in this family', 404);
    }

    const {
      title,
      text,
      author,
      authorPhoto,
      preview,
      image,
      audio,
      audioUrl,
      duration,
      category,
      date,
      tags,
    } = req.body;

    if (title) story.title = title;
    if (text) story.text = text;
    if (author) story.author = author;
    if (authorPhoto) story.authorPhoto = authorPhoto;
    if (preview !== undefined) story.preview = preview;
    if (image) story.image = image;
    if (audio !== undefined) story.audio = audio;
    if (audioUrl !== undefined) story.audioUrl = audioUrl;
    if (duration !== undefined) story.duration = duration;
    if (category) story.category = category;
    if (date) story.date = date;
    if (tags) story.tags = tags;

    await story.save();

    const isFav = story.favoriteBy && story.favoriteBy.some((uid) => uid.toString() === req.user._id.toString());

    return successResponse(res, {
      ...story.toObject(),
      id: story._id.toString(),
      favorite: isFav,
    }, 'Story updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const familyId = req.family._id;

    const story = await Story.findOneAndDelete({ _id: storyId, familyId });
    if (!story) {
      return errorResponse(res, 'Story not found in this family', 404);
    }

    return successResponse(res, null, 'Story removed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const toggleFavoriteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const familyId = req.family._id;
    const userId = req.user._id;

    const story = await Story.findOne({ _id: storyId, familyId });
    if (!story) {
      return errorResponse(res, 'Story not found', 404);
    }

    const index = story.favoriteBy.findIndex((id) => id.toString() === userId.toString());
    let isFav = false;

    if (index > -1) {
      story.favoriteBy.splice(index, 1);
      isFav = false;
    } else {
      story.favoriteBy.push(userId);
      isFav = true;
    }

    await story.save();
    return successResponse(res, { favorite: isFav }, isFav ? 'Added to favorites' : 'Removed from favorites');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
