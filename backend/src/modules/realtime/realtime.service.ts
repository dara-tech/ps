import { db } from '../../data/db';
import { wsGateway } from '../../core/websocket/websocket.gateway';
import { RealtimeEvent } from '../../../../shared';

export class RealtimeService {
  public getEvents(): RealtimeEvent[] {
    return db.realtimeEvents;
  }

  public triggerSimulation(): RealtimeEvent {
    return wsGateway.broadcastRealtimeEvent({
      type: 'TASK_STATUS_CHANGED',
      title: 'AI Engine Synchronized',
      message: 'Workspace is synchronized with Google Gemini Cloud AI engine.',
    });
  }

}

export const realtimeService = new RealtimeService();
