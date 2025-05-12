import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { logger } from '../utils/logger.js';

// Validation middleware to check for validation errors
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.all(
        validations.map(validation =>
          validation.run(req).catch(err => {
            logger.error('Validation run error', err);
            throw err; // rethrow to be caught by outer try/catch
          })
        )
      );

      const errors = validationResult(req);      
      
      if (!errors.isEmpty()) {
        logger.info(`Validation errors: ${errors.array().map(error => error.msg).join(', ')}`);
        return res.status(400).json({
          message: 'Validation error',
          errors: errors.array().map(error => ({
            field: error.type,
            message: error.msg,
          })),
        });
      }
      
      // Only call next() if validation passes
      next();
    } catch (error) {
      logger.error('Validation middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: 'Internal server error during validation' });
    }
  };
};