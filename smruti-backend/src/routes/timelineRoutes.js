import { Router } from 'express';
import {
  getTimeline,
  createTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
} from '../controllers/timelineController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireFamilyMember } from '../middleware/familyMiddleware.js';
import { requireFamilyRole } from '../middleware/roleMiddleware.js';
import { validate, schemas } from '../validators/schemas.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireFamilyMember);

router.get('/', getTimeline);
router.post('/', requireFamilyRole('MEMBER'), validate(schemas.createTimelineEvent), createTimelineEvent);
router.put('/:eventId', requireFamilyRole('MEMBER'), updateTimelineEvent);
router.delete('/:eventId', requireFamilyRole('ADULT_MEMBER'), deleteTimelineEvent);

export default router;
