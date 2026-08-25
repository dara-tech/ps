import { Employee, UserRole } from '../../shared';

const API_BASE = 'http://localhost:4000/api/v1/auth';

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: Employee; token: string; currentRole: UserRole }> => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Invalid credentials');
    return json.data;
  },

  biometricLogin: async (email?: string, userId?: string): Promise<{ user: Employee; token: string; currentRole: UserRole }> => {
    const res = await fetch(`${API_BASE}/biometric-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Touch ID verification failed');
    return json.data;
  },

  register: async (data: { name: string; email: string; password: string; role?: string; department?: string; userRole?: UserRole }): Promise<{ user: Employee; token: string }> => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Registration failed');
    return json.data;
  },

  getMe: async (): Promise<{ user: Employee; currentRole: UserRole }> => {
    const res = await fetch(`${API_BASE}/me`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to fetch current user');
    return json.data;
  },

  updateProfile: async (data: Partial<Employee>): Promise<{ user: Employee; currentRole: UserRole }> => {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update profile');
    return json.data;
  },

  switchRole: async (role: UserRole): Promise<{ user: Employee; currentRole: UserRole }> => {
    const res = await fetch(`${API_BASE}/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to switch role');
    return json.data;
  },
};
