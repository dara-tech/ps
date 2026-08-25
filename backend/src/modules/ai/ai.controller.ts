import { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service';
import { ApiResponse } from '../../core/utils/response.util';

export class AIController {
  public getModels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await aiService.listModels();
      res.json(ApiResponse.success(data, 'Local AI models retrieved'));
    } catch (err) {
      next(err);
    }
  };

  public chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { model, messages, clientContext } = req.body;
      const data = await aiService.chat({ model, messages, clientContext });
      res.json(ApiResponse.success(data, 'AI response generated'));
    } catch (err) {
      next(err);
    }
  };

  public breakdownGoal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { goalTitle, model } = req.body;
      const data = await aiService.breakdownGoal(goalTitle, model);
      res.json(ApiResponse.success(data, 'Goal broken down into subtasks'));
    } catch (err) {
      next(err);
    }
  };

  public parseExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { text, model } = req.body;
      const data = await aiService.parseExpense(text, model);
      res.json(ApiResponse.success(data, 'Expense parsed successfully'));
    } catch (err) {
      next(err);
    }
  };

  public getDailyBriefing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { model } = req.query;
      const data = await aiService.generateDailyBriefing(model as string);
      res.json(ApiResponse.success(data, 'Daily briefing generated'));
    } catch (err) {
      next(err);
    }
  };
}

export const aiController = new AIController();
