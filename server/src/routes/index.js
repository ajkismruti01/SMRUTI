import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import familyRoutes from './familyRoutes.js';
import memberRoutes from './memberRoutes.js';
import memoryRoutes from './memoryRoutes.js';
import storyRoutes from './storyRoutes.js';
import recipeRoutes from './recipeRoutes.js';
import timelineRoutes from './timelineRoutes.js';
import treeRoutes from './treeRoutes.js';
import onThisDayRoutes from './onThisDayRoutes.js';
import searchRoutes from './searchRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import mediaRoutes from './mediaRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/families', familyRoutes);
router.use('/notifications', notificationRoutes);

// Family-scoped sub-routes
router.use('/families/:familyId/members', memberRoutes);
router.use('/families/:familyId/memories', memoryRoutes);
router.use('/families/:familyId/stories', storyRoutes);
router.use('/families/:familyId/recipes', recipeRoutes);
router.use('/families/:familyId/timeline', timelineRoutes);
router.use('/families/:familyId/tree', treeRoutes);
router.use('/families/:familyId/on-this-day', onThisDayRoutes);
router.use('/families/:familyId/search', searchRoutes);
router.use('/families/:familyId/media', mediaRoutes);

export default router;
