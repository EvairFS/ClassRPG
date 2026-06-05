import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../database/client';
import { LoginDto, RegisterDto } from '../types'; // Assumindo que você criará os tipos

export class AuthService {
  /**
   * Registra um novo usuário e cria automaticamente o perfil baseado na Role
   */
  async register(data: RegisterDto) {
    const { email, password, name, role } = data;

    // 1. Verifica se o usuário já existe
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      throw new Error('Este e-mail já está em uso.');
    }

    // 2. Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Transação: Cria o User e o perfil (Student/Teacher) simultaneamente
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          role,
          password: hashedPassword,
        },
      });

      // Cria o perfil específico baseado na role selecionada
      if (role === 'STUDENT') {
        await tx.student.create({
          data: { userId: user.id },
        });
      } else if (role === 'TEACHER') {
        await tx.teacher.create({
          data: { userId: user.id },
        });
      } else if (role === 'ADMIN') {
        await tx.admin.create({
          data: { userId: user.id },
        });
      }

      return user;
    });
  }

  /**
   * Autentica o usuário e retorna o token JWT
   */
  async login(data: LoginDto) {
    const { email, password } = data;

    // 1. Busca o usuário com o perfil incluído
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        teacher: true,
        admin: true
      }
    });

    if (!user) {
      throw new Error('E-mail ou senha inválidos.');
    }

    // 2. Compara a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('E-mail ou senha inválidos.');
    }

    // 3. Define o segredo do JWT (deve estar no seu .env)
    const secret = process.env.JWT_SECRET || 'fallback_secret_para_dev';

    // 4. Gera o token (incluindo ID, Role e ID do Perfil se existir)
    const profileId = user.student?.id || user.teacher?.id || user.admin?.id;
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        profileId: profileId 
      },
      secret,
      { expiresIn: '1d' }
    );

    // Retorna os dados (sem a senha) e o token
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
}