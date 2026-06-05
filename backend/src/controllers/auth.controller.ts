import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  /**
   * Handler para Registro de Usuários
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = req.body;
      const user = await authService.register(userData);
      
      // Retornamos 201 Created
      return res.status(201).json({
        message: 'Usuário registrado com sucesso!',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error: any) {
      // Passa o erro para o middleware de erro
      next(error);
    }
  }

  /**
   * Handler para Login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginData = req.body;
      const result = await authService.login(loginData);

      return res.status(200).json({
        message: 'Login realizado com sucesso!',
        ...result
      });
    } catch (error: any) {
      // Se for erro de credenciais, podemos customizar a mensagem
      return res.status(401).json({ message: error.message });
    }
  }
}