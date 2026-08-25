import { Router } from 'express';
import { authController } from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/login', authController.login);
authRoutes.post('/biometric-login', authController.biometricLogin);
authRoutes.post('/register', authController.register);
authRoutes.get('/me', authController.getMe);
authRoutes.put('/profile', authController.updateProfile);
authRoutes.post('/switch-role', authController.switchRole);
