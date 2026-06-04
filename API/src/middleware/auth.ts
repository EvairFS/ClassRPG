import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { UnauthorizedError } from "../utils/errors.js";
import { Request, Response, NextFunction } from "express";

// 🛡️ Estendemos o Request do Express para aceitar a propriedade customizada .user do ClassRPG
interface CustomRequest extends Request {
  user?: any;
}

/**
 * Extract bearer token from Authorization header.
 */
function extractToken(req: Request) {
  const header = req.headers.authorization;
  if (!header) return null;

  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}

/**
 * Required authentication middleware.
 * Verifies JWT and attaches decoded user to req.user.
 */
export function requireAuth(req: CustomRequest, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);

    if (!token) {
      // Fallback to x-user-id header for development compatibility
      const userId = req.headers["x-user-id"];
      if (userId && typeof userId === "string") {
        req.user = { id: userId, role: "student" };
        return next(); // 🌟 Corrigido: Agora aceita sem argumentos!
      }
      throw new UnauthorizedError("Token de autenticação não fornecido.");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next(); // 🌟 Corrigido!
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return next(err);
    }
    next(new UnauthorizedError("Token inválido ou expirado."));
  }
}

/**
 * Optional authentication middleware.
 * Attaches user if token is present, but doesn't fail if missing.
 */
export function optionalAuth(req: CustomRequest, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);

    if (!token) {
      const userId = req.headers["x-user-id"];
      if (userId && typeof userId === "string") {
        req.user = { id: userId, role: "student" };
      }
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch {
    // Token invalid but not required, continue without user
  }
  next();
}

/**
 * Role-based access control middleware.
 * Must be used after requireAuth.
 */
export function requireRole(...roles: string[]) {
  return (req: CustomRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Autenticação necessária."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new UnauthorizedError("Permissão insuficiente."));
    }

    next(); // 🌟 Corrigido!
  };
}

/**
 * Generate a JWT token for a user.
 */
export function generateToken(user: { id: any; email: any; role: any; name: any; }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}