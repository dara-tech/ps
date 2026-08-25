import { Request, Response } from 'express';
import { db } from '../../data/db';
import { ApiResponse } from '../../core/utils/response.util';
import { CalendarEvent } from '../../../../shared';
import { wsGateway } from '../../core/websocket/websocket.gateway';

export class CalendarController {
  public getAll(req: Request, res: Response): void {
    const events = db.calendarEvents;
    res.json(ApiResponse.success(events));
  }

  public create(req: Request, res: Response): void {
    const data = req.body;
    if (!data || !data.title || !data.date) {
      res.status(400).json(ApiResponse.error('Title and Date are required'));
      return;
    }

    const newEvent: CalendarEvent = {
      id: data.id || `evt-${Date.now()}`,
      title: data.title,
      description: data.description || '',
      date: data.date,
      time: data.time || '',
      endTime: data.endTime || '',
      type: data.type || 'task',
      priority: data.priority || 'medium',
      isCompleted: Boolean(data.isCompleted),
    };

    db.addCalendarEvent(newEvent);

    wsGateway.broadcast({
      type: 'CALENDAR_EVENT_CREATED',
      data: newEvent,
    });

    res.status(201).json(ApiResponse.success(newEvent, 'Calendar event created successfully'));
  }

  public toggle(req: Request, res: Response): void {
    const { id } = req.params;
    const updated = db.toggleCalendarEvent(id);
    if (!updated) {
      res.status(404).json(ApiResponse.error('Calendar event not found'));
      return;
    }

    wsGateway.broadcast({
      type: 'CALENDAR_EVENT_TOGGLED',
      data: { id, isCompleted: updated.isCompleted },
    });

    res.json(ApiResponse.success(updated, 'Calendar event toggled'));
  }

  public update(req: Request, res: Response): void {
    const { id } = req.params;
    const updated = db.updateCalendarEvent(id, req.body);
    if (!updated) {
      res.status(404).json(ApiResponse.error('Calendar event not found'));
      return;
    }

    wsGateway.broadcast({
      type: 'CALENDAR_EVENT_UPDATED',
      data: updated,
    });

    res.json(ApiResponse.success(updated, 'Calendar event updated successfully'));
  }

  public delete(req: Request, res: Response): void {
    const { id } = req.params;
    db.deleteCalendarEvent(id);

    wsGateway.broadcast({
      type: 'CALENDAR_EVENT_DELETED',
      data: { id },
    });

    res.json(ApiResponse.success(null, 'Calendar event deleted'));
  }
}

export const calendarController = new CalendarController();
