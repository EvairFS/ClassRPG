import "dotenv/config";

function env(key, fallback) {
  const value = process.env[key];
  return value === undefined || value === "" ? fallback : value;
}

function required(key, fallback) {
  const value = process.env[key];
  if (value === undefined || value === "") {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const PORT = Number(env("PORT", "3001"));

// Prefer explicit Supabase Session Pooler URL when provided.
export const DATABASE_URL = env(
  "SUPABASE_POOLER_URL",
  env("DATABASE_URL", env("SUPABASE_DB_URL", undefined)),
);

export const DB = DATABASE_URL
  ? null
  : {
      host: required("PGHOST", "/run/postgresql"),
      port: Number(required("PGPORT", "5432")),
      user: required("PGUSER", "postgres"),
      password: required("PGPASSWORD", ""),
      database: required("PGDATABASE", "classrpg"),
    };

const sslMode = env("PGSSLMODE", env("DB_SSL", process.env.NODE_ENV === "production" ? "require" : "disable"));
export const DB_SSL = sslMode;
export const USE_DB_SSL = sslMode !== "disable" && sslMode !== "false";

export const JWT_SECRET = required("JWT_SECRET", "classrpg-dev-secret-change-in-production");
export const JWT_EXPIRES_IN = "7d";

export const CORS_ORIGIN = env("CORS_ORIGIN", "*");

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