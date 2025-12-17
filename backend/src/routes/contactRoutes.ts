import express from 'express';
import { body } from 'express-validator';
import {
  submitContactMessage,
  getAllContactMessages,
  markMessageAsRead,
  deleteContactMessage
} from '../controllers/contactController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Public route
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').notEmpty().withMessage('Message is required'),
    validateRequest
  ],
  submitContactMessage
);

// Protected routes (Admin only)
router.get('/', authMiddleware, getAllContactMessages);
router.patch('/:id/read', authMiddleware, markMessageAsRead);
router.delete('/:id', authMiddleware, deleteContactMessage);

export default router;
