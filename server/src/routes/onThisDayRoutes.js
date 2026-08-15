import { Router } from 'express';
import { getOnThisDay } from '../controllers/onThisDayController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireFamilyMember } from '../middleware/familyMiddleware.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireFamilyMember);

router.get('/', getOnThisDay);

export default router;
