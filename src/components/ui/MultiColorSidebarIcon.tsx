import React from 'react';
import Svg, { Path, Rect, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { DesktopNavModule } from '../../store/useDesktopStore';

export interface MultiColorSidebarIconProps {
  name: DesktopNavModule;
  isActive: boolean;
  size?: number;
}

export const MultiColorSidebarIcon: React.FC<MultiColorSidebarIconProps> = ({
  name,
  isActive,
  size = 20,
}) => {
  const inactiveColor = '#64748B';
  const inactiveLight = '#94A3B8';

  switch (name) {
    case 'copilot':
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
          {/* Card Body */}
          <Rect x="3" y="4" width="18" height="17" rx="3.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Red Top Bar */}
          <Path d="M3 8.5H21V6.5C21 5.11929 19.8807 4 18.5 4H5.5C4.11929 4 3 5.11929 3 6.5V8.5Z" fill="url(#calHeader)" />
          {/* Date Dots Grid */}
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
            {/* Back Bubble */}
            <Path
              d="M12 4C7.58172 4 4 7.13401 4 11C4 12.8309 4.81987 14.498 6.18244 15.7323C6.01257 16.6341 5.48512 17.6593 4.54228 18.4237C4.37025 18.5632 4.41724 18.8475 4.63434 18.8876C6.18844 19.1747 7.70295 18.7753 8.78441 18.0687C9.79093 18.4674 10.8711 18.6875 12 18.6875C16.4183 18.6875 20 15.5535 20 11.6875C20 7.82151 16.4183 4 12 4Z"
              fill={inactiveColor}
            />
          </Svg>
        );
      }
      // Exact Messenger-style Multi-Color Dual Bubbles (Blue + Teal Gradient)
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
          {/* Main Blue Bubble */}
          <Path
            d="M11.5 4C6.8 4 3 7.35 3 11.5C3 13.5 3.88 15.3 5.35 16.6C5.17 17.58 4.6 18.7 3.58 19.53C3.4 19.68 3.45 19.99 3.68 20.03C5.35 20.34 6.98 19.91 8.14 19.14C9.18 19.57 10.31 19.8 11.5 19.8C16.2 19.8 20 16.45 20 12.3C20 7.74 16.2 4 11.5 4Z"
            fill="url(#chatBlueGrad)"
          />
          {/* Front Teal/Cyan Accent Bubble */}
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

    default:
      return null;
  }
};
