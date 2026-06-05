import { Role } from '@prisma/client';

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  role: Role;
  profileId?: string;
}