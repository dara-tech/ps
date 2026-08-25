import React from 'react';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';

export type RemixIconName =
  | 'mail-line'
  | 'lock-line'
  | 'lock-unlock-line'
  | 'user-line'
  | 'user-3-line'
  | 'eye-line'
  | 'eye-off-line'
  | 'arrow-right-line'
  | 'arrow-left-line'
  | 'check-line'
  | 'checkbox-circle-fill'
  | 'close-line'
  | 'close-circle-fill'
  | 'error-warning-fill'
  | 'information-fill'
  | 'building-line'
  | 'shield-check-line'
  | 'briefcase-line'
  | 'sparkles-fill'
  | 'google-official'
  | 'telegram-official'
  | 'chat-3-line'
  | 'task-line'
  | 'folder-line'
  | 'team-line'
  | 'bar-chart-box-line'
  | 'bank-card-line'
  | 'settings-3-line'
  | 'search-line'
  | 'bell-line'
  | 'send-plane-fill'
  | 'add-line'
  | 'time-line'
  | 'calendar-line'
  | 'filter-3-line'
  | 'more-2-fill'
  | 'chevron-down-line'
  | 'phone-line'
  | 'vidicon-line'
  | 'file-text-line'
  | 'link-line'
  | 'image-line'
  | 'download-line'
  | 'notification-off-line'
  | 'sidebar-collapse-line'
  | 'sidebar-expand-line'
  | 'grid-line'
  | 'list-check-line'
  | 'chevron-left-line'
  | 'chevron-right-line'
  | 'logout-box-r-line'
  | 'lock-fill'
  | 'refresh-line'
  | 'lightbulb-line'
  | 'emotion-line'
  | 'attachment-line'
  | 'mic-line'
  | 'code-line'
  | 'delete-bin-line'
  | 'file-copy-line'
  | 'fingerprint-line'
  | 'github-fill'
  | 'git-branch-line'
  | 'quantum-brand';

interface RemixIconProps {
  name: RemixIconName;
  size?: number;
  color?: string;
}

