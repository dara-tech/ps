import { Request, Response, NextFunction } from 'express';
import { financeService } from './finance.service';
import { ApiResponse } from '../../core/utils/response.util';

export class FinanceController {
  public getAll = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = financeService.getAll();
      res.json(ApiResponse.success(data));
    } catch (err) {
      next(err);
    }
  };

  public create = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = financeService.create(req.body);
      res.status(201).json(ApiResponse.success(data, 'Transaction recorded'));
    } catch (err) {
      next(err);
    }
  };

  public delete = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      financeService.delete(id);
      res.json(ApiResponse.success({ id }, 'Transaction deleted'));
    } catch (err) {
      next(err);
    }
  };
}

export const financeController = new FinanceController();
