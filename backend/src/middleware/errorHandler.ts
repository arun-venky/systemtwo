import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';
import { logger } from '../utils/logger.js';

// Custom error interface
export interface IError extends Error {
  status?: number;
  errors?: ValidationError[];
}

// Error handler middleware
export const errorHandler = (err: IError, req: Request, res: Response, next: NextFunction) => {
  // Log the error
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Set default status code
  const statusCode = err.status || 500;
  
  // Prepare response
  const response = {
    message: statusCode === 500 ? 'Internal server error' : err.message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };
  
  // Send response
  res.status(statusCode).json(response);
};

// 404 handler middleware
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};