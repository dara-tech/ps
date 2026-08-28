import { create } from 'zustand';
import { ThemeMode, AccentColor, ThemeTokens, generateThemeTokens } from '../styles/theme';

const STORAGE_KEY = 'epr_app_theme_config';

interface ThemeState {
  mode: ThemeMode;
  accent: AccentColor;
  tokens: ThemeTokens;
  isAutoNight: boolean;
  
  // Actions
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  setIsAutoNight: (auto: boolean) => void;
  toggleLightDark: () => void;
}

const getStoredTheme = (): { mode: ThemeMode; accent: AccentColor; isAutoNight: boolean } => {
  const defaults = { mode: 'light' as ThemeMode, accent: 'blue' as AccentColor, isAutoNight: false };
  if (typeof window === 'undefined' || !window.localStorage) return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      mode: parsed.mode || 'light',
      accent: parsed.accent || 'blue',
      isAutoNight: parsed.isAutoNight || false,
    };
  } catch {
    return defaults;
  }
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = getStoredTheme();
  const initialTokens = generateThemeTokens(initial.mode, initial.accent);

  const persist = (mode: ThemeMode, accent: AccentColor, isAutoNight: boolean) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, accent, isAutoNight }));
      } catch (err) {
        console.error('Failed to save theme to localStorage:', err);
      }
    }
  };

  return {
    mode: initial.mode,
    accent: initial.accent,
    tokens: initialTokens,
    isAutoNight: initial.isAutoNight,

    setMode: (mode: ThemeMode) => {
      const { accent, isAutoNight } = get();
      const tokens = generateThemeTokens(mode, accent);
      set({ mode, tokens });
      persist(mode, accent, isAutoNight);
    },

    setAccent: (accent: AccentColor) => {
      const { mode, isAutoNight } = get();
      const tokens = generateThemeTokens(mode, accent);
      set({ accent, tokens });
      persist(mode, accent, isAutoNight);
    },

    setIsAutoNight: (isAutoNight: boolean) => {
      const { mode, accent } = get();
      set({ isAutoNight });
      persist(mode, accent, isAutoNight);
    },

    toggleLightDark: () => {
      const { mode, accent, isAutoNight } = get();
      const nextMode: ThemeMode = mode === 'light' || mode === 'warm' ? 'dark' : 'light';
      const tokens = generateThemeTokens(nextMode, accent);
      set({ mode: nextMode, tokens });
      persist(nextMode, accent, isAutoNight);
    },
  };
});
