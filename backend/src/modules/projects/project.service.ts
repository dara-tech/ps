import { db } from '../../data/db';
import { wsGateway } from '../../core/websocket/websocket.gateway';
import { Project, Milestone } from '../../../../shared';

export class ProjectService {
  public getAll(): Project[] {
    return db.projects;
  }

  public getById(id: string): Project | undefined {
    return db.projects.find(p => p.id === id);
  }

  public create(data: Omit<Project, 'id' | 'spent' | 'progress'>): Project {
    const newProj: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      spent: 0,
      progress: 0,
    };

    db.projects = [newProj, ...db.projects];

    wsGateway.broadcastRealtimeEvent({
      type: 'ANNOUNCEMENT',
      title: 'New Strategic Initiative',
      message: `${newProj.name} (${newProj.code}) initialized under ${newProj.department}.`,
      actorId: db.currentUserId,
      entityId: newProj.id,
      entityType: 'project',
      priority: 'high',
    });

    wsGateway.broadcast({ type: 'PROJECT_CREATED_SYNC', data: newProj });
    return newProj;
  }

  public toggleMilestone(projectId: string, milestoneId: string): Project {
    const project = db.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const m = project.milestones.find((item: Milestone) => item.id === milestoneId);
    if (!m) throw new Error('Milestone not found');

    m.completed = !m.completed;
    const completedCount = project.milestones.filter((item: Milestone) => item.completed).length;
    project.progress = Math.round((completedCount / project.milestones.length) * 100);

    if (m.completed) {
      wsGateway.broadcastRealtimeEvent({
        type: 'PROJECT_MILESTONE_COMPLETED',
        title: 'Milestone Signed Off 🎯',
        message: `"${m.title}" is complete. ${project.name} progress is now ${project.progress}%.`,
        actorId: db.currentUserId,
        entityId: project.id,
        entityType: 'project',
        priority: 'normal',
      });
    }

    wsGateway.broadcast({ type: 'PROJECT_UPDATED_SYNC', data: project });
    return project;
  }
}

export const projectService = new ProjectService();
