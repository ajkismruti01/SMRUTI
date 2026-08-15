import { Router } from 'express';
import { uploadMedia } from '../controllers/mediaController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireFamilyMember } from '../middleware/familyMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireFamilyMember);

router.post('/upload', uploadLimiter, upload.single('file'), uploadMedia);

export default router;
