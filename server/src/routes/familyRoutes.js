import { Router } from 'express';
import {
  createFamily,
  getFamilyDetails,
  updateFamily,
  inviteMember,
  acceptInvitation,
} from '../controllers/familyController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireFamilyMember } from '../middleware/familyMiddleware.js';
import { requireFamilyRole } from '../middleware/roleMiddleware.js';
import { validate, schemas } from '../validators/schemas.js';

const router = Router();

router.use(requireAuth);

router.post('/', validate(schemas.createFamily), createFamily);
router.post('/accept-invitation', acceptInvitation);

router.get('/:familyId', requireFamilyMember, getFamilyDetails);
router.put('/:familyId', requireFamilyMember, requireFamilyRole('OWNER'), updateFamily);
router.post('/:familyId/invite', requireFamilyMember, requireFamilyRole('ADULT_MEMBER'), inviteMember);

export default router;
