import express from 'express';
import { body } from 'express-validator';
import {
  getAllCTFEntries,
  getCTFEntryById,
  createCTFEntry,
  updateCTFEntry,
  deleteCTFEntry,
  deleteCtfImage
} from '../controllers/ctfController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllCTFEntries);
router.get('/:id', getCTFEntryById);

// Protected routes (Admin only)
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  [
    body('competition_name').notEmpty().withMessage('Competition name is required'),
    body('event_date').notEmpty().withMessage('Event date is required'),
    body('rank').trim().isInt({ min: 1 }).toInt().withMessage('Rank must be a positive integer'),
    body('team_name').optional({ values: 'falsy' }).trim(),
    body('challenges_solved').trim().isInt({ min: 0 }).toInt().withMessage('Challenges solved must be a non-negative integer'),
    body('total_challenges').trim().isInt({ min: 1 }).toInt().withMessage('Total challenges must be a positive integer'),
    body('points_earned').trim().isInt({ min: 0 }).toInt().withMessage('Points earned must be a non-negative integer'),
    body('writeup_url').optional({ values: 'falsy' }).trim(),
    body('description').optional({ values: 'falsy' }).trim(),
    validateRequest
  ],
  createCTFEntry
);

router.put(
  '/:id',
  authMiddleware,
  upload.single('image'),
  [
    body('competition_name').notEmpty().withMessage('Competition name is required'),
    body('event_date').notEmpty().withMessage('Event date is required'),
    body('rank').trim().isInt({ min: 1 }).toInt().withMessage('Rank must be a positive integer'),
    body('team_name').optional({ values: 'falsy' }).trim(),
    body('challenges_solved').trim().isInt({ min: 0 }).toInt().withMessage('Challenges solved must be a non-negative integer'),
    body('total_challenges').trim().isInt({ min: 1 }).toInt().withMessage('Total challenges must be a positive integer'),
    body('points_earned').trim().isInt({ min: 0 }).toInt().withMessage('Points earned must be a non-negative integer'),
    body('writeup_url').optional({ values: 'falsy' }).trim(),
    body('description').optional({ values: 'falsy' }).trim(),
    validateRequest
  ],
  updateCTFEntry
);

router.delete('/:id/image', authMiddleware, deleteCtfImage);
router.delete('/:id', authMiddleware, deleteCTFEntry);

export default router;
