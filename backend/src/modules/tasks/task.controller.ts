import { Request, Response, NextFunction } from 'express';
import { taskService } from './task.service';
import { ApiResponse } from '../../core/utils/response.util';

export class TaskController {
  public getAll = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = taskService.getAll();
      res.json(ApiResponse.success(data));
    } catch (err) {
      next(err);
    }
  };

  public create = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = taskService.create(req.body);
      res.status(201).json(ApiResponse.success(data, 'Task created'));
    } catch (err) {
      next(err);
    }
  };

  public updateStatus = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const data = taskService.updateStatus(req.params.id, status);
      res.json(ApiResponse.success(data, 'Task status updated'));
    } catch (err) {
      next(err);
    }
  };

  public delete = (req: Request, res: Response, next: NextFunction) => {
    try {
      taskService.delete(req.params.id);
      res.json(ApiResponse.success({ id: req.params.id }, 'Task deleted'));
    } catch (err) {
      next(err);
    }
  };
}

export const taskController = new TaskController();
