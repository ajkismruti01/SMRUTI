import { z } from 'zod';
import { errorResponse } from '../utils/responseFormatter.js';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorDetails = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
        return errorResponse(res, 'Validation failed for request data.', 400, errorDetails, 'VALIDATION_ERROR');
      }
      next(error);
    }
  };
};

export const schemas = {
  createFamily: z.object({
    body: z.object({
      name: z.string().min(2, 'Family name must be at least 2 characters'),
      description: z.string().optional(),
      familyPhoto: z.string().optional(),
    }),
  }),
  createMember: z.object({
    body: z.object({
      name: z.string().min(1, 'Member name is required'),
      relationship: z.string().min(1, 'Relationship is required'),
      photo: z.string().optional(),
      bio: z.string().optional(),
      birthYear: z.number().optional(),
      birthPlace: z.string().optional(),
      occupation: z.string().optional(),
      generation: z.number().optional(),
      role: z.enum(['OWNER', 'ADULT_MEMBER', 'MEMBER', 'VIEWER']).optional(),
      userId: z.string().nullable().optional(),
    }),
  }),
  createMemory: z.object({
    body: z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
      date: z.string().optional(),
      dateSort: z.number().optional(),
      year: z.number().optional(),
      location: z.string().optional(),
      type: z.enum(['Photos', 'Videos', 'Audio', 'Documents']).optional(),
      category: z.string().optional(),
      image: z.string().optional(),
      gallery: z.array(z.string()).optional(),
      people: z.array(z.string()).optional(),
    }),
  }),
  createStory: z.object({
    body: z.object({
      title: z.string().min(1, 'Title is required'),
      text: z.string().min(1, 'Story text is required'),
      author: z.string().optional(),
      authorPhoto: z.string().optional(),
      authorMemberId: z.string().optional(),
      description: z.string().optional(),
      preview: z.string().optional(),
      image: z.string().optional(),
      audio: z.boolean().optional(),
      audioUrl: z.string().optional(),
      audioDuration: z.string().optional(),
      duration: z.string().optional(),
      transcript: z.string().optional(),
      category: z.string().optional(),
      date: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
  }),
  createRecipe: z.object({
    body: z.object({
      name: z.string().min(1, 'Recipe name is required'),
      sharedBy: z.string().optional(),
      sharedByPhoto: z.string().optional(),
      sharedByMemberId: z.string().optional(),
      story: z.string().optional(),
      image: z.string().optional(),
      ingredients: z.array(z.string()).optional(),
      steps: z.array(z.string()).optional(),
      category: z.string().optional(),
      time: z.number().optional(),
      servings: z.string().optional(),
      difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
      voiceRecipeUrl: z.string().optional(),
      voiceDuration: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
  }),
  createTimelineEvent: z.object({
    body: z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
      date: z.string().optional(),
      year: z.number({ required_error: 'Year is required' }),
      category: z.string().optional(),
      image: z.string().optional(),
      location: z.string().optional(),
      relatedMemberIds: z.array(z.string()).optional(),
    }),
  }),
};
