import { Router } from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireFamilyMember } from '../middleware/familyMiddleware.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireFamilyMember);

router.get('/', globalSearch);

export default router;