export const RemixIcon: React.FC<RemixIconProps> = ({
  name,
  size = 18,
  color = '#475569',
}) => {
  // Official Multi-Colored Google G Icon
  if (name === 'google-official') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
        />
        <Path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
        />
        <Path
          fill="#FBBC05"
          d="M5.28 14.27a7.2 7.2 0 0 1 0-4.54V6.58H1.25a11.96 11.96 0 0 0 0 10.84l4.03-3.15z"
        />
        <Path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15C6.23 6.85 8.88 4.75 12 4.75z"
        />
      </Svg>
    );
  }

  // Official Full Edge-to-Edge Telegram Vector Icon
  if (name === 'telegram-official') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          fill="#24A1DE"
          d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z"
        />
      </Svg>
    );
  }

  // 1. Modern Linear Phone Handset
  if (name === 'phone-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // 2. Modern Linear Video Camera
  if (name === 'vidicon-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="5" width="14" height="14" rx="3" stroke={color} strokeWidth="1.8" />
        <Path
          d="M22 8l-6 4 6 4V8z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // 3. Modern Triple Dot More / Info Icon
  if (name === 'more-2-fill') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="5" r="1.8" fill={color} />
        <Circle cx="12" cy="12" r="1.8" fill={color} />
        <Circle cx="12" cy="19" r="1.8" fill={color} />
      </Svg>
    );
  }

  // 4. Modern Aerodynamic Send Plane
  if (name === 'send-plane-fill') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // 5. Modern Search Magnifier
  if (name === 'search-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8" />
        <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    );
  }

  // 6. Modern Chat Bubble with Smooth Tail
  if (name === 'chat-3-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // 7. Modern 3-Card Kanban Board
  if (name === 'task-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="3" width="5" height="18" rx="2" stroke={color} strokeWidth="1.8" />
        <Rect x="10" y="3" width="5" height="12" rx="2" stroke={color} strokeWidth="1.8" />
        <Rect x="17" y="3" width="5" height="15" rx="2" stroke={color} strokeWidth="1.8" />
      </Svg>
    );
  }

  // 8. Modern 3D Layered Projects / Roadmap
  if (name === 'folder-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // 9. Modern Duo-User Team Directory
  if (name === 'team-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.8" />
        <Path
          d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <Path
          d="M16 3.13a4 4 0 0 1 0 7.75M22 21v-2a4 4 0 0 0-3-3.87"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  // 10. Modern Tri-Bar Analytics
  if (name === 'bar-chart-box-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M18 20V10M12 20V4M6 20v-6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }

  // 11. Modern Bank Card / Payroll
  if (name === 'bank-card-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="2" y="5" width="20" height="14" rx="3" stroke={color} strokeWidth="1.8" />
        <Path d="M2 10h20" stroke={color} strokeWidth="1.8" />
      </Svg>
    );
  }

  // 12. Modern Precision Gear
  if (name === 'settings-3-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
        <Path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // 13. Minimalist Chevron Down
  if (name === 'chevron-down-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  // 14. Modern Bell (Notifications)
  if (name === 'bell-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M13.73 21a2 2 0 0 1-3.46 0"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // 15. Modern Bell Off (Mute Notifications)
  if (name === 'notification-off-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M8.66 8.66A6 6 0 0 0 6 8c0 7-3 9-3 9h14M10.27 4.19A6 6 0 0 1 18 8c0 1.93-.23 3.53-.66 4.88M13.73 21a2 2 0 0 1-3.46 0M2 2l20 20"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // 16. Modern Sidebar Collapse (Left Arrow in Box)
  if (name === 'sidebar-collapse-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="1.8" />
        <Path d="M9 3v18M15 9l-3 3 3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  // 17. Modern Sidebar Expand (Right Arrow in Box)
  if (name === 'sidebar-expand-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="1.8" />
        <Path d="M9 3v18M13 9l3 3-3 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  // 18. Modern Grid View (4 Squares)
  if (name === 'grid-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
        <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
        <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
        <Rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
      </Svg>
    );
  }

  // 19. Modern List / Table View (3 Horizontal Lines with bullets)
  if (name === 'list-check-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  // 20. Minimalist Chevron Left & Right
  if (name === 'chevron-left-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === 'chevron-right-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  // 21. Standard Remix Icon Paths
  const ICON_PATHS: Record<string, string> = {
    'mail-line': 'M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 4.238l-7.928 7.1L4 7.216V19h16V7.238zM4.511 5l7.55 6.662L19.502 5H4.511z',
    'lock-line': 'M19 10h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1V7a7 7 0 1 1 14 0v3zm-2 0V7A5 5 0 0 0 7 7v3h10zm2 2H5v8h14v-8zm-8 2h2v4h-2v-4z',
    'user-line': 'M4 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H4zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z',
    'close-line': 'M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z',
    'checkbox-circle-fill': 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z',
    'close-circle-fill': 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.414-10l-2.829 2.828 1.414 1.415L12 13.414l2.828 2.829 1.415-1.415L13.414 12l2.829-2.828-1.415-1.415L12 10.586 9.172 7.757 7.757 9.172 10.586 12z',
    'error-warning-fill': 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z',
    'information-fill': 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z',
    'shield-check-line': 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm7 10c0 4.52-2.98 8.69-7 9.93-4.02-1.24-7-5.41-7-9.93V6.3l7-3.11 7 3.11V11zm-8.5 3.5l-2.5-2.5 1.41-1.41 1.09 1.09 3.59-3.59 1.41 1.41-5 5z',
    'sparkles-fill': 'M12 1l2.4 5.6L20 9l-5.6 2.4L12 17l-2.4-5.6L4 9l5.6-2.4L12 1zm7 14l1.2 2.8L23 19l-2.8 1.2L19 23l-1.2-2.8L15 19l2.8-1.2L19 15zm-14 0l1.2 2.8L9 19l-2.8 1.2L5 23l-1.2-2.8L1 19l2.8-1.2L5 15z',
    'time-line': 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-8h4v2h-6V7h2v5z',
    'file-text-line': 'M21 8v12.993A1 1 0 0 1 20.007 22H3.993A.993.993 0 0 1 3 21.008V2.992C3 2.455 3.449 2 4.002 2h10.995L21 8zm-2 1h-5V4H5v16h14V9zM8 7h3v2H8V7zm0 4h8v2H8v-2zm0 4h8v2H8v-2z',
    'link-line': 'M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.07 7.07l.354-.353a5 5 0 0 0 0-7.07zm-2.12 7.78l-1.415-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9l-1.415-1.415a5 5 0 1 0-7.07-7.07l-.354.353a5 5 0 0 0 0 7.07z',
    'image-line': 'M21 2.992C21 2.444 20.555 2 20.008 2H3.992A.993.993 0 0 0 3 2.992v18.016c0 .548.445.992.992.992h16.016c.548 0 .992-.444.992-.992V2.992zM19 4v11.17l-4.707-4.707a1 1 0 0 0-1.414 0L6 17.34V4h13zM5 19v-.657l8.293-8.293 4.707 4.707V19H5zm4-11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z',
    'download-line': 'M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515l1.414-1.414L11 13.172V2h2v11.172z',
    'notification-off-line': 'M19.98 17.151l1.434 1.434-.707.707L2.414 1.002l.707-.707 4.143 4.143C7.545 4.167 8.683 4 10 4V2h4v2c2.761 0 5 2.239 5 5v5.586l.98 1.565zm-3.98.849H8.414l8-8V9c0-1.657-1.343-3-3-3s-3 1.343-3 3v.586l-2-2V9a5 5 0 0 1 9.9 1.151l.08.849zM10 20h4v2h-4v-2z',
    'logout-box-r-line': 'M5 22a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3h-2V4H6v16h12v-2h2v3a1 1 0 0 1-1 1H5zm13-6l5-4-5-4v3H9v2h9v3z',
    'lock-fill': 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
    'refresh-line': 'M5.463 4.433A9.961 9.961 0 0 1 12 2c5.523 0 10 4.477 10 10 0 2.136-.67 4.116-1.81 5.74L17 12h3a8 8 0 1 0-2.46 5.772l.997 1.795A9.965 9.965 0 0 1 12 22C6.477 22 2 17.523 2 12c0-2.136.67-4.116 1.81-5.74L7 12H4a8 8 0 0 1 1.463-7.567z',
    'lightbulb-line': 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z',
    'emotion-line': 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-3.5-9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z',
    'attachment-line': 'M14.828 7.757l-5.656 5.657a1 1 0 1 0 1.414 1.414l5.657-5.656A3 3 0 1 0 12 4.929l-5.657 5.657a5 5 0 1 0 7.071 7.07l6.364-6.363 1.414 1.414-6.364 6.364a7 7 0 1 1-9.899-9.899l5.657-5.657a5 5 0 1 1 7.07 7.071l-5.656 5.657a3 3 0 1 1-4.243-4.243l5.657-5.657 1.414 1.414z',
    'mic-line': 'M12 1a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4zm2 10a2 2 0 1 1-4 0V5a2 2 0 1 1 4 0v6zm5-2h2a9 9 0 0 1-8 8.945V20h3v2H8v-2h3v-2.055A9 9 0 0 1 3 9h2a7 7 0 1 0 14 0z',
    'code-line': 'M24 12l-5.657 5.657-1.414-1.414L21.172 12l-4.243-4.243 1.414-1.414L24 12zM2.828 12l4.243 4.243-1.414 1.414L0 12l5.657-5.657L7.07 7.757 2.828 12zm7.972 9l4.094-18h2.212l-4.094 18H10.8z',
    'delete-bin-line': 'M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z',
    'file-copy-line': 'M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z',
    'fingerprint-line': 'M17.81 4.87a9.98 9.98 0 0 0-11.62 0l1.18 1.62a8 8 0 0 1 9.26 0l1.18-1.62zm3.32 3.86a13.98 13.98 0 0 0-18.26 0l1.18 1.62a12 12 0 0 1 15.9 0l1.18-1.62zM12 9a6 6 0 0 0-6 6c0 1.65.67 3.15 1.76 4.24l1.41-1.41A4 4 0 0 1 8 15a4 4 0 0 1 8 0c0 .9-.3 1.73-.8 2.4l1.54 1.28A6 6 0 0 0 18 15a6 6 0 0 0-6-6zm0 4a2 2 0 0 0-2 2c0 .55.22 1.05.59 1.41l1.41-1.41A0 0 0 0 1 12 15a0 0 0 0 1 0 0 2 2 0 0 0 0-2z',
    'github-fill': 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z',
    'git-branch-line': 'M7.105 15.21A3.001 3.001 0 0 1 5 18a3 3 0 0 1-1.105-5.79A4.998 4.998 0 0 1 9 8.17V6.895a3.001 3.001 0 1 1 2 0v5.21a3.001 3.001 0 0 1 0 5.79A3.001 3.001 0 0 1 9 15a4.978 4.978 0 0 1-1.895.21zM5 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm5-11a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM9 13.732V11a3 3 0 0 0-3-3H5a1 1 0 0 0-1 1v1.732A3.002 3.002 0 0 1 7 14c.73 0 1.412-.262 1.947-.701l.053-.067z',
  };

  const path = ICON_PATHS[name] || ICON_PATHS['sparkles-fill'];

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={path} fill={color} />
    </Svg>
  );
};
