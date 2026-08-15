import { Recipe } from '../models/Recipe.js';
import { createActivityLog } from '../services/activityService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import mongoose from 'mongoose';

export const getRecipes = async (req, res) => {
  try {
    const familyId = req.family._id;
    const { category, difficulty, search, favorite, page = 1, limit = 50 } = req.query;

    const query = { familyId };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (favorite === 'true') {
      query.favoriteBy = req.user._id;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { story: regex }, { sharedBy: regex }, { ingredients: regex }];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Recipe.countDocuments(query);
    const recipes = await Recipe.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const formatted = recipes.map((r) => {
      const isFav = r.favoriteBy && r.favoriteBy.some((uid) => uid.toString() === req.user._id.toString());
      return {
        ...r.toObject(),
        id: r._id.toString(),
        favorite: isFav,
      };
    });

    return successResponse(res, {
      recipes: formatted,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const familyId = req.family._id;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return errorResponse(res, 'Invalid recipe ID', 400);
    }

    const recipe = await Recipe.findOne({ _id: recipeId, familyId });
    if (!recipe) {
      return errorResponse(res, 'Recipe not found in this family', 404);
    }

    recipe.views = (recipe.views || 0) + 1;
    await recipe.save();

    const isFav = recipe.favoriteBy && recipe.favoriteBy.some((uid) => uid.toString() === req.user._id.toString());

    return successResponse(res, {
      ...recipe.toObject(),
      id: recipe._id.toString(),
      favorite: isFav,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const createRecipe = async (req, res) => {
  try {
    const familyId = req.family._id;
    const {
      name,
      sharedBy,
      sharedByPhoto,
      sharedByMemberId,
      story,
      image,
      ingredients,
      steps,
      category,
      time,
      servings,
      difficulty,
      voiceRecipeUrl,
      voiceDuration,
      tags,
    } = req.body;

    const recipe = await Recipe.create({
      familyId,
      createdBy: req.user._id,
      sharedByMemberId: sharedByMemberId || null,
      sharedBy: sharedBy || req.user.name || 'Family Member',
      sharedByPhoto: sharedByPhoto || req.user.profileImage || 'https://i.pravatar.cc/300?img=47',
      name,
      story: story || '',
      image: image || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000',
      ingredients: ingredients && ingredients.length > 0 ? ingredients : ['Traditional ingredients'],
      steps: steps && steps.length > 0 ? steps : ['Cook with love and family care.'],
      category: category || 'Family Favorite',
      time: Number(time) || 30,
      servings: servings || '4–5',
      difficulty: difficulty || 'Easy',
      voiceRecipeUrl: voiceRecipeUrl || '',
      voiceDuration: voiceDuration || '',
      tags: tags || ['traditional', 'family'],
      views: 0,
      favoriteBy: [],
    });

    await createActivityLog({
      userId: req.user._id,
      familyId,
      action: 'RECIPE_ADDED',
      type: 'recipe',
      text: `shared a new recipe "${recipe.name}"`,
      member: req.user.name,
      memberPhoto: req.user.profileImage,
      entityType: 'Recipe',
      entityId: recipe._id,
    });

    return successResponse(
      res,
      {
        ...recipe.toObject(),
        id: recipe._id.toString(),
        favorite: false,
      },
      'Recipe saved successfully',
      201
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const familyId = req.family._id;

    const recipe = await Recipe.findOne({ _id: recipeId, familyId });
    if (!recipe) {
      return errorResponse(res, 'Recipe not found in this family', 404);
    }

    const {
      name,
      sharedBy,
      sharedByPhoto,
      story,
      image,
      ingredients,
      steps,
      category,
      time,
      servings,
      difficulty,
      tags,
    } = req.body;

    if (name) recipe.name = name;
    if (sharedBy) recipe.sharedBy = sharedBy;
    if (sharedByPhoto) recipe.sharedByPhoto = sharedByPhoto;
    if (story !== undefined) recipe.story = story;
    if (image) recipe.image = image;
    if (ingredients) recipe.ingredients = ingredients;
    if (steps) recipe.steps = steps;
    if (category) recipe.category = category;
    if (time !== undefined) recipe.time = Number(time);
    if (servings !== undefined) recipe.servings = servings;
    if (difficulty) recipe.difficulty = difficulty;
    if (tags) recipe.tags = tags;

    await recipe.save();

    const isFav = recipe.favoriteBy && recipe.favoriteBy.some((uid) => uid.toString() === req.user._id.toString());

    return successResponse(res, {
      ...recipe.toObject(),
      id: recipe._id.toString(),
      favorite: isFav,
    }, 'Recipe updated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const familyId = req.family._id;

    const recipe = await Recipe.findOneAndDelete({ _id: recipeId, familyId });
    if (!recipe) {
      return errorResponse(res, 'Recipe not found in this family', 404);
    }

    return successResponse(res, null, 'Recipe removed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const toggleFavoriteRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const familyId = req.family._id;
    const userId = req.user._id;

    const recipe = await Recipe.findOne({ _id: recipeId, familyId });
    if (!recipe) {
      return errorResponse(res, 'Recipe not found', 404);
    }

    const index = recipe.favoriteBy.findIndex((id) => id.toString() === userId.toString());
    let isFav = false;

    if (index > -1) {
      recipe.favoriteBy.splice(index, 1);
      isFav = false;
    } else {
      recipe.favoriteBy.push(userId);
      isFav = true;
    }

    await recipe.save();
    return successResponse(res, { favorite: isFav }, isFav ? 'Added to favorites' : 'Removed from favorites');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
