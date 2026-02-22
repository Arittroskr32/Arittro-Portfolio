import express from 'express';
import { body } from 'express-validator';
import {
  getAllCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  deleteCertificateImage,
} from '../controllers/certificateController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllCertificates);
router.get('/:id', getCertificateById);

// Protected routes (Admin only)
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  [
    body('rank').optional().isInt({ min: 0 }).withMessage('Rank must be a non-negative integer'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('issuing_organization').notEmpty().withMessage('Issuing Organization is required'),
    body('issue_date').notEmpty().withMessage('Issue Date is required'),
    body('verification_link').optional().isURL().withMessage('Verification Link must be a valid URL'),
    validateRequest,
  ],
  createCertificate
);

router.put(
  '/:id',
  authMiddleware,
  upload.single('image'),
  [
    body('rank').optional().isInt({ min: 0 }).withMessage('Rank must be a non-negative integer'),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('issuing_organization').notEmpty().withMessage('Issuing Organization is required'),
    body('issue_date').notEmpty().withMessage('Issue Date is required'),
    body('verification_link').optional().isURL().withMessage('Verification Link must be a valid URL'),
    validateRequest,
  ],
  updateCertificate
);

router.delete('/:id/image', authMiddleware, deleteCertificateImage);
router.delete('/:id', authMiddleware, deleteCertificate);

export default router;
