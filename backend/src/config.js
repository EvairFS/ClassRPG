import "dotenv/config";

function required(key, fallback) {
  const value = process.env[key];
  if (value === undefined || value === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const PORT = Number(required("PORT", "3001"));

export const DB = {
  host: required("PGHOST", "/run/postgresql"),
  port: Number(required("PGPORT", "5432")),
  user: required("PGUSER", "postgres"),
  password: required("PGPASSWORD", ""),
  database: required("PGDATABASE", "classrpg"),
};

export const JWT_SECRET = required("JWT_SECRET", "classrpg-dev-secret-change-in-production");
export const JWT_EXPIRES_IN = "7d";

export const CORS_ORIGIN = required("CORS_ORIGIN", "*");

export const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
};

export const AUTH_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter limit for auth endpoints
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};