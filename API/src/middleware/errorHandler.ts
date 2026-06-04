import { AppError } from "../utils/errors.js";
import { Request, Response, NextFunction } from "express";
/**
 * Centralized error handling middleware.
 * Catches all errors and returns a consistent JSON response.
 */
export function errorHandler(
  err: any, 
  _req: Request, 
  res: Response, 
  _next: NextFunction
) {
  // 1. Log do erro baseado na severidade
  if (err instanceof AppError && err.isOperational) {
    console.warn(`[${err.code}] ${err.message}`);
  } else {
    console.error("Unexpected error:", err);
  }

  // 2. Determina o status code e código de erro
  const status = err.status || err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  
  const message =
    err.isOperational || status < 500
      ? err.message
      : "Erro interno do servidor.";

  // 3. Em ambiente de desenvolvimento, inclui o stack trace para facilitar o debug
  const stack =
    process.env.NODE_ENV !== "production" && status === 500
      ? err.stack
      : undefined;

  // Tipagem explícita do corpo da resposta para o TypeScript aceitar a propriedade opcional .stack
  const body: { error: string; code: string; stack?: string } = { 
    error: message, 
    code 
  };
  
  if (stack) body.stack = stack;

  return res.status(status).json(body);
}

/**
 * 404 handler for unknown routes.
 */
export function notFoundHandler(_req: Request, res: Response) {
  return res.status(404).json({
    error: "Endpoint não encontrado.",
    code: "NOT_FOUND",
  });
}