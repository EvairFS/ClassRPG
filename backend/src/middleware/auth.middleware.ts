import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token não fornecido', 401);
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as {
      id: string;
      email: string;
      role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Token inválido', 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expirado', 401);
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Usuário não autenticado', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Acesso não autorizado', 403);
    }

    next();
  };
};