import express from 'express';
import { body } from 'express-validator';
import {
  getAllBugBountyEntries,
  getBugBountyEntryById,
  createBugBountyEntry,
  updateBugBountyEntry,
  deleteBugBountyEntry
} from '../controllers/bugBountyController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getAllBugBountyEntries);
router.get('/:id', getBugBountyEntryById);

// Protected routes (Admin only)
router.post(
  '/',
  authMiddleware,
  [
    body('program_name').notEmpty().withMessage('Program name is required'),
    body('vulnerability_type').notEmpty().withMessage('Vulnerability type is required'),
    body('severity').notEmpty().withMessage('Severity is required'),
    body('report_date').notEmpty().withMessage('Report date is required'),
    validateRequest
  ],
  createBugBountyEntry
);

router.put(
  '/:id',
  authMiddleware,
  [
    body('program_name').notEmpty().withMessage('Program name is required'),
    body('vulnerability_type').notEmpty().withMessage('Vulnerability type is required'),
    body('severity').notEmpty().withMessage('Severity is required'),
    body('report_date').notEmpty().withMessage('Report date is required'),
    validateRequest
  ],
  updateBugBountyEntry
);

router.delete('/:id', authMiddleware, deleteBugBountyEntry);

export default router;
