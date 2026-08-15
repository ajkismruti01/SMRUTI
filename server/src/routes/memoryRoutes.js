import { Router } from 'express';
import {
  getMemories,
  getMemoryById,
  createMemory,
  updateMemory,
  deleteMemory,
  toggleFavoriteMemory,
} from '../controllers/memoryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireFamilyMember } from '../middleware/familyMiddleware.js';
import { requireFamilyRole } from '../middleware/roleMiddleware.js';
import { validate, schemas } from '../validators/schemas.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireFamilyMember);

router.get('/', getMemories);
router.get('/:memoryId', getMemoryById);
router.post('/', requireFamilyRole('MEMBER'), validate(schemas.createMemory), createMemory);
router.put('/:memoryId', requireFamilyRole('MEMBER'), updateMemory);
router.delete('/:memoryId', requireFamilyRole('ADULT_MEMBER'), deleteMemory);
router.post('/:memoryId/favorite', toggleFavoriteMemory);

export default router;
