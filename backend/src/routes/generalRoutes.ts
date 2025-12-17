import express from 'express';
import { body } from 'express-validator';
import {
  getAllHighlights,
  updateHighlight,
  getProfileContent,
  updateProfileContent,
  getDashboardStats,
  getAllJourneyHighlights,
  createJourneyHighlight,
  updateJourneyHighlight,
  deleteJourneyHighlight,
  getStats,
  updateStats
} from '../controllers/generalController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/highlights', getAllHighlights);
router.get('/profile-content', getProfileContent);
router.get('/journey-highlights', getAllJourneyHighlights);

// Protected routes (Admin only)
router.get('/dashboard/stats', authMiddleware, getDashboardStats);

router.put(
  '/highlights/:id',
  authMiddleware,
  [
    body('label').notEmpty().withMessage('Label is required'),
    body('value').notEmpty().withMessage('Value is required'),
    validateRequest
  ],
  updateHighlight
);

router.put(
  '/profile-content',
  authMiddleware,
  [
    body('section').notEmpty().withMessage('Section is required'),
    body('content').notEmpty().withMessage('Content is required'),
    validateRequest
  ],
  updateProfileContent
);

// Journey Highlights routes
router.post(
  '/journey-highlights',
  authMiddleware,
  [
    body('year').notEmpty().withMessage('Year is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    validateRequest
  ],
  createJourneyHighlight
);

router.put(
  '/journey-highlights/:id',
  authMiddleware,
  [
    body('year').notEmpty().withMessage('Year is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    validateRequest
  ],
  updateJourneyHighlight
);

router.delete('/journey-highlights/:id', authMiddleware, deleteJourneyHighlight);

// Quick Stats routes
router.get('/stats', getStats);

router.put(
  '/stats',
  authMiddleware,
  [
    body('ctfs_played').notEmpty().withMessage('CTFs Played is required'),
    body('security_projects').notEmpty().withMessage('Security Projects is required'),
    body('writeups').notEmpty().withMessage('Writeups is required'),
    body('bounties').notEmpty().withMessage('Bounties is required'),
    validateRequest
  ],
  updateStats
);

export default router;
