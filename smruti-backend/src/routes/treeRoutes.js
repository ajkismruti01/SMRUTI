import { Router } from 'express';
import {
  getFamilyTree,
  addRelationship,
  removeRelationship,
} from '../controllers/treeController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireFamilyMember } from '../middleware/familyMiddleware.js';
import { requireFamilyRole } from '../middleware/roleMiddleware.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireFamilyMember);

router.get('/', getFamilyTree);
router.post('/relationships', requireFamilyRole('ADULT_MEMBER'), addRelationship);
router.delete('/relationships', requireFamilyRole('ADULT_MEMBER'), removeRelationship);

export default router;
