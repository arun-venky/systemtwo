import express from 'express';
import { body } from 'express-validator';
import { 
  signup, 
  login, 
  refreshToken, 
  logout,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  changePassword,
  updateProfile
} from '../controllers/auth.controller.js';
import { verifyToken, verifyRefreshToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { logger, logAudit } from '../utils/logger.js';

export const authRoutes = express.Router();

// Logging middleware for auth routes
authRoutes.use((req, res, next) => {
  logger.info(`Auth request: ${req.method} /api/auth${req.url}`, { body: req.body });
  next();
});

// Signup route with validation
authRoutes.post(
  '/signup',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),    
  ],
  validateRequest,
  signup
);

// Login route with validation
authRoutes.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  //validateRequest,
  login
);

// Refresh token route
authRoutes.post('/refresh', verifyRefreshToken, refreshToken);

// Logout route
authRoutes.post('/logout', logout);

// Request password reset
authRoutes.post(
  '/password/reset-request',
  [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),    
  ],
  validateRequest,
  requestPasswordReset
);

// Reset password with token
authRoutes.post(
  '/password/reset',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),    
  ],
  validateRequest,
  resetPassword
);

// Verify email with token
authRoutes.get(
  '/verify-email/:token',
  [
    body('token').notEmpty().withMessage('Verification token is required'),    
  ],
  validateRequest,
  verifyEmail
);

// Resend verification email
authRoutes.post(
  '/verify-email/resend',
  verifyToken,
  [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail()
  ],
  validateRequest,
  resendVerificationEmail
);

// Change password (authenticated)
authRoutes.post(
  '/password/change',
  verifyToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters')
  ],
  validateRequest,
  changePassword
);

// Update profile (authenticated)
authRoutes.put(
  '/profile',
  verifyToken,
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail()
  ],
  validateRequest,
  updateProfile
);