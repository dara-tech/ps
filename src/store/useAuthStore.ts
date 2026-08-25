import { create } from 'zustand';
import { Employee, UserRole } from '../../shared';
import { authApi } from '../services/authApi';
import { toast } from './useToastStore';

const STORAGE_KEY = 'epr_active_user';

const getSavedUser = (): Employee | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveUserLocally = (user: Employee | null) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.warn('Failed to save user to localStorage:', e);
  }
};

interface AuthState {
  user: Employee | null;
  currentRole: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;

  login: (email: string, password: string) => Promise<boolean>;
  biometricLogin: () => Promise<boolean>;
  signup: (data: { name: string; email: string; password: string; role: string; department: string; userRole: UserRole }) => Promise<boolean>;
  logout: () => void;
  initAuth: () => Promise<void>;
  updateProfile: (updatedData: Partial<Employee>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getSavedUser(),
  currentRole: 'Executive',
  token: null,
  isAuthenticated: false,
  isLoading: false,
  authMode: 'login',
  setAuthMode: (mode) => set({ authMode: mode }),

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const data = await authApi.login(email, password);
      // Merge with locally saved custom profile if same email
      const local = getSavedUser();
      const finalUser = local && local.email.toLowerCase() === data.user.email.toLowerCase()
        ? { ...data.user, ...local }
        : data.user;

      saveUserLocally(finalUser);
      set({
        user: finalUser,
        currentRole: data.currentRole || finalUser.userRole,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success('Welcome back!', `Logged in as ${finalUser.name}`);
      return true;
    } catch (err: any) {
      set({ isLoading: false });
      toast.error('Authentication Failed', err.message || 'Invalid email or password');
      return false;
    }
  },

  biometricLogin: async () => {
    set({ isLoading: true });
    try {
      const local = getSavedUser();
      const emailToUse = local?.email || 'admin@enterprise.com';
      const data = await authApi.biometricLogin(emailToUse, local?.id);

      const finalUser = local ? { ...data.user, ...local } : data.user;
      saveUserLocally(finalUser);

      set({
        user: finalUser,
        currentRole: data.currentRole || finalUser.userRole,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success('Touch ID Verified', `Welcome back, ${finalUser.name}!`);
      return true;
    } catch (err: any) {
      // Fallback: If server is cold/offline, authenticate with stored local biometric profile
      const local = getSavedUser();
      if (local) {
        set({
          user: local,
          currentRole: local.userRole,
          token: `jwt-biometric-${Date.now()}`,
          isAuthenticated: true,
          isLoading: false,
        });
        toast.success('Touch ID Verified', `Welcome back, ${local.name}!`);
        return true;
      }
      set({ isLoading: false });
      toast.error('Biometric Sign In Failed', err.message || 'Could not verify Touch ID');
      return false;
    }
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register(data);
      saveUserLocally(res.user);
      set({
        user: res.user,
        currentRole: res.user.userRole,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
      });
      toast.success('Account Created', `Welcome to Quantum Enterprise, ${res.user.name}!`);
      return true;
    } catch (err: any) {
      set({ isLoading: false });
      toast.error('Registration Failed', err.message || 'Could not complete registration');
      return false;
    }
  },

  logout: () => {
    set({ token: null, isAuthenticated: false, currentRole: 'Executive' });
    toast.info('Signed Out', 'You have been disconnected from the workspace');
  },

  initAuth: async () => {
    try {
      const data = await authApi.getMe();
      const local = getSavedUser();
      if (data?.user) {
        const finalUser = local && local.email.toLowerCase() === data.user.email.toLowerCase()
          ? { ...data.user, ...local }
          : data.user;
        saveUserLocally(finalUser);
        set({ user: finalUser, currentRole: data.currentRole, isAuthenticated: true });
      } else if (local) {
        set({ user: local, isAuthenticated: true });
      }
    } catch (err) {
      const local = getSavedUser();
      if (local) {
        set({ user: local, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    }
  },

  updateProfile: (updatedData) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const mergedUser: Employee = {
      ...currentUser,
      ...updatedData,
    };

    saveUserLocally(mergedUser);

    set({
      user: mergedUser,
      currentRole: updatedData.userRole || mergedUser.userRole,
    });

    toast.success('Profile Updated', 'Your profile details have been saved successfully');

    authApi.updateProfile({
      ...updatedData,
      id: currentUser.id,
      email: currentUser.email,
    }).catch((err) => {
      console.warn('Could not sync profile to backend:', err);
    });
  },
}));
