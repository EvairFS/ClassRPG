export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean; // ← adiciona isso
  public readonly code: string;           // ← e isso

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;            // ← sempre true para erros esperados
    this.code = code || "APP_ERROR";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Requisição inválida") {
    super(message, 400, "BAD_REQUEST");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado") {
    super(message, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Não autorizado") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acesso proibido") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflito de dados") {
    super(message, 409, "CONFLICT");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Erro de validação nos dados fornecidos") {
    super(message, 400, "VALIDATION_ERROR");
  }
}
