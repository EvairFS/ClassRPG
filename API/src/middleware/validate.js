import { z } from "zod";
import { ValidationError } from "../utils/errors.js";

/**
 * Middleware factory that validates request body against a Zod schema.
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Which part of the request to validate
 */
export function validate(schema, source = "body") {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      // Replace with parsed (coerced/transformed) values
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const messages = err.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`
        );
        return next(new ValidationError(messages.join("; ")));
      }
      next(err);
    }
  };
}

// ── Common validation schemas ──

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(1, "Senha é obrigatória."),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
  role: z.enum(["student", "teacher"], {
    errorMap: () => ({ message: "Papel deve ser student ou teacher." }),
  }),
  classroom: z.string().optional(),
  subject: z.string().optional(),
});

export const createActivitySchema = z.object({
  title: z.string().min(1, "Título é obrigatório."),
  description: z.string().optional().default(""),
  subject: z.string().optional().default("Geral"),
  difficulty: z
    .enum(["Easy", "Medium", "Hard", "Epic"])
    .optional()
    .default("Easy"),
  xpReward: z.number().int().positive().optional().default(50),
  deadline: z.string().optional().default("2026-12-31"),
  instructions: z.string().optional().default(""),
  teacher: z.string().optional().default("Professor"),
});

export const submitActivitySchema = z.object({
  submission: z.string().optional(),
  studentId: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido."),
});