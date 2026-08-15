import { Router } from 'express';
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  linkUserToMember,
} from '../controllers/memberController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireFamilyMember } from '../middleware/familyMiddleware.js';
import { requireFamilyRole } from '../middleware/roleMiddleware.js';
import { validate, schemas } from '../validators/schemas.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireFamilyMember);

router.get('/', getMembers);
router.get('/:memberId', getMemberById);
router.post('/', requireFamilyRole('ADULT_MEMBER'), validate(schemas.createMember), createMember);
router.put('/:memberId', requireFamilyRole('ADULT_MEMBER'), updateMember);
router.delete('/:memberId', requireFamilyRole('OWNER'), deleteMember);
router.post('/:memberId/link-user', requireFamilyRole('OWNER'), linkUserToMember);

export default router;
