import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../core/utils/response.util';

export class AuthController {
  public login = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const data = authService.login(email, password);
      res.json(ApiResponse.success(data, 'Login successful'));
    } catch (err) {
      next(err);
    }
  };

  public biometricLogin = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, userId } = req.body;
      const data = authService.biometricLogin(email, userId);
      res.json(ApiResponse.success(data, 'Touch ID authentication successful'));
    } catch (err) {
      next(err);
    }
  };

  public register = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = authService.register(req.body);
      res.status(201).json(ApiResponse.success(data, 'Account registered successfully'));
    } catch (err) {
      next(err);
    }
  };

  public getMe = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = authService.getCurrentUser();
      res.json(ApiResponse.success(data));
    } catch (err) {
      next(err);
    }
  };

  public updateProfile = (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id || req.body.id;
      const data = authService.updateProfile(userId, req.body);
      res.json(ApiResponse.success(data, 'Profile updated successfully'));
    } catch (err) {
      next(err);
    }
  };

  public switchRole = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.body;
      const data = authService.switchRole(role);
      res.json(ApiResponse.success(data, 'Role switched successfully'));
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
