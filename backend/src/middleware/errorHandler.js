import { AppError } from "../utils/errors.js";

/**
 * Centralized error handling middleware.
 * Catches all errors and returns a consistent JSON response.
 */
export function errorHandler(err, _req, res, _next) {
  // Log the error
  if (err instanceof AppError && err.isOperational) {
    console.warn(`[${err.code}] ${err.message}`);
  } else {
    console.error("Unexpected error:", err);
  }

  // Determine status code
  const status = err.status || err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message =
    err.isOperational || status < 500
      ? err.message
      : "Erro interno do servidor.";

  // In development, include stack trace
  const stack =
    process.env.NODE_ENV !== "production" && status === 500
      ? err.stack
      : undefined;

  const body = { error: message, code };
  if (stack) body.stack = stack;

  return res.status(status).json(body);
}

/**
 * 404 handler for unknown routes.
 */
export function notFoundHandler(_req, res) {
  return res.status(404).json({
    error: "Endpoint não encontrado.",
    code: "NOT_FOUND",
  });
}