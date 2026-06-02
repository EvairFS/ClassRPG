/**
 * Custom error classes for consistent error handling.
 */

export class AppError extends Error {
  constructor(message, status = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.isOperational = true;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(`${resource} não encontrado(a).`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Dados inválidos.") {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autorizado.") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acesso negado.") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflito.") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}