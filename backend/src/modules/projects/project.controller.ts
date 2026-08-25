import { Request, Response, NextFunction } from 'express';
import { projectService } from './project.service';
import { ApiResponse } from '../../core/utils/response.util';

export class ProjectController {
  public getAll = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = projectService.getAll();
      res.json(ApiResponse.success(data));
    } catch (err) {
      next(err);
    }
  };

  public getById = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = projectService.getById(req.params.id);
      if (!data) return res.status(404).json(ApiResponse.error('Project not found'));
      res.json(ApiResponse.success(data));
    } catch (err) {
      next(err);
    }
  };

  public create = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = projectService.create(req.body);
      res.status(201).json(ApiResponse.success(data, 'Project created'));
    } catch (err) {
      next(err);
    }
  };

  public update = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = projectService.update(req.params.id, req.body);
      res.json(ApiResponse.success(data, 'Project updated'));
    } catch (err) {
      next(err);
    }
  };

  public delete = (req: Request, res: Response, next: NextFunction) => {
    try {
      projectService.delete(req.params.id);
      res.json(ApiResponse.success({ id: req.params.id }, 'Project deleted'));
    } catch (err) {
      next(err);
    }
  };

  public toggleMilestone = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, milestoneId } = req.params;
      const data = projectService.toggleMilestone(id, milestoneId);
      res.json(ApiResponse.success(data, 'Milestone toggled'));
    } catch (err) {
      next(err);
    }
  };
}

export const projectController = new ProjectController();
