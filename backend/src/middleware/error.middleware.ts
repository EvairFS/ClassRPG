import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
      ...(isDevelopment && { stack: error.stack }),
    });
  }

  console.error('[ERROR]', error);

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(isDevelopment && { stack: error instanceof Error ? error.stack : error }),
  });
};