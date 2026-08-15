import { Router } from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  toggleFavoriteRecipe,
} from '../controllers/recipeController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireFamilyMember } from '../middleware/familyMiddleware.js';
import { requireFamilyRole } from '../middleware/roleMiddleware.js';
import { validate, schemas } from '../validators/schemas.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireFamilyMember);

router.get('/', getRecipes);
router.get('/:recipeId', getRecipeById);
router.post('/', requireFamilyRole('MEMBER'), validate(schemas.createRecipe), createRecipe);
router.put('/:recipeId', requireFamilyRole('MEMBER'), updateRecipe);
router.delete('/:recipeId', requireFamilyRole('ADULT_MEMBER'), deleteRecipe);
router.post('/:recipeId/favorite', toggleFavoriteRecipe);

export default router;
