import express from 'express';
import { body } from 'express-validator';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  deleteProjectImage
} from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllProjects);
router.get('/:id', getProjectById);

// Protected routes (Admin only)
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('technologies').notEmpty().withMessage('Technologies is required'),
    validateRequest
  ],
  createProject
);

router.put(
  '/:id',
  authMiddleware,
  upload.single('image'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('technologies').notEmpty().withMessage('Technologies is required'),
    validateRequest
  ],
  updateProject
);

router.delete('/:id/image', authMiddleware, deleteProjectImage);
router.delete('/:id', authMiddleware, deleteProject);

export default router;
