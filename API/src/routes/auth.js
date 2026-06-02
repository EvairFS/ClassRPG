import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { AUTH_RATE_LIMIT } from "../config.js";
import { q, qOne } from "../db.js";
import { generateToken } from "../middleware/auth.js";
import { validate, loginSchema, registerSchema, forgotPasswordSchema } from "../middleware/validate.js";
import { success, created } from "../utils/response.js";
import { UnauthorizedError, ConflictError } from "../utils/errors.js";

const router = Router();

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: AUTH_RATE_LIMIT.windowMs,
  max: AUTH_RATE_LIMIT.max,
  message: { error: "Muitas tentativas. Tente novamente mais tarde.", code: "RATE_LIMIT" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);

// ── POST /api/login ──
router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await qOne("SELECT id, email, password, role, name FROM users WHERE email = $1", [email]);
    if (!user) {
      throw new UnauthorizedError("Credenciais inválidas.");
    }

    // Compare password with bcrypt
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
router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, role, classroom, subject } = req.body;

    // Check if email already exists
    const existing = await qOne("SELECT id FROM users WHERE email = $1", [email]);
    if (existing) {
      throw new ConflictError("E-mail já cadastrado.");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = `${role === "teacher" ? "t" : "s"}${Date.now()}`;

    await q(
      "INSERT INTO users (id, email, password, role, name) VALUES ($1,$2,$3,$4,$5)",
      [userId, email, hashedPassword, role, name]
    );

    if (role === "student") {
      const initials = name
        .split(" ")
        .map((part) => part[0]?.toUpperCase())
        .join("")
        .slice(0, 2);
      await q(
        "INSERT INTO students (id, name, avatar, email, classroom, xp, level, patent, streak, missions_completed, activities_completed) VALUES ($1,$2,$3,$4,$5,0,1,'Novato',0,0,0)",
        [userId, name, initials || "ST", email, classroom || "9º Ano"]
      );
    } else if (role === "teacher") {
      await q(
        "INSERT INTO teachers (id, name, avatar, email, subject, classes, students_count, status) VALUES ($1,$2,$3,$4,$5,$6,0,'active')",
        [userId, name, name.slice(0, 2).toUpperCase() || "TE", email, subject || "Geral", classroom ? `{${classroom}}` : "{}"]
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
router.post("/forgot-password", validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    // Always return the same message regardless of whether the email exists (security)
    await qOne("SELECT id FROM users WHERE email = $1", [email]);
    success(res, { message: "Se o endereço existir, enviamos instruções para redefinir a senha." });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/user/me ──
router.get("/user/me", async (req, res, next) => {
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