import "dotenv/config";

export const PORT = Number(process.env.PORT || "3001");
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET || "classrpg-dev-secret-change-in-production";

export const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

export const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
};

export const AUTH_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  max: 20,
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};