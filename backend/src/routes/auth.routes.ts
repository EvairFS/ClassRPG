import { Router, Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest, authenticate } from '../middleware/auth.middleware';
import { AppError } from '../types';
import prisma from '../database/client';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

// Validation Schemas
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['STUDENT', 'TEACHER']),
  age: z.number().optional(),
  className: z.string().optional(),
  specialization: z.string().optional(),
  institution: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = RegisterSchema.parse(req.body);

    const userExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      throw new AppError('Email já cadastrado', 400);
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      },
    });

    if (data.role === 'STUDENT') {
      await prisma.student.create({
        data: {
          userId: user.id,
          age: data.age,
          className: data.className,
        },
      });
    } else if (data.role === 'TEACHER') {
      await prisma.teacher.create({
        data: {
          userId: user.id,
          specialization: data.specialization,
          institution: data.institution,
        },
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        student: true,
        teacher: true,
        admin: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 401);
    }

    const passwordMatch = await bcryptjs.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new AppError('Senha incorreta', 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          student: user.student || null,
          teacher: user.teacher || null,
          admin: user.admin || null,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get Current User
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: {
        student: {
          include: {
            currentRank: true,
          },
        },
        teacher: true,
        admin: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Refresh Token
router.post('/refresh', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const newToken = jwt.sign(
    {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
    },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  res.json({
    status: 'success',
    data: { token: newToken },
  });
});

export default router;