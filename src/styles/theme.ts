export type ThemeMode = 'light' | 'dark' | 'midnight' | 'warm' | 'tiktok';
export type AccentColor = 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'graphite' | 'tiktok' | 'cyan';
export type BubbleStyle = 'tiktok' | 'telegram' | 'capsule' | 'modern' | 'minimal';

export interface ThemeTokens {
  mode: ThemeMode;
  accent: AccentColor;
  bubbleStyle: BubbleStyle;
  
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

export const BUBBLE_COLOR_PRESETS = [
  { id: 'tiktok_red', label: 'TikTok Red', khLabel: 'ក្រហម TikTok', hex: '#FE2C55' },
  { id: 'tiktok_cyan', label: 'Electric Cyan', khLabel: 'ផ្ទៃមេឃ Cyan', hex: '#25F4EE' },
  { id: 'tiktok_purple', label: 'Neon Violet', khLabel: 'ស្វាយ Neon', hex: '#8B5CF6' },
  { id: 'sunset_orange', label: 'Sunset Coral', khLabel: 'ទឹកក្រូច Sunset', hex: '#FF5722' },
  { id: 'telegram_blue', label: 'Telegram Blue', khLabel: 'ខៀវ Telegram', hex: '#2563EB' },
  { id: 'emerald_green', label: 'Cyber Mint', khLabel: 'បៃតង Emerald', hex: '#10B981' },
  { id: 'magenta_pink', label: 'Hot Pink', khLabel: 'ផ្កាឈូក Pink', hex: '#EC4899' },
  { id: 'dark_slate', label: 'Slate Night', khLabel: 'ប្រផេះងងឹត', hex: '#334155' },
];

export const BUBBLE_STYLE_OPTIONS: { id: BubbleStyle; label: string; khLabel: string; desc: string }[] = [
  { id: 'tiktok', label: 'TikTok Smooth', khLabel: 'រចនាប័ទ្ម TikTok', desc: 'Smooth curved pills with TikTok asymmetric tail' },
  { id: 'telegram', label: 'Telegram Classic', khLabel: 'Telegram បុរាណ', desc: 'Standard Telegram message bubble radius' },
  { id: 'capsule', label: 'Ultra Capsule', khLabel: 'គ្រាប់ថ្នាំ Capsule', desc: 'Super rounded modern pill shape' },
  { id: 'minimal', label: 'Crisp Minimal', khLabel: 'ជ្រុងស្អាត Minimal', desc: 'Crisp, modern compact rounded corners' },
];

export const getBubbleBorderRadius = (style: BubbleStyle = 'tiktok', isMe: boolean = true) => {
  switch (style) {
    case 'tiktok':
      return isMe
        ? { borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 18, borderBottomRightRadius: 4 }
        : { borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomRightRadius: 18, borderBottomLeftRadius: 4 };
    case 'capsule':
      return { borderRadius: 22 };
    case 'minimal':
      return { borderRadius: 6 };
    case 'modern':
      return { borderRadius: 12 };
    case 'telegram':
    default:
      return isMe
        ? { borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomLeftRadius: 14, borderBottomRightRadius: 3 }
        : { borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomRightRadius: 14, borderBottomLeftRadius: 3 };
  }
};

export const ACCENT_PALETTES: Record<
  AccentColor,
  { label: string; khLabel: string; hex: string; softLight: string; softDark: string; borderLight: string; borderDark: string }
> = {
  blue: {
    label: 'Telegram Blue',
    khLabel: 'ខៀវបុរាណ',
    hex: '#2563EB',
    softLight: '#EFF6FF',
    softDark: 'rgba(37, 99, 235, 0.15)',
    borderLight: '#DBEAFE',
    borderDark: 'rgba(37, 99, 235, 0.35)',
  },
  tiktok: {
    label: 'TikTok Red',
    khLabel: 'ក្រហម TikTok',
    hex: '#FE2C55',
    softLight: '#FFF1F3',
    softDark: 'rgba(254, 44, 85, 0.18)',
    borderLight: '#FECDD6',
    borderDark: 'rgba(254, 44, 85, 0.35)',
  },
  cyan: {
    label: 'TikTok Cyan',
    khLabel: 'ផ្ទៃមេឃ TikTok',
    hex: '#25F4EE',
    softLight: '#ECFEFF',
    softDark: 'rgba(37, 244, 238, 0.18)',
    borderLight: '#A5F3FC',
    borderDark: 'rgba(37, 244, 238, 0.35)',
  },
  indigo: {
    label: 'Linear Indigo',
    khLabel: 'ស្វាយអាំងឌីហ្គោ',
    hex: '#6366F1',
    softLight: '#EEF2FF',
    softDark: 'rgba(99, 102, 241, 0.15)',
    borderLight: '#E0E7FF',
    borderDark: 'rgba(99, 102, 241, 0.35)',
  },
  emerald: {
    label: 'Emerald Mint',
    khLabel: 'បៃតងត្បូងមរកត',
    hex: '#10B981',
    softLight: '#ECFDF5',
    softDark: 'rgba(16, 185, 129, 0.15)',
    borderLight: '#A7F3D0',
    borderDark: 'rgba(16, 185, 129, 0.35)',
  },
  amber: {
    label: 'Solar Amber',
    khLabel: 'លឿងទុំសុរិយា',
    hex: '#F59E0B',
    softLight: '#FFFBEB',
    softDark: 'rgba(245, 158, 11, 0.15)',
    borderLight: '#FDE68A',
    borderDark: 'rgba(245, 158, 11, 0.35)',
  },
  rose: {
    label: 'Ruby Rose',
    khLabel: 'ក្រហមផ្កាកុលាប',
    hex: '#F43F5E',
    softLight: '#FFF1F2',
    softDark: 'rgba(244, 63, 94, 0.15)',
    borderLight: '#FECDD3',
    borderDark: 'rgba(244, 63, 94, 0.35)',
  },
  graphite: {
    label: 'Graphite Titanium',
    khLabel: 'ប្រផេះក្រាហ្វិច',
    hex: '#0F172A',
    softLight: '#F1F5F9',
    softDark: 'rgba(148, 163, 184, 0.15)',
    borderLight: '#E2E8F0',
    borderDark: 'rgba(148, 163, 184, 0.3)',
  },
};

export const generateThemeTokens = (
  mode: ThemeMode,
  accent: AccentColor,
  customizations?: {
    bubbleStyle?: BubbleStyle;
    customBubbleOutgoing?: string;
    customBubbleIncoming?: string;
  }
): ThemeTokens => {
  const pal = ACCENT_PALETTES[accent] || ACCENT_PALETTES.blue;
  const isDark = mode === 'dark' || mode === 'midnight' || mode === 'tiktok';
  const bubbleStyle = customizations?.bubbleStyle || (mode === 'tiktok' ? 'tiktok' : 'telegram');

  const accentColor = pal.hex;
  const accentSoft = isDark ? pal.softDark : pal.softLight;
  const accentBorder = isDark ? pal.borderDark : pal.borderLight;

  let baseTokens: ThemeTokens;

  if (mode === 'tiktok') {
    // TikTok Sleek Dark (#121212 / #161823) with Neon Contrast
    const effectiveAccent = accent === 'blue' ? '#FE2C55' : accentColor;
    baseTokens = {
      mode,
      accent,
      bubbleStyle,
      windowBg: '#121212',
      surfaceBg: '#161823',
      surfaceMuted: '#222436',
      surfaceHover: '#2A2D42',
      surfaceActive: '#333752',
      borderSubtle: '#2F3142',
      borderStrong: '#444760',
      textPrimary: '#FFFFFF',
      textSecondary: '#A6A7AB',
      textMuted: '#73747B',
      textInverse: '#121212',
      accentColor: effectiveAccent,
      accentSoft: accent === 'blue' ? 'rgba(254, 44, 85, 0.18)' : accentSoft,
      accentBorder: accent === 'blue' ? 'rgba(254, 44, 85, 0.35)' : accentBorder,
      accentFg: '#FFFFFF',
      bubbleIncoming: '#222436',
      bubbleIncomingText: '#FFFFFF',
      bubbleIncomingBorder: '#2F3142',
      bubbleOutgoing: effectiveAccent,
      bubbleOutgoingText: '#FFFFFF',
      bubbleOutgoingBorder: effectiveAccent,
      success: '#25F4EE',
      successSoft: '#00F2FE22',
      danger: '#FE2C55',
      dangerSoft: '#FE2C5522',
      warning: '#F59E0B',
      warningSoft: '#78350F33',
    };
  } else if (mode === 'midnight') {
    // Pure OLED Jet Black
    baseTokens = {
      mode,
      accent,
      bubbleStyle,
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
  } else if (mode === 'dark') {
    // Deep Slate Navy (Telegram Night)
    baseTokens = {
      mode,
      accent,
      bubbleStyle,
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
  } else if (mode === 'warm') {
    // Soft Tinted Ivory / Matcha Cream
    baseTokens = {
      mode,
      accent,
      bubbleStyle,
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
  } else {
    // Default: Classic Crisp Light (Nordic)
    baseTokens = {
      mode: 'light',
      accent,
      bubbleStyle,
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
  }

  // Apply custom bubble overrides if user specified custom colors
  if (customizations?.customBubbleOutgoing) {
    baseTokens.bubbleOutgoing = customizations.customBubbleOutgoing;
    baseTokens.bubbleOutgoingBorder = customizations.customBubbleOutgoing;
  }
  if (customizations?.customBubbleIncoming) {
    baseTokens.bubbleIncoming = customizations.customBubbleIncoming;
    baseTokens.bubbleIncomingBorder = customizations.customBubbleIncoming;
  }

  return baseTokens;
};
