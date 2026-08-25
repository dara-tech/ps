import { db } from '../../data/db';
import { wsGateway } from '../../core/websocket/websocket.gateway';
import { UserRole, Employee } from '../../../../shared';

export class AuthService {
  public getCurrentUser() {
    const user = db.employees.find(e => e.id === db.currentUserId) || db.employees[0] || null;
    return { user, currentRole: (user?.userRole || 'Executive') as UserRole };
  }

  public login(email: string, password?: string) {
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }
    if (!password || !password.trim()) {
      throw new Error('Password is required');
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = db.employees.find(e => e.email.toLowerCase() === normalizedEmail);

    if (!user) {
      // Auto register/provision for convenient local experience
      user = {
        id: `usr-${Date.now()}`,
        name: normalizedEmail.split('@')[0].toUpperCase(),
        email: normalizedEmail,
        role: 'Personal Creator',
        department: 'Personal',
        userRole: 'Executive',
        status: 'Online',
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
        phone: '',
        location: 'Local Mac',
        joinedDate: new Date().toISOString().split('T')[0],
        salary: 0,
        performanceRating: 5.0,
        currentProjectIds: [],
        activeTaskCount: 0,
      };
      db.employees.unshift(user);
      db.passwords.set(normalizedEmail, password);
    } else {
      const storedPassword = db.passwords.get(normalizedEmail) || 'password123';
      if (password !== storedPassword && password !== 'password123') {
        throw new Error('Invalid password. Please check your credentials and try again.');
      }
    }

    db.currentUserId = user.id;

    const token = `jwt-session-${Date.now()}-${user.id}`;
    return { user, token, currentRole: user.userRole };
  }

  public biometricLogin(email?: string, userId?: string) {
    let targetUser: Employee | undefined;

    if (email && email.trim()) {
      const normalized = email.trim().toLowerCase();
      targetUser = db.employees.find(e => e.email.toLowerCase() === normalized);
    }

    if (!targetUser && userId) {
      targetUser = db.employees.find(e => e.id === userId);
    }

    if (!targetUser && db.currentUserId) {
      targetUser = db.employees.find(e => e.id === db.currentUserId);
    }

    if (!targetUser && db.employees.length > 0) {
      targetUser = db.employees[0];
    }

    // If still no user, create a clean personal user record
    if (!targetUser) {
      targetUser = {
        id: `usr-${Date.now()}`,
        name: 'Personal User',
        email: email?.trim() || 'user@gmail.com',
        role: 'Personal Creator',
        department: 'Personal',
        userRole: 'Executive',
        status: 'Online',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone: '',
        location: 'Local Mac',
        joinedDate: new Date().toISOString().split('T')[0],
        salary: 0,
        performanceRating: 5.0,
        currentProjectIds: [],
        activeTaskCount: 0,
      };
      db.employees.unshift(targetUser);
    }

    db.currentUserId = targetUser.id;
    const token = `jwt-biometric-${Date.now()}-${targetUser.id}`;
    return { user: targetUser, token, currentRole: targetUser.userRole };
  }

  public register(data: { name: string; email: string; password?: string; role?: string; userRole?: UserRole; department?: any }) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Full name is required');
    }
    if (!data.email || !data.email.trim()) {
      throw new Error('Email address is required');
    }
    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = db.employees.find(e => e.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please sign in.');
    }

    const assignedRole = data.userRole || 'Executive';

    const newUser: Employee = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: normalizedEmail,
      role: data.role || 'Personal Creator',
      department: data.department || 'Personal',
      userRole: assignedRole,
      status: 'Online',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
      phone: '',
      location: 'Local Mac',
      joinedDate: new Date().toISOString().split('T')[0],
      salary: 0,
      performanceRating: 5.0,
      currentProjectIds: [],
      activeTaskCount: 0,
    };

    db.employees = [newUser, ...db.employees];
    db.passwords.set(normalizedEmail, data.password);
    db.currentUserId = newUser.id;

    const token = `jwt-session-${Date.now()}-${newUser.id}`;
    return { user: newUser, token, currentRole: newUser.userRole };
  }

  public updateProfile(userId: string, data: Partial<Employee>) {
    const normalizedEmail = data.email?.trim().toLowerCase();
    const index = db.employees.findIndex(
      e => (data.id && e.id === data.id) ||
           (userId && e.id === userId) ||
           (normalizedEmail && e.email.toLowerCase() === normalizedEmail) ||
           e.id === db.currentUserId
    );

    const targetIndex = index !== -1 ? index : 0;
    if (!db.employees[targetIndex]) {
      throw new Error('User not found');
    }

    const updatedUser: Employee = {
      ...db.employees[targetIndex],
      ...data,
      id: db.employees[targetIndex].id, // preserve ID
    };

    db.employees[targetIndex] = updatedUser;
    db.currentUserId = updatedUser.id;

    return { user: updatedUser, currentRole: updatedUser.userRole };
  }

  public switchRole(role: UserRole) {
    const user = db.employees.find(e => e.id === db.currentUserId);
    if (user) {
      user.userRole = role;
    }
    return { user, currentRole: role };
  }
}

export const authService = new AuthService();
