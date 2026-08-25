import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.util';
import { ApiResponse } from '../utils/response.util';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = (err instanceof AppError) ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[Error] ${req.method} ${req.originalUrl} - Status ${statusCode}:`, err);

  res.status(statusCode).json(ApiResponse.error(message));
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode} - ${elapsed}ms`);
  });
  next();
};
