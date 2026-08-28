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
  | 'ghost-line'
  | 'ghost-fill'
  | 'spy-line'
  | 'spy-fill'
  | 'wifi-off-line'
  | 'edit-line'
  | 'shield-check-line'
  | 'movie-line'
  | 'arrow-right-line'
  | 'arrow-left-line'
  | 'arrow-down-line'
  | 'arrow-down-fill'
  | 'arrow-up-line'
  | 'check-line'
  | 'check-double-line'
  | 'play-fill'
  | 'pause-fill'
  | 'reply-line'
  | 'pencil-line'
  | 'pushpin-fill'
  | 'pushpin-line'
  | 'more-fill'
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
  | 'chat-3-fill'
  | 'chat-double-fill'
  | 'user-circle-fill'
  | 'phone-fill'
  | 'contacts-book-fill'
  | 'user-add-line'
  | 'user-add-fill'
  | 'user-3-fill'
  | 'settings-3-fill'
  | 'task-line'
  | 'folder-line'
  | 'team-line'
  | 'camera-fill'
  | 'camera-line'
  | 'image-add-line'
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
  | 'git-commit-line'
  | 'flag-line'
  | 'rocket-line'
  | 'apps-2-line'
  | 'cpu-line'
  | 'global-line'
  | 'translate-2'
  | 'volume-up-line'
  | 'file-excel-2-fill'
  | 'file-excel-2-line'
  | 'folder-open-line'
  | 'folder-add-line'
  | 'archive-line'
  | 'arrow-right-up-line'
  | 'external-link-line'
  | 'arrow-right-s-line'
  | 'menu-line'
  | 'menu-fold-line'
  | 'menu-unfold-line'
  | 'side-bar-line'
  | 'upload-cloud-2-line'
  | 'at-line'
  | 'palette-line'
  | 'sun-line'
  | 'moon-line'
  | 'contrast-drop-2-line'
  | 'cup-line'
  | 'share-forward-line'
  | 'share-forward-fill'
  | 'quantum-brand'
  | 'laptop-line'
  | 'macbook-line'
  | 'computer-line'
  | 'tv-line'
  | 'tv-2-line'
  | 'keyboard-line'
  | 'router-line'
  | 'car-line'
  | 'car-fill'
  | 'riding-line'
  | 'e-bike-2-line'
  | 'smartphone-line'
  | 'smartphone-fill'
  | 'tablet-line'
  | 'tools-line'
  | 'truck-line'
  | 'battery-charge-line'
  | 'home-2-line'
  | 'building-2-line'
  | 'key-line'
  | 'key-2-line'
  | 'map-pin-line'
  | 'store-line'
  | 'windy-line'
  | 'temp-cold-line'
  | 'water-percent-line'
  | 't-shirt-line'
  | 'footprint-line'
  | 'handbag-line'
  | 'armchair-line'
  | 'hotel-bed-line'
  | 'restaurant-line'
  | 'basketball-line'
  | 'heart-pulse-line'
  | 'music-2-line'
  | 'service-line'
  | 'shopping-bag-line'
  | 'cup-line'
  | 'settings-4-line'
  | 'funds-line'
  | 'shake-hands-line';

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

  // Arrow Down Line
  if (name === 'arrow-down-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 4v16m0 0l-6-6m6 6l6-6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // Arrow Up Line
  if (name === 'arrow-up-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 20V4m0 0l-6 6m6-6l6 6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  // Ghost Mode Icons - Pixel-Perfect High-End Vectors
  if (name === 'ghost-line' || name === 'ghost-fill') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2C7.58 2 4 5.58 4 10v9.5c0 .67.75 1.08 1.32.73L8 18.5l2.68 1.73c.41.27.95.27 1.36 0L14.72 18.5l2.68 1.73c.57.35 1.32-.06 1.32-.73V10c0-4.42-3.58-8-8-8z"
          fill={name === 'ghost-fill' ? color : 'none'}
          stroke={color}
          strokeWidth={name === 'ghost-fill' ? '0' : '1.8'}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx="9" cy="9.5" r="1.4" fill={name === 'ghost-fill' ? '#FFFFFF' : color} />
        <Circle cx="15" cy="9.5" r="1.4" fill={name === 'ghost-fill' ? '#FFFFFF' : color} />
      </Svg>
    );
  }

  if (name === 'spy-line' || name === 'spy-fill') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M17 2h-2V1h-6v1H7a3 3 0 0 0-3 3v1h16V5a3 3 0 0 0-3-3z"
          fill={color}
        />
        <Path
          d="M3 8v1a7 7 0 0 0 5 6.708V17a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-1.292A7 7 0 0 0 21 9V8H3zm16 2a5 5 0 0 1-4.584 4.98A3 3 0 0 0 13 13h-2a3 3 0 0 0-1.416 1.98A5 5 0 0 1 5 10H19z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'eye-off-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 3l18 18M10.5 10.677a2 2 0 0 0 2.823 2.823M7.362 7.561C5.68 8.74 4.279 10.42 3 12c1.88 3.5 5.5 6 9 6 1.55 0 3.03-.49 4.342-1.334M9.88 4.253C10.565 4.09 11.27 4 12 4c3.5 0 7.12 2.5 9 6a15.46 15.46 0 0 1-2.57 3.75"
          stroke={color}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === 'wifi-off-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 3l18 18M12 17.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM8.5 14.5a5 5 0 0 1 6.36-.64M5 10.5a10 10 0 0 1 12.73-.36M1.5 6.5a15 15 0 0 1 19.8 0"
          stroke={color}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === 'edit-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
          stroke={color}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === 'shield-check-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2l7 3.5v6c0 4.8-3.1 9.3-7 10.5-3.9-1.2-7-5.7-7-10.5v-6L12 2z"
          stroke={color}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9 12l2 2 4-4"
          stroke={color}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === 'movie-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.9" />
        <Circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth="1.8" />
        <Path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
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

  if (name === 'calendar-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.8" />
        <Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === 'at-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 0V6a6 6 0 0 1 6 6v1.5c0 .83-.67 1.5-1.5 1.5S15 14.33 15 13.5V12a3 3 0 0 0-6 0 3 3 0 0 0 3 3 3 3 0 0 0 1.5-.4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (name === 'camera-fill' || name === 'camera-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={name === 'camera-fill' ? color : 'none'}
        />
        <Circle
          cx="12"
          cy="14"
          r="3.5"
          stroke={name === 'camera-fill' ? '#0284C7' : color}
          strokeWidth="1.8"
          fill={name === 'camera-fill' ? '#FFFFFF' : 'none'}
        />
      </Svg>
    );
  }

  if (name === 'image-add-line') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth="1.8" />
        <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
        <Path d="M21 15l-5-5L5 21" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

  // 21. Telegram Official Clean Solid Chat Bubble (Ultra-Clean & Modern)
  if (name === 'chat-double-fill' || name === 'chat-3-fill') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path
          d="M12 2.5C6.75 2.5 2.5 6.75 2.5 12c0 1.76.48 3.41 1.31 4.83L2.56 20.8a.75.75 0 0 0 .91.91l3.97-1.25A9.45 9.45 0 0 0 12 21.5c5.25 0 9.5-4.25 9.5-9.5S17.25 2.5 12 2.5z"
        />
      </Svg>
    );
  }

  // 22. Telegram Official Settings Gear (Precision Cogwheel with Round Center)
  if (name === 'settings-3-fill') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8-4c0-.44-.04-.87-.11-1.28l2.01-1.57a.5.5 0 0 0 .12-.64l-1.9-3.29a.5.5 0 0 0-.61-.22l-2.37.95a7.92 7.92 0 0 0-2.22-1.28L14.52 2.2a.5.5 0 0 0-.5-.4h-3.8a.5.5 0 0 0-.5.4l-.36 2.47a7.92 7.92 0 0 0-2.22 1.28l-2.37-.95a.5.5 0 0 0-.61.22l-1.9 3.29a.5.5 0 0 0 .12.64l2.01 1.57C4.04 11.13 4 11.56 4 12s.04.87.11 1.28l-2.01 1.57a.5.5 0 0 0-.12.64l1.9 3.29c.12.22.39.3.61.22l2.37-.95c.68.52 1.43.95 2.22 1.28l.36 2.47c.05.23.25.4.5.4h3.8c.25 0 .45-.17.5-.4l.36-2.47c.79-.33 1.54-.76 2.22-1.28l2.37.95c.22.08.49 0 .61-.22l1.9-3.29a.5.5 0 0 0-.12-.64l-2.01-1.57c.07-.41.11-.84.11-1.28z"
        />
      </Svg>
    );
  }

  // 23. Standard Remix Icon Paths
  const ICON_PATHS: Record<string, string> = {
    'chat-3-fill': 'M7.291 20.824L2 22l1.176-5.291A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.956 9.956 0 0 1-4.709-1.176z',
    'user-circle-fill': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
    'phone-fill': 'M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.053 15.053 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 3.99c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-.99-1.11z',
    'contacts-book-fill': 'M7 2v20H3V2h4zm14 0c.552 0 1 .448 1 1v18c0 .552-.448 1-1 1H9V2h12zm-4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm2 7v-1c0-1.105-.895-2-2-2h-2c-1.105 0-2 .895-2 2v1h6z',
    'user-3-fill': 'M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 12c4.418 0 8 2.239 8 5v2H4v-2c0-2.761 3.582-5 8-5z',
    'user-add-line': 'M14 14.252v2.09A6 6 0 0 0 6 22l-2-.001a8 8 0 0 1 10-7.747zM12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm9 6h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2z',
    'user-add-fill': 'M14 14.252v2.09A6 6 0 0 0 6 22H4a8 8 0 0 1 10-7.748zM12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm9 6h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2z',
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
    'play-fill': 'M19.376 12.416L8.777 19.482A.5.5 0 0 1 8 19.066V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832z',
    'pause-fill': 'M6 5h4v14H6V5zm8 0h4v14h-4V5z',
    'reply-line': 'M11 20L1 12l10-8v5c5.523 0 10 4.477 10 10 0 .273-.01.543-.032.81-1.463-2.774-4.33-4.665-7.646-4.797L11 15v5z',
    'pencil-line': 'M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-1.414 1.414 2.828 2.828zM7.242 21H3v-4.243L16.435 3.322a3 3 0 0 1 4.243 0l1.414 1.414a3 3 0 0 1 0 4.243L7.242 21z',
    'pushpin-fill': 'M18 3v2h-1v6l2 3v2h-6v7h-2v-7H5v-2l2-3V5H6V3h12z',
    'pushpin-line': 'M18 3v2h-1v6l2 3v2h-6v7h-2v-7H5v-2l2-3V5H6V3h12zm-3 2H9v6.586l-1.414 2.121h8.828L15 11.586V5z',
    'more-fill': 'M5 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm14 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    'check-line': 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z',
    'check-double-line': 'M0.5 12.5l4.5 4.5L16 6l-1.4-1.4L5 14.2l-3.1-3.1L0.5 12.5zm6.5 0l4.5 4.5L23 6l-1.4-1.4L12 14.2l-3.6-3.1L7 12.5z',
    'arrow-down-fill': 'M12 16l-6-6h12z',
    'arrow-down-line': 'M13.0001 7.82843V20H11.0001V7.82843L5.63614 13.1924L4.22192 11.7782L12.0001 4L19.7783 11.7782L18.3641 13.1924L13.0001 7.82843Z',
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
    'git-commit-line': 'M15.938 11a4.002 4.002 0 0 0-7.876 0H2v2h6.062a4.002 4.002 0 0 0 7.876 0H22v-2h-6.062zM12 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4z',
    'flag-line': 'M5 2v19H3V2h2zm2 2h14l-3 4.5 3 4.5H7V4zm2 2v5h8.34l-1.66-2.5 1.66-2.5H9z',
    'rocket-line': 'M19.356 2.644a1 1 0 0 1 .3 1.056l-1.5 5.5-2.356-2.356 3.556-4.2zm-5.712 5.712l2.356 2.356-6.19 6.19-2.356-2.356 6.19-6.19zM6.046 16.54l2.356 2.356L5 20.354 3.646 19 5 15.5l1.046 1.04zM16.95 1.23a3 3 0 0 0-3.364.685L7.207 8.293a3 3 0 0 0-.82 1.554l-3.32 1.107a1 1 0 0 0-.64 1.258l1.414 4.243a1 1 0 0 0 .52.58l-2.073 2.073a1 1 0 0 0 0 1.414l2.828 2.829a1 1 0 0 0 1.415 0l2.073-2.074a1 1 0 0 0 .58.52l4.243 1.415a1 1 0 0 0 1.258-.641l1.107-3.32a3 3 0 0 0 1.554-.82l6.378-6.379a3 3 0 0 0 .685-3.364l-1.414-3.535a3 3 0 0 0-.686-.943L20.485.544a3 3 0 0 0-3.535.686z',
    'apps-2-line': 'M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm9-2h7v7h-7v-7zm2 2v3h3v-3h-3z',
    'cpu-line': 'M6 2h2v2h8V2h2v2h2a2 2 0 0 1 2 2v2h2v2h-2v4h2v2h-2v2a2 2 0 0 1-2 2h-2v2h-2v-2H8v2H6v-2H4a2 2 0 0 1-2-2v-2H0v-2h2v-4H0V8h2V6a2 2 0 0 1 2-2h2V2zm12 4H6v12h12V6zm-2 2v8H8V8h8z',
    'global-line': 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm7.93 9h-3.95a15.68 15.68 0 0 0-1.37-5.06A8.008 8.008 0 0 1 19.93 11zm-5.96 0h-3.94a13.78 13.78 0 0 1 1.97-5.58A13.78 13.78 0 0 1 13.97 11zm-5.94 0H4.07a8.008 8.008 0 0 1 5.39-5.06A15.68 15.68 0 0 0 8.03 11zm0 2a15.68 15.68 0 0 0 1.39 5.06A8.008 8.008 0 0 1 4.07 13h3.96zm1.97 0h3.94a13.78 13.78 0 0 1-1.97 5.58A13.78 13.78 0 0 1 10 13zm5.94 0h3.99a8.008 8.008 0 0 1-5.39 5.06 15.68 15.68 0 0 0 1.4-5.06z',
    'translate-2': 'M5 15v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2h2v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2h2zm7-13l3.5 7h-7L12 2zm0 3.2L10.9 7h2.2L12 5.2zM4 11h16v2H4v-2z',
    'volume-up-line': 'M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-2 0L7.29 7.5H3v9h4.29L12 20.77V3.23zM5 9.5h1.46L10 6.64v10.72L6.46 14.5H5v-5zm9 1.5v2c.56-.23 1-.77 1-1s-.44-.77-1-1z',
    'file-excel-2-fill': 'M2.859 2.877l12.57-1.795a1 1 0 0 1 1.142.884L17.995 21a1 1 0 0 1-1.142.884L4.283 20.09A1 1 0 0 1 3.42 19.1L2.003 3.97a1 1 0 0 1 .856-1.093zM19 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3V4zM7.8 8.2l2.4 3.8-2.4 3.8h1.8l1.5-2.6 1.5 2.6h1.8l-2.4-3.8 2.4-3.8h-1.8l-1.5 2.6-1.5-2.6H7.8z',
    'file-excel-2-line': 'M21 8v12.993A1 1 0 0 1 20.007 22H3.993A.993.993 0 0 1 3 21.008V2.992C3 2.455 3.449 2 4.002 2h10.995L21 8zm-2 1h-5V4H5v16h14V9zM8.8 11.2l1.6 2.4-1.6 2.4h1.4l.9-1.5.9 1.5h1.4l-1.6-2.4 1.6-2.4h-1.4l-.9 1.5-.9-1.5H8.8z',
    'eye-line': 'M12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9C2.122 6.88 6.608 3 12 3zm0 2C7.79 5 4.095 7.974 3.09 12c1.005 4.026 4.7 7 8.91 7 4.21 0 7.905-2.974 8.91-7-1.005-4.026-4.7-7-8.91-7zm0 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    'archive-line': 'M3 3h18a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 6H4v11h16V9zm-2-4H4v2h16V5zm-5 7v2H9v-2h6z',
    'folder-add-line': 'M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4zm7 5h2v2h2v2h-2v2h-2v-2H9v-2h2v-2z',
    'folder-line': 'M12.414 5H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2zM4 5v14h16V7h-8.414l-2-2H4z',
    'arrow-right-up-line': 'M16.004 9.414l-8.607 8.607-1.414-1.414 8.607-8.607H7.004V6h11v11h-2V9.414z',
    'external-link-line': 'M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.293 7.294-1.414-1.414L17.586 5H13V3h8z',
    'arrow-right-s-line': 'M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z',
    'arrow-left-s-line': 'M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z',
    'arrow-left-line': 'M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414L7.828 11z',
    'arrow-right-line': 'M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z',
    'menu-line': 'M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z',
    'menu-fold-line': 'M21 4H7v2h14V4zm0 7H11v2h10v-2zm0 7H7v2h14v-2zM3 17l5-5-5-5v10z',
    'menu-unfold-line': 'M21 4H7v2h14V4zm0 7H11v2h10v-2zm0 7H7v2h14v-2zM8 7l-5 5 5 5V7z',
    'side-bar-line': 'M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm6 2H4v14h5V5zm2 0v14h9V5h-9z',
    'folder-open-line': 'M4 5v14h16V7h-8.414l-2-2H4zm8.414 0H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6.414l2 2z',
    'upload-cloud-2-line': 'M7 20.985A7.003 7.003 0 0 1 4.542 7.55 8.003 8.003 0 0 1 20 8a6 6 0 0 1 2 11.664v.321h-2a4 4 0 0 0-1.879-7.553l-.84.148-.284-.8A6.002 6.002 0 0 0 6.16 8.528l-.348.868-.927-.12A5.002 5.002 0 0 0 7 18.985v2zM12 8l5 5h-3v5h-4v-5H7l5-5z',
    'share-forward-line': 'M13 14h-2a8.999 8.999 0 0 0-7.968 4.81A10.13 10.13 0 0 1 3 18C3 12.477 7.477 8 13 8V3l10 8-10 8v-5zm-2 2h3v3.05L19.813 14 14 8.95V12h-1c-4.418 0-8 3.582-8 8 0-.477.04-1.025.122-1.637A6.996 6.996 0 0 1 11 16z',
    'share-forward-fill': 'M13 14h-2a8.999 8.999 0 0 0-7.968 4.81A10.13 10.13 0 0 1 3 18C3 12.477 7.477 8 13 8V3l10 8-10 8v-5z',
    'laptop-line': 'M4 5v11h16V5H4zm-2-.99C2 3.452 2.455 3 2.992 3h18.016c.548 0 .992.449.992 1.01V18H0V4.01zM1 19h22v2H1v-2z',
    'macbook-line': 'M4 5v11h16V5H4zm-2-.99C2 3.452 2.455 3 2.992 3h18.016c.548 0 .992.449.992 1.01V18H0V4.01zM1 19h22v2H1v-2z',
    'computer-line': 'M4 2.995C4 2.445 4.445 2 4.996 2h14.008C19.555 2 20 2.445 20 2.995V15H4V2.995zM2 17h20v2H2v-2zm7 3h6v2H9v-2z',
    'tv-line': 'M2 4c0-.552.448-1 1-1h18c.552 0 1 .448 1 1v13c0 .552-.448 1-1 1H3c-.552 0-1-.448-1-1V4zm2 1v11h16V5H4zm4 15h8v2H8v-2z',
    'tv-2-line': 'M2 4c0-.552.448-1 1-1h18c.552 0 1 .448 1 1v13c0 .552-.448 1-1 1H3c-.552 0-1-.448-1-1V4zm2 1v11h16V5H4zm4 15h8v2H8v-2z',
    'keyboard-line': 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v10h16V7H4zm2 2h2v2H6V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9zm4 0h2v2h-2V9zm-12 4h2v2H6v-2zm4 0h8v2h-8v-2zm10 0h2v2h-2v-2z',
    'router-line': 'M2 14c0-.552.448-1 1-1h18c.552 0 1 .448 1 1v6c0 .552-.448 1-1 1H3c-.552 0-1-.448-1-1v-6zm2 1v4h16v-4H4zm1-8h2v5H5V7zm6-4h2v9h-2V3zm6 4h2v5h-2V7z',
    'car-line': 'M19 20H5v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-9l2.513-7.538A2 2 0 0 1 6.41 3h11.18a2 2 0 0 1 1.897 1.462L22 12v9a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1zm-1.545-9L16.12 5H7.88L6.545 11h10.91zM6.5 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
    'car-fill': 'M19 20H5v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-9l2.513-7.538A2 2 0 0 1 6.41 3h11.18a2 2 0 0 1 1.897 1.462L22 12v9a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1zM6.5 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
    'riding-line': 'M15.5 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm-1.295 6.326l3.528 2.352 3.447-1.15a1 1 0 0 1 1.258.631l.032.11a1 1 0 0 1-.632 1.258l-4.22 1.407a1 1 0 0 1-1.077-.272l-1.996-2.096-2.738 2.053 2.186 3.826 3.91-.782a1 1 0 0 1 1.176.784l.02.113a1 1 0 0 1-.784 1.176l-4.708.942a1 1 0 0 1-1.036-.453l-2.617-4.58-3.08 2.31V21h-2v-4.5a1 1 0 0 1 .4-.8l3.966-2.975.87-4.352-2.146 1.43a1 1 0 0 1-1.387-.277l-1.11-1.664a1 1 0 0 1 .277-1.387l3.328-2.22a3 3 0 0 1 3.93.57z',
    'e-bike-2-line': 'M5.5 18a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm13 0a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zM12 4h4v2h-3.236l-1.6 3.2 2.68 2.68a5.52 5.52 0 0 1 4.656.62l.5-.8h2v2h-1.12a3.5 3.5 0 0 0-4.38 3.5v.8H6.5v-.8A3.5 3.5 0 0 0 3 13.5v-2h2v2c0 .488.1 1 .28 1.48L7.6 9.32 10.236 4H12z',
    'tools-line': 'M15.707 2.293a1 1 0 0 1 1.414 0l4.586 4.586a1 1 0 0 1 0 1.414l-3.5 3.5-6-6 3.5-3.5zm-5 5l6 6-9.5 9.5a1 1 0 0 1-1.414 0l-3.586-3.586a1 1 0 0 1 0-1.414l9.5-9.5z',
    'truck-line': 'M17 8h3l3 4.5V19h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H1V6a1 1 0 0 1 1-1h15v3zm-2 2V7H3v10h.17a3.001 3.001 0 0 1 5.66 0h4.34a3.001 3.001 0 0 1 5.66 0H21v-5.5L18.667 10H15zm-9 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm12 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    'battery-charge-line': 'M12 11h3l-5 7v-5H7l5-7v5zm-7-8h11a1 1 0 0 1 1 1v3h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h9V5H6z',
    'smartphone-line': 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 2v16h8V4H8zm4 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
    'smartphone-fill': 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm5 15a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
    'tablet-line': 'M5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 2v16h12V4H6zm6 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
    'home-2-line': 'M12 2l9.997 7.498L20 21H4V9.498L12 2zm0 2.527L6 10.027V19h12v-8.973L12 4.527zM10 12h4v7h-4v-7z',
    'building-2-line': 'M12 2a1 1 0 0 1 1 1v18h7v-9h-2V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h9zm-2 2H4v16h6V4zm11 8h-2v8h2v-8zM6 6h2v2H6V6zm0 4h2v2H6v-2zm0 4h2v2H6v-2z',
    'key-line': 'M17 14h-4.341a6 6 0 1 1 0-4H23v4h-2v4h-4v-4zm-8-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    'key-2-line': 'M17 14h-4.341a6 6 0 1 1 0-4H23v4h-2v4h-4v-4zm-8-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
    'map-pin-line': 'M12 20.9l4.95-4.95a7 7 0 1 0-9.9 0L12 20.9zm0 2.828l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'store-line': 'M21 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7H2v-2l1-5h18l1 5v2h-1zM5 13v6h14v-6H5zm-.96-2h15.92l-.6-3H4.64l-.6 3zM6 15h3v2H6v-2zm6 0h3v2h-3v-2z',
    'windy-line': 'M10.5 17H4v-2h6.5a3.5 3.5 0 1 0-3.5-3.5H5a5.5 5.5 0 1 1 5.5 5.5zm4.5-6H2v-2h13a3.5 3.5 0 1 0-3.5-3.5H9.5a5.5 5.5 0 1 1 5.5 5.5zm3 6H2v-2h16a3.5 3.5 0 1 0-3.5-3.5H12.5a5.5 5.5 0 1 1 5.5 5.5z',
    'temp-cold-line': 'M8 10.255V5a4 4 0 1 1 8 0v5.255a7 7 0 1 1-8 0zM14 5a2 2 0 1 0-4 0v6.17a1 1 0 0 1-.414.814 5 5 0 1 0 4.828 0A1 1 0 0 1 14 11.17V5z',
    'water-percent-line': 'M12 3.1L5.636 9.464a9 9 0 1 0 12.728 0L12 3.1zm0 2.828l4.95 4.95a7 7 0 1 1-9.9 0L12 5.928zM8.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 2a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-6.207-4.293l6 6-1.414 1.414-6-6 1.414-1.414z',
    't-shirt-line': 'M14.545 3h4.456a1 1 0 0 1 .949.684l2 6a1 1 0 0 1-.684 1.265l-2.266.755v9.296a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9.296l-2.266-.755a1 1 0 0 1-.684-1.265l2-6A1 1 0 0 1 5 3h4.455a4.002 4.002 0 0 0 5.09 0zM17 13.04v6.96H7v-6.96l2-2V13h6v-1.96l2 2zM12 5a2 2 0 0 1-1.732-1h3.464A2 2 0 0 1 12 5z',
    'footprint-line': 'M9 2a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h2zm6 7a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h2zm-6 5a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h2z',
    'handbag-line': 'M7 8V6a5 5 0 0 1 10 0v2h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3zm2 0h6V6a3 3 0 0 0-6 0v2zm10 2H5v10h14V10zm-7 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
    'armchair-line': 'M6 4h12v7h3a2 2 0 0 1 2 2v5h-2v2h-2v-2H5v2H3v-2H1v-5a2 2 0 0 1 2-2h3V4zm2 2v5h8V6H8zm11 7H5a1 1 0 0 0-1 1v3h16v-3a1 1 0 0 0-1-1z',
    'hotel-bed-line': 'M22 11v9h-2v-3H4v3H2V4h2v10h8V7h8a2 2 0 0 1 2 2v2zm-2 2h-6v2h6v-2zM8 7a3 3 0 1 1 0 6 3 3 0 0 1 0-6z',
    'restaurant-line': 'M12 2a1 1 0 0 1 1 1v8h3V3a1 1 0 0 1 2 0v8h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2v-8h-1v8a1 1 0 0 1-2 0v-8h-1v8a1 1 0 0 1-2 0V12a1 1 0 0 1 1-1h1V3a1 1 0 0 1 1-1zM6 2v7.373A3.001 3.001 0 0 0 4 12.2V21a1 1 0 0 0 2 0v-8.8a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1V21a1 1 0 0 0 2 0v-8.8a3.001 3.001 0 0 0-2-2.827V2H6z',
    'basketball-line': 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a7.96 7.96 0 0 0 5.48-2.185A14.07 14.07 0 0 0 12 16c-2.138 0-4.135.63-5.48 1.815A7.96 7.96 0 0 0 12 20zm6.9-3.528A16.03 16.03 0 0 1 12 14c-2.483 0-4.795.69-6.9 2.472A8.002 8.002 0 0 0 4 12c0-.36.03-.71.07-1.054A14.08 14.08 0 0 0 12 13c3.082 0 5.92-.99 8.23-2.693.06.347.09.7.09 1.053 0 1.95-.698 3.738-1.42 5.119z',
    'heart-pulse-line': 'M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2zm-4.32 15.688A19.8 19.8 0 0 0 20 9.25C20 6.643 18.236 5 16.5 5c-1.636 0-3.053 1.026-3.69 2.378a1 1 0 0 1-1.62 0C10.553 6.026 9.136 5 7.5 5 5.764 5 4 6.643 4 9.25c0 3.754 3.766 7.234 7.82 9.438l.36.196z',
    'music-2-line': 'M20 3v14a4 4 0 1 1-2-3.465V5H9v12a4 4 0 1 1-2-3.465V3h13zM5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    'service-line': 'M14.121 10.48a1 1 0 0 0-1.414 0l-.707.706a2 2 0 0 1-2.828 0l-.708-.707a1 1 0 0 0-1.414 0L5.636 11.9a1 1 0 0 0 0 1.414l4.95 4.95a1 1 0 0 0 1.414 0l4.95-4.95a1 1 0 0 0 0-1.414l-2.829-2.829zM12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z',
    'shopping-bag-line': 'M7 8V6a5 5 0 0 1 10 0v2h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3zm2 0h6V6a3 3 0 0 0-6 0v2zm10 2H5v10h14V10z',
    'cup-line': 'M5 3h15a1 1 0 0 1 1 1v5a4 4 0 0 1-4 4h-1v4a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4a1 1 0 0 1 1-1zm11 8a2 2 0 0 0 2-2V5h-2v6zM6 5v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V5H6z',
    'settings-4-line': 'M12 1l1.41 2.83a8.94 8.94 0 0 1 2.39.99l2.97-1.07 1.41 2.44-2.12 2.3a8.94 8.94 0 0 1 .99 2.39L22 12v2.83l-2.83 1.41a8.94 8.94 0 0 1-.99 2.39l2.12 2.3-1.41 2.44-2.97-1.07a8.94 8.94 0 0 1-2.39.99L12 23h-2.83l-1.41-2.83a8.94 8.94 0 0 1-2.39-.99l-2.97 1.07-1.41-2.44 2.12-2.3a8.94 8.94 0 0 1-.99-2.39L2 14v-2.83l2.83-1.41a8.94 8.94 0 0 1 .99-2.39L3.7 5.07l1.41-2.44 2.97 1.07a8.94 8.94 0 0 1 2.39-.99L12 1zm0 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    'funds-line': 'M3 3h2v18H3V3zm16 4h2v14h-2V7zm-8 4h2v10h-2V11zm4-6h2v16h-2V5zm-8 8h2v8H7v-8z',
    'shake-hands-line': 'M15.707 2.293a1 1 0 0 1 1.414 0l4.586 4.586a1 1 0 0 1 0 1.414l-3.5 3.5-6-6 3.5-3.5zm-5 5l6 6-9.5 9.5a1 1 0 0 1-1.414 0l-3.586-3.586a1 1 0 0 1 0-1.414l9.5-9.5z',
    'palette-line': 'M12 2c5.523 0 10 4.477 10 10a9.96 9.96 0 0 1-4.584 8.415 1.5 1.5 0 0 1-1.954-.354l-.462-.577a3 3 0 0 0-2.338-1.129H12a6 6 0 0 1-6-6 4 4 0 0 1 4-4h.5a1.5 1.5 0 0 0 1.5-1.5V4.5A2.5 2.5 0 0 0 9.5 2H12zm0 2H9.5a.5.5 0 0 0-.5.5V6a3.5 3.5 0 0 1-3.5 3.5H5a2 2 0 0 0-2 2 4 4 0 0 0 4 4h.662a5 5 0 0 1 3.897 1.882l.462.577a3.5 3.5 0 0 0 4.56.826A7.96 7.96 0 0 0 20 12c0-4.418-3.582-8-8-8zm-4.5 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4-2a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4 2a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-2 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z',
    'sun-line': 'M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z',
    'moon-line': 'M10 7a7 7 0 0 0 12 4.9v.1c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2h.1A6.979 6.979 0 0 0 10 7zm-6 5a8 8 0 0 0 15.062 3.762A9 9 0 0 1 8.238 4.938 7.999 7.999 0 0 0 4 12z',
    'contrast-drop-2-line': 'M12 3.1L5.636 9.464a9 9 0 1 0 12.728 0L12 3.1zm0 2.828l4.95 4.95a7 7 0 1 1-9.9 0L12 5.928zM12 7.828v10.344a5.002 5.002 0 0 0 0-10.344z',
  };

  const path = ICON_PATHS[name] || ICON_PATHS['sparkles-fill'];

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={path} fill={color} />
    </Svg>
  );
};
