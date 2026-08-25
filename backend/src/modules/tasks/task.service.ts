import { db } from '../../data/db';
import { wsGateway } from '../../core/websocket/websocket.gateway';
import { Task, TaskStatus } from '../../../../shared';

export class TaskService {
  public getAll(): Task[] {
    return db.tasks;
  }

  public create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'commentsCount'>): Task {
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commentsCount: 0,
    };

    db.tasks = [newTask, ...db.tasks];

    wsGateway.broadcastRealtimeEvent({
      type: 'TASK_CREATED',
      title: 'New Task Created',
      message: `"${newTask.title}" assigned to ${newTask.assigneeName}.`,
      actorId: db.currentUserId,
      entityId: newTask.id,
      entityType: 'task',
      priority: newTask.priority === 'urgent' ? 'urgent' : 'normal',
    });

    wsGateway.broadcast({ type: 'TASK_CREATED_SYNC', data: newTask });
    return newTask;
  }

  public updateStatus(id: string, status: TaskStatus): Task {
    const updated = db.updateTask(id, {
      status,
      completedAt: status === 'done' ? new Date().toISOString() : undefined,
    });
    if (!updated) throw new Error('Task not found');

    const currentUser = db.employees.find(e => e.id === db.currentUserId);
    wsGateway.broadcastRealtimeEvent({
      type: 'TASK_STATUS_CHANGED',
      title: `Task Status -> ${status.toUpperCase().replace('_', ' ')}`,
      message: `${currentUser?.name || 'User'} moved "${updated.title}".`,
      actorId: db.currentUserId,
      actorName: currentUser?.name,
      actorAvatar: currentUser?.avatar,
      entityId: updated.id,
      entityType: 'task',
      priority: status === 'done' ? 'high' : 'normal',
    });

    wsGateway.broadcast({ type: 'TASK_STATUS_SYNC', data: { taskId: id, status } });
    return updated;
  }

  public update(id: string, updates: Partial<Task>): Task {
    const updated = db.updateTask(id, updates);
    if (!updated) throw new Error('Task not found');

    wsGateway.broadcast({ type: 'TASK_UPDATED_SYNC', data: updated });
    return updated;
  }

  public delete(id: string): boolean {
    db.deleteTask(id);
    wsGateway.broadcast({ type: 'TASK_DELETED_SYNC', data: { taskId: id } });
    return true;
  }
}

export const taskService = new TaskService();
