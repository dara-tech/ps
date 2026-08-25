import React from 'react';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { DesktopNavModule } from '../../store/useDesktopStore';

export type MultiColorIconName =
  | DesktopNavModule
  | 'github'
  | 'context'
  | 'security'
  | 'ai'
  | 'general'
  | 'language'
  | 'notifications'
  | 'cat-all'
  | 'cat-laptop'
  | 'cat-phone'
  | 'cat-car'
  | 'cat-gear'
  | 'cat-desk'
  | 'cat-camera';

export interface MultiColorSidebarIconProps {
  name: MultiColorIconName;
  isActive?: boolean;
  size?: number;
}

export const MultiColorSidebarIcon: React.FC<MultiColorSidebarIconProps> = ({
  name,
  isActive = true,
  size = 20,
}) => {
  const inactiveColor = '#64748B';
  const inactiveLight = '#94A3B8';

  switch (name) {
    case 'copilot':
    case 'ai':
      if (!isActive) {
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z"
              fill={inactiveColor}
            />
            <Circle cx="19" cy="5" r="2" fill={inactiveLight} />
          </Svg>
        );
      }
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="copilotGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#818CF8" />
              <Stop offset="50%" stopColor="#6366F1" />
              <Stop offset="100%" stopColor="#06B6D4" />
            </LinearGradient>
            <LinearGradient id="copilotSmall" x1="17" y1="3" x2="21" y2="7" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#F472B6" />
              <Stop offset="100%" stopColor="#C084FC" />
            </LinearGradient>
          </Defs>
          <Path
            d="M12 2L14.4 8.6L21 11L14.4 13.4L12 20L9.6 13.4L3 11L9.6 8.6L12 2Z"
            fill="url(#copilotGrad)"
          />
          <Circle cx="19" cy="5" r="2.2" fill="url(#copilotSmall)" />
        </Svg>
      );

    case 'planner':
      if (!isActive) {
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="4" y="3" width="16" height="18" rx="3" fill={inactiveLight} />
            <Rect x="8" y="2" width="8" height="3" rx="1.5" fill={inactiveColor} />
            <Path d="M7.5 10L9.5 12L13.5 8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <Rect x="8" y="14" width="8" height="1.5" rx="0.75" fill="#FFFFFF" />
          </Svg>
        );
      }
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="plannerGrad" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#3B82F6" />
              <Stop offset="100%" stopColor="#1D4ED8" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="3" width="16" height="18" rx="3" fill="url(#plannerGrad)" />
          <Rect x="8" y="2" width="8" height="3" rx="1.5" fill="#1E293B" />
          <Path d="M7.5 10L9.5 12L13.5 8" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <Rect x="8" y="14" width="8" height="1.5" rx="0.75" fill="#E2E8F0" />
        </Svg>
      );

    case 'calendar':
      if (!isActive) {
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="4" width="18" height="17" rx="3" fill="#FFFFFF" stroke={inactiveLight} strokeWidth="1.5" />
            <Path d="M3 8.5H21V6C21 4.89543 20.1046 4 19 4H5C3.89543 4 3 4.89543 3 6V8.5Z" fill={inactiveColor} />
            <Circle cx="8" cy="13" r="1.2" fill={inactiveColor} />
            <Circle cx="12" cy="13" r="1.2" fill={inactiveColor} />
            <Circle cx="16" cy="13" r="1.2" fill={inactiveColor} />
          </Svg>
        );
      }
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="calHeader" x1="3" y1="4" x2="21" y2="9" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#EF4444" />
              <Stop offset="100%" stopColor="#DC2626" />
            </LinearGradient>
          </Defs>
          <Rect x="3" y="4" width="18" height="17" rx="3.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <Path d="M3 8.5H21V6.5C21 5.11929 19.8807 4 18.5 4H5.5C4.11929 4 3 5.11929 3 6.5V8.5Z" fill="url(#calHeader)" />
          <Circle cx="7.5" cy="12.5" r="1.3" fill="#3B82F6" />
          <Circle cx="12" cy="12.5" r="1.3" fill="#1E293B" />
          <Circle cx="16.5" cy="12.5" r="1.3" fill="#10B981" />
          <Circle cx="7.5" cy="16.5" r="1.3" fill="#1E293B" />
          <Circle cx="12" cy="16.5" r="1.3" fill="#EF4444" />
          <Circle cx="16.5" cy="16.5" r="1.3" fill="#F59E0B" />
        </Svg>
      );

    case 'goals':
      if (!isActive) {
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 6C3 4.89543 3.89543 4 5 4H9.58579C10.1162 4 10.625 4.21071 11 4.58579L12.4142 6H19C20.1046 6 21 6.89543 21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6Z"
              fill={inactiveLight}
            />
            <Path d="M12 11L14 13L18 9" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );
      }
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="goalGrad" x1="3" y1="4" x2="21" y2="20" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#EA580C" />
            </LinearGradient>
          </Defs>
          <Path
            d="M3 6C3 4.89543 3.89543 4 5 4H9.58579C10.1162 4 10.625 4.21071 11 4.58579L12.4142 6H19C20.1046 6 21 6.89543 21 8V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6Z"
            fill="url(#goalGrad)"
          />
          <Circle cx="12" cy="13" r="3.5" fill="#FFFFFF" fillOpacity={0.25} />
          <Circle cx="12" cy="13" r="1.8" fill="#FFFFFF" />
        </Svg>
      );

    case 'finances':
      if (!isActive) {
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="3" y="5" width="18" height="14" rx="3" fill={inactiveLight} />
            <Rect x="3" y="8" width="18" height="3" fill={inactiveColor} />
            <Circle cx="8" cy="15" r="1.5" fill="#FFFFFF" />
          </Svg>
        );
      }
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="finCard" x1="3" y1="5" x2="21" y2="19" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#10B981" />
              <Stop offset="100%" stopColor="#047857" />
            </LinearGradient>
            <LinearGradient id="finCoin" x1="6" y1="13" x2="10" y2="17" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#FDE047" />
              <Stop offset="100%" stopColor="#EAB308" />
            </LinearGradient>
          </Defs>
          <Rect x="3" y="5" width="18" height="14" rx="3" fill="url(#finCard)" />
          <Rect x="3" y="8.5" width="18" height="3" fill="#064E3B" />
          <Circle cx="7.5" cy="15" r="1.8" fill="url(#finCoin)" />
          <Rect x="12" y="14.2" width="6" height="1.6" rx="0.8" fill="#A7F3D0" />
        </Svg>
      );

    case 'dashboard':
      if (!isActive) {
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Rect x="4" y="12" width="4" height="8" rx="1" fill={inactiveLight} />
            <Rect x="10" y="7" width="4" height="13" rx="1" fill={inactiveColor} />
            <Rect x="16" y="4" width="4" height="16" rx="1" fill={inactiveLight} />
          </Svg>
        );
      }
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="bar1" x1="4" y1="12" x2="8" y2="20" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#818CF8" />
              <Stop offset="100%" stopColor="#4F46E5" />
            </LinearGradient>
            <LinearGradient id="bar2" x1="10" y1="7" x2="14" y2="20" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#38BDF8" />
              <Stop offset="100%" stopColor="#0284C7" />
            </LinearGradient>
            <LinearGradient id="bar3" x1="16" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#34D399" />
              <Stop offset="100%" stopColor="#059669" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="12" width="4" height="8" rx="1.5" fill="url(#bar1)" />
          <Rect x="10" y="7" width="4" height="13" rx="1.5" fill="url(#bar2)" />
          <Rect x="16" y="4" width="4" height="16" rx="1.5" fill="url(#bar3)" />
        </Svg>
      );

    case 'chat':
      if (!isActive) {
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 4C7.58172 4 4 7.13401 4 11C4 12.8309 4.81987 14.498 6.18244 15.7323C6.01257 16.6341 5.48512 17.6593 4.54228 18.4237C4.37025 18.5632 4.41724 18.8475 4.63434 18.8876C6.18844 19.1747 7.70295 18.7753 8.78441 18.0687C9.79093 18.4674 10.8711 18.6875 12 18.6875C16.4183 18.6875 20 15.5535 20 11.6875C20 7.82151 16.4183 4 12 4Z"
              fill={inactiveColor}
            />
          </Svg>
        );
      }
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="chatBlueGrad" x1="4" y1="4" x2="18" y2="18" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#3B82F6" />
              <Stop offset="100%" stopColor="#1D4ED8" />
            </LinearGradient>
            <LinearGradient id="chatTealGrad" x1="10" y1="9" x2="22" y2="21" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#2DD4BF" />
              <Stop offset="100%" stopColor="#06B6D4" />
            </LinearGradient>
          </Defs>
          <Path
            d="M11.5 4C6.8 4 3 7.35 3 11.5C3 13.5 3.88 15.3 5.35 16.6C5.17 17.58 4.6 18.7 3.58 19.53C3.4 19.68 3.45 19.99 3.68 20.03C5.35 20.34 6.98 19.91 8.14 19.14C9.18 19.57 10.31 19.8 11.5 19.8C16.2 19.8 20 16.45 20 12.3C20 7.74 16.2 4 11.5 4Z"
            fill="url(#chatBlueGrad)"
          />
          <Path
            d="M16 11.5C16 9.5 14.5 7.8 12.5 7.8C10.5 7.8 9 9.5 9 11.5C9 12.6 9.5 13.6 10.3 14.3C10.2 14.8 9.9 15.4 9.3 15.9C9.2 16 9.2 16.2 9.4 16.2C10.3 16.4 11.2 16.2 11.8 15.7C12 15.8 12.2 15.8 12.5 15.8C14.5 15.8 16 14.2 16 12.2V11.5Z"
            fill="url(#chatTealGrad)"
          />
        </Svg>
      );

    case 'settings':
      if (!isActive) {
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
              fill={inactiveColor}
            />
            <Path
              d="M9.5 2H14.5L15.3 4.8C15.9 5.1 16.5 5.5 17 5.9L19.7 4.9L22.2 9.2L19.9 11.2C20 11.6 20 12.4 19.9 12.8L22.2 14.8L19.7 19.1L17 18.1C16.5 18.5 15.9 18.9 15.3 19.2L14.5 22H9.5L8.7 19.2C8.1 18.9 7.5 18.5 7 18.1L4.3 19.1L1.8 14.8L4.1 12.8C4 12.4 4 11.6 4.1 11.2L1.8 9.2L4.3 4.9L7 5.9C7.5 5.5 8.1 5.1 8.7 4.8L9.5 2Z"
              fill={inactiveLight}
            />
          </Svg>
        );
      }
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="gearGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#3B82F6" />
              <Stop offset="100%" stopColor="#1E293B" />
            </LinearGradient>
          </Defs>
          <Path
            d="M9.5 2H14.5L15.3 4.8C15.9 5.1 16.5 5.5 17 5.9L19.7 4.9L22.2 9.2L19.9 11.2C20 11.6 20 12.4 19.9 12.8L22.2 14.8L19.7 19.1L17 18.1C16.5 18.5 15.9 18.9 15.3 19.2L14.5 22H9.5L8.7 19.2C8.1 18.9 7.5 18.5 7 18.1L4.3 19.1L1.8 14.8L4.1 12.8C4 12.4 4 11.6 4.1 11.2L1.8 9.2L4.3 4.9L7 5.9C7.5 5.5 8.1 5.1 8.7 4.8L9.5 2Z"
            fill="url(#gearGrad)"
          />
          <Circle cx="12" cy="12" r="3.5" fill="#FFFFFF" />
        </Svg>
      );

    // ==========================================
    // SETTINGS CATEGORIES MULTI-COLOR ICONS
    // ==========================================
    case 'github':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="ghMarkGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#334155" />
              <Stop offset="100%" stopColor="#0F172A" />
            </LinearGradient>
          </Defs>
          <Circle cx="12" cy="12" r="10" fill="url(#ghMarkGrad)" />
          <Path
            d="M12 6.5C8.96 6.5 6.5 8.96 6.5 12C6.5 14.43 8.08 16.49 10.27 17.22C10.55 17.27 10.65 17.1 10.65 16.95C10.65 16.82 10.64 16.37 10.64 15.82C9.28 16.12 8.99 15.22 8.99 15.22C8.77 14.66 8.45 14.51 8.45 14.51C8.01 14.21 8.48 14.22 8.48 14.22C8.97 14.25 9.22 14.72 9.22 14.72C9.65 15.46 10.36 15.24 10.64 15.12C10.68 14.81 10.81 14.59 10.95 14.47C9.86 14.34 8.72 13.92 8.72 12.04C8.72 11.51 8.91 11.07 9.22 10.73C9.17 10.6 9 10.09 9.27 9.42C9.27 9.42 9.68 9.29 10.63 9.93C11.02 9.82 11.44 9.77 11.85 9.77C12.26 9.77 12.68 9.82 13.07 9.93C14.02 9.29 14.43 9.42 14.43 9.42C14.7 10.09 14.53 10.6 14.48 10.73C14.79 11.07 14.98 11.51 14.98 12.04C14.98 13.93 13.84 14.34 12.75 14.46C12.93 14.62 13.09 14.93 13.09 15.41C13.09 16.1 13.08 16.66 13.08 16.95C13.08 17.1 13.18 17.28 13.46 17.22C15.65 16.49 17.23 14.43 17.23 12C17.23 8.96 14.77 6.5 11.73 6.5H12Z"
            fill="#FFFFFF"
          />
          {/* Vibrant Green Commit Node badge */}
          <Circle cx="17.5" cy="17.5" r="3.2" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.2" />
        </Svg>
      );

    case 'security':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="secGrad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#EF4444" />
              <Stop offset="100%" stopColor="#B91C1C" />
            </LinearGradient>
            <LinearGradient id="secCrest" x1="7" y1="6" x2="17" y2="18" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#FEF2F2" />
              <Stop offset="100%" stopColor="#FEE2E2" />
            </LinearGradient>
          </Defs>
          {/* Shield Outer */}
          <Path
            d="M12 2L4 5V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V5L12 2Z"
            fill="url(#secGrad)"
          />
          {/* Inner Crest */}
          <Path
            d="M12 4.5L6 6.8V11C6 15.2 8.9 19.2 12 20.3C15.1 19.2 18 15.2 18 11V6.8L12 4.5Z"
            fill="url(#secCrest)"
            fillOpacity={0.25}
          />
          {/* Fingerprint / Checkmark Lines */}
          <Path
            d="M9 11.5L11 13.5L15.5 9"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Touch ID biometric arc */}
          <Path
            d="M8.5 16C9.5 17 10.7 17.5 12 17.5C13.3 17.5 14.5 17 15.5 16"
            stroke="#FEF08A"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'general':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="appTile1" x1="3" y1="3" x2="10" y2="10" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#6366F1" />
              <Stop offset="100%" stopColor="#4338CA" />
            </LinearGradient>
            <LinearGradient id="appTile2" x1="14" y1="3" x2="21" y2="10" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#06B6D4" />
              <Stop offset="100%" stopColor="#0E7490" />
            </LinearGradient>
            <LinearGradient id="appTile3" x1="3" y1="14" x2="10" y2="21" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#10B981" />
              <Stop offset="100%" stopColor="#047857" />
            </LinearGradient>
            <LinearGradient id="appTile4" x1="14" y1="14" x2="21" y2="21" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#D97706" />
            </LinearGradient>
          </Defs>
          {/* 4 App Grid Quadrants */}
          <Rect x="3.5" y="3.5" width="7" height="7" rx="2" fill="url(#appTile1)" />
          <Rect x="13.5" y="3.5" width="7" height="7" rx="2" fill="url(#appTile2)" />
          <Rect x="3.5" y="13.5" width="7" height="7" rx="2" fill="url(#appTile3)" />
          <Rect x="13.5" y="13.5" width="7" height="7" rx="2" fill="url(#appTile4)" />
        </Svg>
      );

    case 'language':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="globeOcean" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#38BDF8" />
              <Stop offset="100%" stopColor="#0284C7" />
            </LinearGradient>
          </Defs>
          {/* Globe Ocean Body */}
          <Circle cx="12" cy="12" r="9.5" fill="url(#globeOcean)" />
          {/* Land / Continents */}
          <Path
            d="M7 8C8.5 7.5 10 9 11 8C12 7 13.5 6 15 7C16.5 8 16 10 17.5 11C19 12 20 11.5 21 12C20.5 15.5 18 18.5 14.5 20C13 18.5 13.5 16 12 15.5C10.5 15 9.5 16.5 8 16C6.5 15.5 5 14 4.5 12C4 9.5 5.5 8.5 7 8Z"
            fill="#10B981"
          />
          {/* Golden Latitude / Orbit Line */}
          <Path
            d="M3 12C3 12 7.5 8 12 8C16.5 8 21 12 21 12"
            stroke="#FDE047"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <Path
            d="M3 12C3 12 7.5 16 12 16C16.5 16 21 12 21 12"
            stroke="#FFFFFF"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeOpacity={0.8}
          />
        </Svg>
      );

    case 'notifications':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="bellGrad" x1="4" y1="3" x2="20" y2="20" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#FBBF24" />
              <Stop offset="100%" stopColor="#EA580C" />
            </LinearGradient>
          </Defs>
          {/* Bell Body */}
          <Path
            d="M12 3C10.34 3 9 4.34 9 6V6.29C6.72 7.37 5.12 9.7 5.12 12.4V16.5L3.5 18.12C3.19 18.43 3.41 18.96 3.85 18.96H20.15C20.59 18.96 20.81 18.43 20.5 18.12L18.88 16.5V12.4C18.88 9.7 17.28 7.37 15 6.29V6C15 4.34 13.66 3 12 3Z"
            fill="url(#bellGrad)"
          />
          {/* Clapper */}
          <Path
            d="M10 19.5C10 20.6 10.9 21.5 12 21.5C13.1 21.5 14 20.6 14 19.5"
            stroke="#9A3412"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Alert Notification Red Dot */}
          <Circle cx="17.5" cy="6.5" r="3.2" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.2" />
        </Svg>
      );

    case 'context':
      if (!isActive) {
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 4C10.5 2.8 8.5 2.5 6.8 3.3C4.8 4.2 3.8 6.4 4.1 8.6C3 9.8 2.8 11.7 3.5 13.2C4.1 14.5 5.3 15.3 6.7 15.4C7 17.5 8.6 19.3 10.7 19.8C11.1 19.9 11.6 20 12 20M12 4C13.5 2.8 15.5 2.5 17.2 3.3C19.2 4.2 20.2 6.4 19.9 8.6C21 9.8 21.2 11.7 20.5 13.2C19.9 14.5 18.7 15.3 17.3 15.4C17 17.5 15.4 19.3 13.3 19.8C12.9 19.9 12.4 20 12 20M12 4V20"
              stroke={inactiveColor}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      }
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="brainLeft" x1="3" y1="2" x2="12" y2="20" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#818CF8" />
              <Stop offset="100%" stopColor="#4F46E5" />
            </LinearGradient>
            <LinearGradient id="brainRight" x1="12" y1="2" x2="21" y2="20" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#A855F7" />
              <Stop offset="100%" stopColor="#7C3AED" />
            </LinearGradient>
          </Defs>
          {/* Left Hemisphere Lobe */}
          <Path
            d="M11 4.5C9.6 3.4 7.8 3.2 6.3 3.9C4.4 4.8 3.5 6.8 3.8 8.9C2.8 10 2.6 11.8 3.3 13.2C3.8 14.4 4.9 15.1 6.2 15.2C6.5 17.1 8 18.8 9.9 19.2C10.3 19.3 10.6 19.4 11 19.4V4.5Z"
            fill="url(#brainLeft)"
          />
          {/* Right Hemisphere Lobe */}
          <Path
            d="M13 4.5C14.4 3.4 16.2 3.2 17.7 3.9C19.6 4.8 20.5 6.8 20.2 8.9C21.2 10 21.4 11.8 20.7 13.2C20.2 14.4 19.1 15.1 17.8 15.2C17.5 17.1 16 18.8 14.1 19.2C13.7 19.3 13.4 19.4 13 19.4V4.5Z"
            fill="url(#brainRight)"
          />
          {/* Central Synaptic Bridge & Neural Dots */}
          <Path d="M8 9H16M7 13H17M9 16H15" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity={0.7} />
          <Circle cx="12" cy="9" r="1.8" fill="#38BDF8" />
          <Circle cx="12" cy="13" r="1.8" fill="#FDE047" />
          <Circle cx="12" cy="16" r="1.5" fill="#34D399" />
        </Svg>
      );

    case 'market':
      if (!isActive) {
        return (
          <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
              d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z"
              stroke={inactiveColor}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      }
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="marketBagGrad" x1="4" y1="9" x2="20" y2="21" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#10B981" />
              <Stop offset="100%" stopColor="#059669" />
            </LinearGradient>
            <LinearGradient id="marketHandleGrad" x1="8" y1="3" x2="16" y2="11" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#34D399" />
              <Stop offset="100%" stopColor="#10B981" />
            </LinearGradient>
          </Defs>
          <Path
            d="M8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V9H8V7Z"
            stroke="url(#marketHandleGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <Path
            d="M5 9H19L20.2 21H3.8L5 9Z"
            fill="url(#marketBagGrad)"
          />
          <Circle cx="12" cy="14" r="2" fill="#FFFFFF" fillOpacity={0.9} />
          <Path d="M12 12V16M10 14H14" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" />
        </Svg>
      );

    // ==========================================
    // MARKET RADAR MULTI-COLOR CATEGORY ICONS
    // ==========================================
    case 'cat-all':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="allTile1" x1="3" y1="3" x2="10" y2="10" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#38BDF8" />
              <Stop offset="100%" stopColor="#0284C7" />
            </LinearGradient>
            <LinearGradient id="allTile2" x1="14" y1="3" x2="21" y2="10" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#818CF8" />
              <Stop offset="100%" stopColor="#4F46E5" />
            </LinearGradient>
            <LinearGradient id="allTile3" x1="3" y1="14" x2="10" y2="21" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#34D399" />
              <Stop offset="100%" stopColor="#059669" />
            </LinearGradient>
            <LinearGradient id="allTile4" x1="14" y1="14" x2="21" y2="21" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#FBBF24" />
              <Stop offset="100%" stopColor="#D97706" />
            </LinearGradient>
          </Defs>
          <Rect x="3.5" y="3.5" width="7" height="7" rx="2" fill="url(#allTile1)" />
          <Rect x="13.5" y="3.5" width="7" height="7" rx="2" fill="url(#allTile2)" />
          <Rect x="3.5" y="13.5" width="7" height="7" rx="2" fill="url(#allTile3)" />
          <Rect x="13.5" y="13.5" width="7" height="7" rx="2" fill="url(#allTile4)" />
        </Svg>
      );

    case 'cat-laptop':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="lapScreen" x1="4" y1="4" x2="20" y2="15" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#6366F1" />
              <Stop offset="100%" stopColor="#3B82F6" />
            </LinearGradient>
            <LinearGradient id="lapBase" x1="2" y1="16" x2="22" y2="20" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#94A3B8" />
              <Stop offset="100%" stopColor="#475569" />
            </LinearGradient>
          </Defs>
          <Rect x="4" y="4" width="16" height="11" rx="2" fill="url(#lapScreen)" stroke="#334155" strokeWidth="1" />
          <Rect x="6" y="6" width="12" height="7" rx="1" fill="#0F172A" />
          <Path d="M8 8.5L10 10.5L14 7" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M2 17C2 15.8954 2.89543 15 4 15H20C21.1046 15 22 15.8954 22 17V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V17Z" fill="url(#lapBase)" />
          <Rect x="10" y="15.5" width="4" height="1.2" rx="0.6" fill="#CBD5E1" />
        </Svg>
      );

    case 'cat-phone':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="phoneScreen" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#10B981" />
              <Stop offset="50%" stopColor="#059669" />
              <Stop offset="100%" stopColor="#065F46" />
            </LinearGradient>
          </Defs>
          <Rect x="6" y="2" width="12" height="20" rx="3.5" fill="url(#phoneScreen)" stroke="#064E3B" strokeWidth="1" />
          <Rect x="7.5" y="4" width="9" height="16" rx="2" fill="#022C22" />
          {/* Dynamic Island */}
          <Rect x="10" y="5" width="4" height="1.4" rx="0.7" fill="#000000" />
          <Circle cx="12" cy="18.5" r="0.9" fill="#10B981" />
        </Svg>
      );

    case 'cat-car':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="carBody" x1="3" y1="8" x2="21" y2="18" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#EA580C" />
            </LinearGradient>
            <LinearGradient id="carGlass" x1="6" y1="8" x2="18" y2="13" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#FEF3C7" />
              <Stop offset="100%" stopColor="#FDE68A" />
            </LinearGradient>
          </Defs>
          {/* Aerodynamic Sport Chassis */}
          <Path d="M4 14L6 9C6.5 7.5 7.8 7 9.5 7H14.5C16.2 7 17.5 7.5 18 9L20 14V17C20 17.55 19.55 18 19 18H18C17.45 18 17 17.55 17 17V16H7V17C7 17.55 6.55 18 6 18H5C4.45 18 4 17.55 4 17V14Z" fill="url(#carBody)" />
          {/* Windshield */}
          <Path d="M7 13L8.5 9H15.5L17 13H7Z" fill="url(#carGlass)" />
          {/* Headlights */}
          <Circle cx="6.5" cy="14.5" r="1.2" fill="#FEF08A" />
          <Circle cx="17.5" cy="14.5" r="1.2" fill="#FEF08A" />
        </Svg>
      );

    case 'cat-gear':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="monitorGrad" x1="3" y1="3" x2="21" y2="16" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#A855F7" />
              <Stop offset="100%" stopColor="#6B21A8" />
            </LinearGradient>
          </Defs>
          <Rect x="3" y="3" width="18" height="13" rx="2.5" fill="url(#monitorGrad)" stroke="#581C87" strokeWidth="1" />
          <Rect x="4.5" y="4.5" width="15" height="10" rx="1.5" fill="#1E1B4B" />
          <Circle cx="12" cy="9.5" r="2" fill="#C084FC" />
          {/* Stand */}
          <Path d="M10 16H14L15 20H9L10 16Z" fill="#94A3B8" />
          <Rect x="8" y="20" width="8" height="1.5" rx="0.75" fill="#64748B" />
        </Svg>
      );

    case 'cat-desk':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="deskWood" x1="3" y1="8" x2="21" y2="12" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#F472B6" />
              <Stop offset="100%" stopColor="#DB2777" />
            </LinearGradient>
          </Defs>
          {/* Desktop Tabletop */}
          <Rect x="3" y="9" width="18" height="3" rx="1.2" fill="url(#deskWood)" />
          {/* Left / Right Standing Desk Legs */}
          <Rect x="5" y="12" width="2" height="9" rx="1" fill="#475569" />
          <Rect x="17" y="12" width="2" height="9" rx="1" fill="#475569" />
          <Rect x="3.5" y="20" width="5" height="1.5" rx="0.75" fill="#334155" />
          <Rect x="15.5" y="20" width="5" height="1.5" rx="0.75" fill="#334155" />
          {/* Desk Lamp & Laptop on top */}
          <Rect x="10" y="5" width="4" height="3" rx="0.5" fill="#F472B6" />
          <Path d="M7 6L9 9H5L7 6Z" fill="#FDE047" />
        </Svg>
      );

    case 'cat-camera':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Defs>
            <LinearGradient id="camBody" x1="3" y1="6" x2="21" y2="20" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#06B6D4" />
              <Stop offset="100%" stopColor="#0E7490" />
            </LinearGradient>
            <LinearGradient id="lensGlass" x1="9" y1="10" x2="15" y2="16" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#67E8F9" />
              <Stop offset="100%" stopColor="#0891B2" />
            </LinearGradient>
          </Defs>
          <Path d="M9 5L10.5 3.5H13.5L15 5H19C20.1046 5 21 5.89543 21 7V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V7C3 5.89543 3.89543 5 5 5H9Z" fill="url(#camBody)" />
          {/* Lens Outer Ring */}
          <Circle cx="12" cy="12.5" r="4.5" fill="#083344" />
          {/* Lens Glass Reflection */}
          <Circle cx="12" cy="12.5" r="3" fill="url(#lensGlass)" />
          <Circle cx="13" cy="11.5" r="0.9" fill="#FFFFFF" />
          {/* Red Sensor / Flash Dot */}
          <Circle cx="18" cy="8" r="1" fill="#EF4444" />
        </Svg>
      );

    default:
      return null;
  }
};
