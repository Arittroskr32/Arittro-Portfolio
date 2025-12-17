import express from 'express';
import { body } from 'express-validator';
import {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
} from '../controllers/skillController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getAllSkills);
router.get('/:id', getSkillById);

// Protected routes (Admin only)
router.post(
  '/',
  authMiddleware,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('proficiency').isInt({ min: 0, max: 100 }).withMessage('Proficiency must be between 0 and 100'),
    validateRequest
  ],
  createSkill
);

router.put(
  '/:id',
  authMiddleware,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('proficiency').isInt({ min: 0, max: 100 }).withMessage('Proficiency must be between 0 and 100'),
    validateRequest
  ],
  updateSkill
);

router.delete('/:id', authMiddleware, deleteSkill);

export default router;
