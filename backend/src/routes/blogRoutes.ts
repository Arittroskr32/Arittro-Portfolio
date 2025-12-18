import express from 'express';
import { body } from 'express-validator';
import path from 'path';
import { upload } from '../middleware/upload.js';
import {
  getAllBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} from '../controllers/blogController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Use shared upload middleware (handles storage, limits, file filtering)

// Public routes
router.get('/', getAllBlogPosts);
router.get('/:id', getBlogPostById);

// Protected routes (Admin only)
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    validateRequest
  ],
  createBlogPost
);

router.put(
  '/:id',
  authMiddleware,
  upload.single('image'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    validateRequest
  ],
  updateBlogPost
);

router.delete('/:id', authMiddleware, deleteBlogPost);

export default router;
