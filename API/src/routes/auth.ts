import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import crypto from "crypto"; 
import { AUTH_RATE_LIMIT } from "../config.js";
import { q, qOne } from "../db.js";
import { generateToken } from "../middleware/auth.js";
import { validate, loginSchema, registerSchema, forgotPasswordSchema } from "../middleware/validate.js";
import { success, created } from "../utils/response.js";
import { UnauthorizedError, ConflictError } from "../utils/errors.js";

// 🛡️ Interface estendida para suportar a propriedade 'user' injetada pelo JWT
interface CustomRequest extends Request {
  user?: any;
}

const router = Router();

// Rate limiter para os endpoints de autenticação
const authLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT.windowMs,
  max: AUTH_RATE_LIMIT.max,
  message: { error: "Muitas tentativas. Tente novamente mais tarde.", code: "RATE_LIMIT" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);

// ── POST /api/login ──
router.post("/login", validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await qOne("SELECT id, email, password, role, name FROM users WHERE email = $1", [email]);
    if (!user) {
      throw new UnauthorizedError("Credenciais inválidas.");
    }

    // Compara a senha com o hash do bcrypt
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError("Credenciais inválidas.");
    }

    const token = generateToken(user);

    success(res, {
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
      token,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/register ──
router.post("/register", validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, classroom, subject } = req.body;

    // Verifica se o e-mail já existe
    const existing = await qOne("SELECT id FROM users WHERE email = $1", [email]);
    if (existing) {
      throw new ConflictError("E-mail já cadastrado.");
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gerando um UUID real compatível com o PostgreSQL/Supabase
    const userId = crypto.randomUUID();

    await q(
      "INSERT INTO users (id, email, password, role, name) VALUES ($1,$2,$3,$4,$5)",
      [userId, email, hashedPassword, role, name]
    );

    if (role === "student") {
      // 🛠️ BUG CORRIGIDO: alterado de string[] para string, já que 'part' é uma palavra do nome
      const initials = name
        .split(" ")
        .map((part: string) => part[0]?.toUpperCase())
        .join("")
        .slice(0, 2);
        
      await q(
        "INSERT INTO students (id, name, avatar, email, classroom, xp, level, patent, streak, missions_completed, activities_completed) VALUES ($1,$2,$3,$4,$5,0,1,'Novato',0,0,0)",
        [userId, name, initials || "ST", email, classroom || "9º Ano"]
      );
    } else if (role === "teacher") {
      await q(
        "INSERT INTO teachers (id, avatar, subject, classes, students_count, status) VALUES ($1,$2,$3,$4,0,'active')",
        [
          userId, 
          name.slice(0, 2).toUpperCase() || "TE", 
          subject || "Geral", 
          classroom ? `{${classroom}}` : "{}"
        ]
      );
    }

    const token = generateToken({ id: userId, email, role, name });

    created(res, {
      user: { id: userId, name, email, role },
      token,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/forgot-password ──
router.post("/forgot-password", validate(forgotPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    await qOne("SELECT id FROM users WHERE email = $1", [email]);
    success(res, { message: "Se o endereço existir, enviamos instruções para redefinir a senha." });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/user/me ──
router.get("/user/me", async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers["x-user-id"] || req.user?.id;
    if (!userId) {
      throw new UnauthorizedError("Token não fornecido.");
    }

    const user = await qOne("SELECT id, email, role, name FROM users WHERE id = $1", [userId]);
    if (!user) {
      return success(res, null);
    }
    success(res, user);
  } catch (err) {
    next(err);
  }
});

export default router;