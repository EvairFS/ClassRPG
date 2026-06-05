/**
 * Classe base para erros customizados da API
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ── Erro 400: Bad Request ──
export class BadRequestError extends AppError {
  constructor(message = "Requisição inválida") {
    super(message, 400);
  }
}

// ── Erro 404: Not Found ──
export class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado") {
    super(message, 404);
  }
}

// ── Erro 401: Unauthorized ──
export class UnauthorizedError extends AppError {
  constructor(message = "Não autorizado") {
    super(message, 401);
  }
}

// ── Erro 403: Forbidden ──
export class ForbiddenError extends AppError {
  constructor(message = "Acesso proibido") {
    super(message, 403);
  }
}

// ── Erro de Validação (Resolvendo o validate.ts) ──
export class ValidationError extends BadRequestError {
  constructor(message = "Erro de validação nos dados fornecidos") {
    super(message);
    this.name = "ValidationError";
  }
}
// ── Erro 409: Conflict ──
export class ConflictError extends AppError {
  constructor(message = "Conflito de dados") {
    super(message, 409);
  }
}