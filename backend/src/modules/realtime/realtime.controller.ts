import { Request, Response, NextFunction } from 'express';
import { realtimeService } from './realtime.service';
import { ApiResponse } from '../../core/utils/response.util';

export class RealtimeController {
  public getEvents = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = realtimeService.getEvents();
      res.json(ApiResponse.success(data));
    } catch (err) {
      next(err);
    }
  };

  public triggerSimulation = (req: Request, res: Response, next: NextFunction) => {
    try {
      const event = realtimeService.triggerSimulation();
      res.json(ApiResponse.success({ event }, 'Simulation event dispatched'));
    } catch (err) {
      next(err);
    }
  };
}

export const realtimeController = new RealtimeController();
