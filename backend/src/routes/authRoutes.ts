import express from 'express';
import { body } from 'express-validator';
import { login, changePassword, getProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  login
);

router.post(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validateRequest
  ],
  changePassword
);

router.get('/profile', authMiddleware, getProfile);

export default router;
