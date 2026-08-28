import { create } from 'zustand';
import { ThemeMode, AccentColor, BubbleStyle, ThemeTokens, generateThemeTokens } from '../styles/theme';

const STORAGE_KEY = 'epr_app_theme_config';

interface ThemeState {
  mode: ThemeMode;
  accent: AccentColor;
  bubbleStyle: BubbleStyle;
  customBubbleOutgoing?: string | null;
  customBubbleIncoming?: string | null;
  tokens: ThemeTokens;
  isAutoNight: boolean;
  
  // Actions
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  setBubbleStyle: (style: BubbleStyle) => void;
  setCustomBubbleOutgoing: (color: string | null) => void;
  setCustomBubbleIncoming: (color: string | null) => void;
  setIsAutoNight: (auto: boolean) => void;
  toggleLightDark: () => void;
}

const getStoredTheme = (): {
  mode: ThemeMode;
  accent: AccentColor;
  bubbleStyle: BubbleStyle;
  customBubbleOutgoing?: string | null;
  customBubbleIncoming?: string | null;
  isAutoNight: boolean;
} => {
  const defaults = {
    mode: 'light' as ThemeMode,
    accent: 'blue' as AccentColor,
    bubbleStyle: 'tiktok' as BubbleStyle,
    customBubbleOutgoing: null,
    customBubbleIncoming: null,
    isAutoNight: false,
  };
  if (typeof window === 'undefined' || !window.localStorage) return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      mode: parsed.mode || 'light',
      accent: parsed.accent || 'blue',
      bubbleStyle: parsed.bubbleStyle || 'tiktok',
      customBubbleOutgoing: parsed.customBubbleOutgoing || null,
      customBubbleIncoming: parsed.customBubbleIncoming || null,
      isAutoNight: parsed.isAutoNight || false,
    };
  } catch {
    return defaults;
  }
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = getStoredTheme();
  const initialTokens = generateThemeTokens(initial.mode, initial.accent, {
    bubbleStyle: initial.bubbleStyle,
    customBubbleOutgoing: initial.customBubbleOutgoing || undefined,
    customBubbleIncoming: initial.customBubbleIncoming || undefined,
  });

  const persist = (
    mode: ThemeMode,
    accent: AccentColor,
    bubbleStyle: BubbleStyle,
    customBubbleOutgoing: string | null | undefined,
    customBubbleIncoming: string | null | undefined,
    isAutoNight: boolean
  ) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ mode, accent, bubbleStyle, customBubbleOutgoing, customBubbleIncoming, isAutoNight })
        );
      } catch (err) {
        console.error('Failed to save theme to localStorage:', err);
      }
    }
  };

  return {
    mode: initial.mode,
    accent: initial.accent,
    bubbleStyle: initial.bubbleStyle,
    customBubbleOutgoing: initial.customBubbleOutgoing,
    customBubbleIncoming: initial.customBubbleIncoming,
    tokens: initialTokens,
    isAutoNight: initial.isAutoNight,

    setMode: (mode: ThemeMode) => {
      const { accent, bubbleStyle, customBubbleOutgoing, customBubbleIncoming, isAutoNight } = get();
      const tokens = generateThemeTokens(mode, accent, {
        bubbleStyle,
        customBubbleOutgoing: customBubbleOutgoing || undefined,
        customBubbleIncoming: customBubbleIncoming || undefined,
      });
      set({ mode, tokens });
      persist(mode, accent, bubbleStyle, customBubbleOutgoing, customBubbleIncoming, isAutoNight);
    },

    setAccent: (accent: AccentColor) => {
      const { mode, bubbleStyle, customBubbleOutgoing, customBubbleIncoming, isAutoNight } = get();
      const tokens = generateThemeTokens(mode, accent, {
        bubbleStyle,
        customBubbleOutgoing: customBubbleOutgoing || undefined,
        customBubbleIncoming: customBubbleIncoming || undefined,
      });
      set({ accent, tokens });
      persist(mode, accent, bubbleStyle, customBubbleOutgoing, customBubbleIncoming, isAutoNight);
    },

    setBubbleStyle: (bubbleStyle: BubbleStyle) => {
      const { mode, accent, customBubbleOutgoing, customBubbleIncoming, isAutoNight } = get();
      const tokens = generateThemeTokens(mode, accent, {
        bubbleStyle,
        customBubbleOutgoing: customBubbleOutgoing || undefined,
        customBubbleIncoming: customBubbleIncoming || undefined,
      });
      set({ bubbleStyle, tokens });
      persist(mode, accent, bubbleStyle, customBubbleOutgoing, customBubbleIncoming, isAutoNight);
    },

    setCustomBubbleOutgoing: (color: string | null) => {
      const { mode, accent, bubbleStyle, customBubbleIncoming, isAutoNight } = get();
      const tokens = generateThemeTokens(mode, accent, {
        bubbleStyle,
        customBubbleOutgoing: color || undefined,
        customBubbleIncoming: customBubbleIncoming || undefined,
      });
      set({ customBubbleOutgoing: color, tokens });
      persist(mode, accent, bubbleStyle, color, customBubbleIncoming, isAutoNight);
    },

    setCustomBubbleIncoming: (color: string | null) => {
      const { mode, accent, bubbleStyle, customBubbleOutgoing, isAutoNight } = get();
      const tokens = generateThemeTokens(mode, accent, {
        bubbleStyle,
        customBubbleOutgoing: customBubbleOutgoing || undefined,
        customBubbleIncoming: color || undefined,
      });
      set({ customBubbleIncoming: color, tokens });
      persist(mode, accent, bubbleStyle, customBubbleOutgoing, color, isAutoNight);
    },

    setIsAutoNight: (isAutoNight: boolean) => {
      const { mode, accent, bubbleStyle, customBubbleOutgoing, customBubbleIncoming } = get();
      set({ isAutoNight });
      persist(mode, accent, bubbleStyle, customBubbleOutgoing, customBubbleIncoming, isAutoNight);
    },

    toggleLightDark: () => {
      const { mode, accent, bubbleStyle, customBubbleOutgoing, customBubbleIncoming, isAutoNight } = get();
      const nextMode: ThemeMode = mode === 'light' || mode === 'warm' ? 'dark' : 'light';
      const tokens = generateThemeTokens(nextMode, accent, {
        bubbleStyle,
        customBubbleOutgoing: customBubbleOutgoing || undefined,
        customBubbleIncoming: customBubbleIncoming || undefined,
      });
      set({ mode: nextMode, tokens });
      persist(nextMode, accent, bubbleStyle, customBubbleOutgoing, customBubbleIncoming, isAutoNight);
    },
  };
});
