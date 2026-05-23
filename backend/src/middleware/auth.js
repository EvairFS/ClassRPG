import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { UnauthorizedError } from "../utils/errors.js";

/**
 * Extract bearer token from Authorization header.
 */
function extractToken(req) {
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
export function requireAuth(req, _res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      // Fallback to x-user-id header for development compatibility
      const userId = req.headers["x-user-id"];
      if (userId) {
        req.user = { id: userId, role: "student" };
        return next();
      }
      throw new UnauthorizedError("Token de autenticação não fornecido.");
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
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
export function optionalAuth(req, _res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      const userId = req.headers["x-user-id"];
      if (userId) {
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
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Autenticação necessária."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new UnauthorizedError("Permissão insuficiente."));
    }

    next();
  };
}

/**
 * Generate a JWT token for a user.
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}