import { Router } from 'express';
import {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  toggleFavoriteStory,
} from '../controllers/storyController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireFamilyMember } from '../middleware/familyMiddleware.js';
import { requireFamilyRole } from '../middleware/roleMiddleware.js';
import { validate, schemas } from '../validators/schemas.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireFamilyMember);

router.get('/', getStories);
router.get('/:storyId', getStoryById);
router.post('/', requireFamilyRole('MEMBER'), validate(schemas.createStory), createStory);
router.put('/:storyId', requireFamilyRole('MEMBER'), updateStory);
router.delete('/:storyId', requireFamilyRole('ADULT_MEMBER'), deleteStory);
router.post('/:storyId/favorite', toggleFavoriteStory);

export default router;
