import { Router } from 'express';
import { aiController } from './ai.controller';

export const aiRoutes = Router();

aiRoutes.get('/models', aiController.getModels);
aiRoutes.post('/chat', aiController.chat);
aiRoutes.post('/breakdown-goal', aiController.breakdownGoal);
aiRoutes.post('/parse-expense', aiController.parseExpense);
aiRoutes.get('/daily-briefing', aiController.getDailyBriefing);
