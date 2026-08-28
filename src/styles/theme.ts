export type ThemeMode = 'light' | 'dark' | 'midnight' | 'warm';
export type AccentColor = 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'graphite';

export interface ThemeTokens {
  mode: ThemeMode;
  accent: AccentColor;
  
  // Backgrounds & Surfaces
  windowBg: string;
  surfaceBg: string;
  surfaceMuted: string;
  surfaceHover: string;
  surfaceActive: string;
  
  // Borders (1px Clean - Zero Shadows)
  borderSubtle: string;
  borderStrong: string;
  
  // Text & Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // Accent & Highlights
  accentColor: string;
  accentSoft: string;
  accentBorder: string;
  accentFg: string;
  
  // Chat & Messaging
  bubbleIncoming: string;
  bubbleIncomingText: string;
  bubbleIncomingBorder: string;
  bubbleOutgoing: string;
  bubbleOutgoingText: string;
  bubbleOutgoingBorder: string;
  
  // Status Colors
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
}

export const ACCENT_PALETTES: Record<
  AccentColor,
  { label: string; khLabel: string; hex: string; softLight: string; softDark: string; borderLight: string; borderDark: string }
> = {
  blue: {
    label: 'Telegram Blue',
    khLabel: 'ខៀវបុរាណ',
    hex: '#2563EB',
    softLight: '#EFF6FF',
    softDark: '#1E3A8A33',
    borderLight: '#DBEAFE',
    borderDark: '#1E40AF',
  },
  indigo: {
    label: 'Linear Indigo',
    khLabel: 'ស្វាយអាំងឌីហ្គោ',
    hex: '#6366F1',
    softLight: '#EEF2FF',
    softDark: '#312E8133',
    borderLight: '#E0E7FF',
    borderDark: '#4338CA',
  },
  emerald: {
    label: 'Emerald Mint',
    khLabel: 'បៃតងត្បូងមរកត',
    hex: '#10B981',
    softLight: '#ECFDF5',
    softDark: '#064E3B33',
    borderLight: '#A7F3D0',
    borderDark: '#047857',
  },
  amber: {
    label: 'Solar Amber',
    khLabel: 'លឿងទុំសុរិយា',
    hex: '#F59E0B',
    softLight: '#FFFBEB',
    softDark: '#78350F33',
    borderLight: '#FDE68A',
    borderDark: '#B45309',
  },
  rose: {
    label: 'Ruby Rose',
    khLabel: 'ក្រហមផ្កាកុលាប',
    hex: '#F43F5E',
    softLight: '#FFF1F2',
    softDark: '#88133733',
    borderLight: '#FECDD3',
    borderDark: '#BE123C',
  },
  graphite: {
    label: 'Graphite Titanium',
    khLabel: 'ប្រផេះក្រាហ្វិច',
    hex: '#0F172A',
    softLight: '#F1F5F9',
    softDark: '#33415533',
    borderLight: '#E2E8F0',
    borderDark: '#475569',
  },
};

export const generateThemeTokens = (mode: ThemeMode, accent: AccentColor): ThemeTokens => {
  const pal = ACCENT_PALETTES[accent] || ACCENT_PALETTES.blue;
  const isDark = mode === 'dark' || mode === 'midnight';

  const accentColor = pal.hex;
  const accentSoft = isDark ? pal.softDark : pal.softLight;
  const accentBorder = isDark ? pal.borderDark : pal.borderLight;

  if (mode === 'midnight') {
    // Pure OLED Jet Black
    return {
      mode,
      accent,
      windowBg: '#05070B',
      surfaceBg: '#0B0F17',
      surfaceMuted: '#111724',
      surfaceHover: '#161F30',
      surfaceActive: '#1D283E',
      borderSubtle: '#1E293B',
      borderStrong: '#334155',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      textInverse: '#05070B',
      accentColor,
      accentSoft,
      accentBorder,
      accentFg: '#FFFFFF',
      bubbleIncoming: '#111724',
      bubbleIncomingText: '#F8FAFC',
      bubbleIncomingBorder: '#1E293B',
      bubbleOutgoing: accentColor,
      bubbleOutgoingText: '#FFFFFF',
      bubbleOutgoingBorder: accentColor,
      success: '#10B981',
      successSoft: '#064E3B33',
      danger: '#EF4444',
      dangerSoft: '#7F1D1D33',
      warning: '#F59E0B',
      warningSoft: '#78350F33',
    };
  }

  if (mode === 'dark') {
    // Deep Slate Navy (Telegram Night)
    return {
      mode,
      accent,
      windowBg: '#0F172A',
      surfaceBg: '#1E293B',
      surfaceMuted: '#243048',
      surfaceHover: '#2A3854',
      surfaceActive: '#334366',
      borderSubtle: '#334155',
      borderStrong: '#475569',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      textInverse: '#0F172A',
      accentColor,
      accentSoft,
      accentBorder,
      accentFg: '#FFFFFF',
      bubbleIncoming: '#243048',
      bubbleIncomingText: '#F8FAFC',
      bubbleIncomingBorder: '#334155',
      bubbleOutgoing: accentColor,
      bubbleOutgoingText: '#FFFFFF',
      bubbleOutgoingBorder: accentColor,
      success: '#10B981',
      successSoft: '#064E3B33',
      danger: '#EF4444',
      dangerSoft: '#7F1D1D33',
      warning: '#F59E0B',
      warningSoft: '#78350F33',
    };
  }

  if (mode === 'warm') {
    // Soft Tinted Ivory / Matcha Cream
    return {
      mode,
      accent,
      windowBg: '#F7F6F2',
      surfaceBg: '#FFFFFF',
      surfaceMuted: '#EFECE6',
      surfaceHover: '#E8E4DC',
      surfaceActive: '#DFDAD0',
      borderSubtle: '#E5E1D8',
      borderStrong: '#D3CDC0',
      textPrimary: '#2D312E',
      textSecondary: '#5C635E',
      textMuted: '#8C948E',
      textInverse: '#FFFFFF',
      accentColor,
      accentSoft,
      accentBorder,
      accentFg: '#FFFFFF',
      bubbleIncoming: '#EFECE6',
      bubbleIncomingText: '#2D312E',
      bubbleIncomingBorder: '#E5E1D8',
      bubbleOutgoing: accentColor,
      bubbleOutgoingText: '#FFFFFF',
      bubbleOutgoingBorder: accentColor,
      success: '#16A34A',
      successSoft: '#DCFCE7',
      danger: '#DC2626',
      dangerSoft: '#FEE2E2',
      warning: '#D97706',
      warningSoft: '#FEF3C7',
    };
  }

  // Default: Classic Crisp Light (Nordic)
  return {
    mode: 'light',
    accent,
    windowBg: '#FFFFFF',
    surfaceBg: '#F8FAFC',
    surfaceMuted: '#F1F5F9',
    surfaceHover: '#E2E8F0',
    surfaceActive: '#CBD5E1',
    borderSubtle: '#E2E8F0',
    borderStrong: '#CBD5E1',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
    accentColor,
    accentSoft,
    accentBorder,
    accentFg: '#FFFFFF',
    bubbleIncoming: '#F1F5F9',
    bubbleIncomingText: '#0F172A',
    bubbleIncomingBorder: '#E2E8F0',
    bubbleOutgoing: accentColor,
    bubbleOutgoingText: '#FFFFFF',
    bubbleOutgoingBorder: accentColor,
    success: '#16A34A',
    successSoft: '#ECFDF5',
    danger: '#DC2626',
    dangerSoft: '#FEF2F2',
    warning: '#F59E0B',
    warningSoft: '#FFFBEB',
  };
};
