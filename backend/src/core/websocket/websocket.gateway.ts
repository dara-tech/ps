import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { db } from '../../data/db';
import { ChatMessage, RealtimeEvent, RealtimeEventType } from '../../../../shared';

export class WebSocketGateway {
  private static instance: WebSocketGateway;
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  private constructor() {}

  public static getInstance(): WebSocketGateway {
    if (!WebSocketGateway.instance) {
      WebSocketGateway.instance = new WebSocketGateway();
    }
    return WebSocketGateway.instance;
  }

  public initialize(server: HttpServer, path: string = '/ws'): void {
    this.wss = new WebSocketServer({ server, path });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log(`⚡ [WebSocket] Client connected. Total active desktop clients: ${this.clients.size}`);

      // Send initial state snapshot upon connection
      ws.send(JSON.stringify({
        type: 'INIT_SNAPSHOT',
        data: {
          currentUserId: db.currentUserId,
          tasks: db.tasks,
          projects: db.projects,
          finances: db.finances,
          conversations: db.conversations,
          realtimeEvents: db.realtimeEvents,
        }
      }));

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          if (parsed.type === 'PING') {
            ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          }
        } catch (err) {
          console.error('[WebSocket] Message parse error:', err);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`❌ [WebSocket] Client disconnected. Remaining clients: ${this.clients.size}`);
      });
    });
  }

  public broadcast(payload: { type: string; data?: any }): void {
    const dataStr = JSON.stringify(payload);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(dataStr);
        } catch (err) {
          console.error('[WebSocket] Broadcast error:', err);
        }
      }
    }
  }

  public broadcastRealtimeEvent(eventData: Omit<RealtimeEvent, 'id' | 'timestamp' | 'read'>): RealtimeEvent {
    const event: RealtimeEvent = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Just now',
      read: false,
      ...eventData,
    };

    db.realtimeEvents = [event, ...db.realtimeEvents].slice(0, 50);

    this.broadcast({
      type: 'REALTIME_EVENT',
      data: event,
    });

    return event;
  }

  public broadcastChatMessage(conversationId: string, message: ChatMessage): void {
    this.broadcast({
      type: 'NEW_CHAT_MESSAGE',
      data: { conversationId, message }
    });
  }
}

export const wsGateway = WebSocketGateway.getInstance();
