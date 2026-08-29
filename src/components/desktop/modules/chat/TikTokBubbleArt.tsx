import React from 'react';
import Svg, { Path, Circle, Rect, G, Ellipse } from 'react-native-svg';

interface CharacterArtProps {
  type: string;
  size?: number;
}

/**
 * High-fidelity Vector illustrations for TikTok Custom Chat Bubbles
 */
export const TikTokCharacterArt: React.FC<CharacterArtProps> = ({ type, size = 26 }) => {
  switch (type) {
    case 'frog_head':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Frog Head */}
          <Ellipse cx="18" cy="22" rx="14" ry="11" fill="#4ADE80" stroke="#166534" strokeWidth="2" />
          {/* Left Eye */}
          <Circle cx="10" cy="11" r="7" fill="#4ADE80" stroke="#166534" strokeWidth="2" />
          <Circle cx="10" cy="11" r="5" fill="#FFFFFF" />
          <Circle cx="11" cy="11" r="2.5" fill="#0F172A" />
          <Circle cx="9.5" cy="9.5" r="1" fill="#FFFFFF" />
          {/* Right Eye */}
          <Circle cx="26" cy="11" r="7" fill="#4ADE80" stroke="#166534" strokeWidth="2" />
          <Circle cx="26" cy="11" r="5" fill="#FFFFFF" />
          <Circle cx="25" cy="11" r="2.5" fill="#0F172A" />
          <Circle cx="23.5" cy="9.5" r="1" fill="#FFFFFF" />
          {/* Cheeks */}
          <Circle cx="8" cy="24" r="2.5" fill="#F472B6" opacity={0.6} />
          <Circle cx="28" cy="24" r="2.5" fill="#F472B6" opacity={0.6} />
          {/* Smile */}
          <Path d="M13 25 Q18 29 23 25" stroke="#166534" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Cute Paws resting on bubble border */}
          <Ellipse cx="11" cy="31" rx="4" ry="2.5" fill="#22C55E" stroke="#166534" strokeWidth="1.5" />
          <Ellipse cx="25" cy="31" rx="4" ry="2.5" fill="#22C55E" stroke="#166534" strokeWidth="1.5" />
        </Svg>
      );

    case 'chick_head':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Baby Chick Body */}
          <Circle cx="18" cy="20" r="13" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
          {/* Little Hair Tuft */}
          <Path d="M18 7 Q16 2 15 4 Q18 5 18 7" fill="#FACC15" />
          <Path d="M18 7 Q20 2 21 4 Q18 5 18 7" fill="#FACC15" />
          {/* Eyes */}
          <Circle cx="13" cy="18" r="2.5" fill="#0F172A" />
          <Circle cx="12" cy="17" r="0.8" fill="#FFFFFF" />
          <Circle cx="23" cy="18" r="2.5" fill="#0F172A" />
          <Circle cx="22" cy="17" r="0.8" fill="#FFFFFF" />
          {/* Blush */}
          <Circle cx="10" cy="22" r="2" fill="#FB923C" opacity={0.5} />
          <Circle cx="26" cy="22" r="2" fill="#FB923C" opacity={0.5} />
          {/* Beak */}
          <Path d="M15 20 L21 20 L18 25 Z" fill="#F97316" stroke="#C2410C" strokeWidth="1" />
          {/* Little Wings */}
          <Ellipse cx="7" cy="24" rx="2.5" ry="4" fill="#FACC15" transform="rotate(-20 7 24)" />
          <Ellipse cx="29" cy="24" rx="2.5" ry="4" fill="#FACC15" transform="rotate(20 29 24)" />
        </Svg>
      );

    case 'capybara':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Capybara Head */}
          <Rect x="7" y="10" width="22" height="20" rx="9" fill="#A87343" stroke="#583B1F" strokeWidth="2" />
          {/* Ears */}
          <Circle cx="7" cy="11" r="3.5" fill="#784C25" stroke="#583B1F" strokeWidth="1.5" />
          <Circle cx="29" cy="11" r="3.5" fill="#784C25" stroke="#583B1F" strokeWidth="1.5" />
          {/* Satsuma Orange on Head */}
          <Circle cx="18" cy="7" r="4.5" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
          <Path d="M18 3 Q19 1 21 2" stroke="#15803D" strokeWidth="1.5" fill="none" />
          {/* Calm Closed Eyes */}
          <Path d="M11 18 L15 18" stroke="#38220F" strokeWidth="2" strokeLinecap="round" />
          <Path d="M21 18 L25 18" stroke="#38220F" strokeWidth="2" strokeLinecap="round" />
          {/* Snout & Nose */}
          <Ellipse cx="18" cy="24" rx="5" ry="3.5" fill="#784C25" />
          <Circle cx="16" cy="23" r="1" fill="#29180B" />
          <Circle cx="20" cy="23" r="1" fill="#29180B" />
        </Svg>
      );

    case 'cat':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Cat Ears */}
          <Path d="M6 16 L10 5 L16 12 Z" fill="#FB923C" stroke="#C2410C" strokeWidth="1.5" />
          <Path d="M30 16 L26 5 L20 12 Z" fill="#FB923C" stroke="#C2410C" strokeWidth="1.5" />
          <Path d="M8 14 L10 7 L14 12 Z" fill="#FECDD3" />
          <Path d="M28 14 L26 7 L22 12 Z" fill="#FECDD3" />
          {/* Cat Face */}
          <Circle cx="18" cy="22" r="12" fill="#FED7AA" stroke="#C2410C" strokeWidth="2" />
          {/* Eyes */}
          <Path d="M12 20 Q14 18 16 20" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" fill="none" />
          <Path d="M20 20 Q22 18 24 20" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Cute Nose & Mouth */}
          <Circle cx="18" cy="23" r="1.2" fill="#F43F5E" />
          <Path d="M16 25 Q18 27 20 25" stroke="#7C2D12" strokeWidth="1.5" fill="none" />
          {/* Whiskers */}
          <Path d="M7 22 L12 23 M7 25 L12 25" stroke="#9A3412" strokeWidth="1" strokeLinecap="round" />
          <Path d="M29 22 L24 23 M29 25 L24 25" stroke="#9A3412" strokeWidth="1" strokeLinecap="round" />
        </Svg>
      );

    case 'dog':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Floppy Dog Ears */}
          <Ellipse cx="7" cy="18" rx="4" ry="8" fill="#92400E" stroke="#78350F" strokeWidth="1.5" transform="rotate(-15 7 18)" />
          <Ellipse cx="29" cy="18" rx="4" ry="8" fill="#92400E" stroke="#78350F" strokeWidth="1.5" transform="rotate(15 29 18)" />
          {/* Dog Head */}
          <Circle cx="18" cy="20" r="12" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
          {/* Eye Patch */}
          <Ellipse cx="14" cy="18" rx="4" ry="5" fill="#D97706" opacity={0.4} />
          {/* Eyes */}
          <Circle cx="14" cy="18" r="2.2" fill="#1F2937" />
          <Circle cx="13" cy="17" r="0.7" fill="#FFFFFF" />
          <Circle cx="22" cy="18" r="2.2" fill="#1F2937" />
          <Circle cx="21" cy="17" r="0.7" fill="#FFFFFF" />
          {/* Snout & Tongue */}
          <Ellipse cx="18" cy="24" rx="4.5" ry="3.5" fill="#FFFFFF" stroke="#B45309" strokeWidth="1" />
          <Ellipse cx="18" cy="23" rx="2" ry="1.3" fill="#1F2937" />
          <Path d="M18 26 Q19 29 20 28" fill="#F43F5E" stroke="#BE123C" strokeWidth="1" />
        </Svg>
      );

    case 'doge':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Pointy Shiba Ears */}
          <Path d="M8 14 L12 4 L17 11 Z" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
          <Path d="M28 14 L24 4 L19 11 Z" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
          {/* Doge Head */}
          <Circle cx="18" cy="21" r="12" fill="#FCD34D" stroke="#92400E" strokeWidth="2" />
          {/* White Snout Mask */}
          <Ellipse cx="18" cy="25" rx="6" ry="4.5" fill="#FFFBEB" />
          {/* Suspicious Doge Side-Eye */}
          <Circle cx="13" cy="19" r="2.5" fill="#1F2937" />
          <Circle cx="14.5" cy="18" r="0.9" fill="#FFFFFF" />
          <Circle cx="23" cy="19" r="2.5" fill="#1F2937" />
          <Circle cx="24.5" cy="18" r="0.9" fill="#FFFFFF" />
          {/* Eyebrow dots */}
          <Circle cx="13" cy="14" r="1.5" fill="#FFFBEB" />
          <Circle cx="23" cy="14" r="1.5" fill="#FFFBEB" />
          {/* Nose & Smug Mouth */}
          <Circle cx="18" cy="23" r="1.8" fill="#1F2937" />
          <Path d="M15 26 Q18 28 21 26" stroke="#78350F" strokeWidth="1.5" fill="none" />
        </Svg>
      );

    case 'dino':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Dino Spikes */}
          <Path d="M12 7 L15 11 L9 11 Z" fill="#10B981" />
          <Path d="M18 4 L21 9 L15 9 Z" fill="#10B981" />
          {/* Dino Head */}
          <Rect x="7" y="10" width="22" height="18" rx="8" fill="#34D399" stroke="#065F46" strokeWidth="2" />
          {/* Big Eye */}
          <Circle cx="14" cy="16" r="4.5" fill="#FFFFFF" stroke="#065F46" strokeWidth="1.5" />
          <Circle cx="15" cy="16" r="2.2" fill="#0F172A" />
          <Circle cx="14" cy="15" r="0.8" fill="#FFFFFF" />
          {/* Open Chomping Jaw */}
          <Path d="M22 20 L29 20 L25 24 L29 28 L22 28 Z" fill="#FEE2E2" stroke="#065F46" strokeWidth="1.5" />
          <Path d="M23 20 L24 22 L25 20" fill="#FFFFFF" />
          <Path d="M26 20 L27 22 L28 20" fill="#FFFFFF" />
          {/* Nostril */}
          <Circle cx="24" cy="15" r="1" fill="#047857" />
        </Svg>
      );

    case 'bubbles':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <Circle cx="12" cy="22" r="7" fill="#38BDF8" opacity={0.5} stroke="#0284C7" strokeWidth="1.5" />
          <Circle cx="10" cy="19" r="2" fill="#FFFFFF" opacity={0.7} />
          <Circle cx="24" cy="14" r="5" fill="#38BDF8" opacity={0.6} stroke="#0284C7" strokeWidth="1.5" />
          <Circle cx="22" cy="12" r="1.5" fill="#FFFFFF" opacity={0.7} />
          <Circle cx="26" cy="26" r="3.5" fill="#7DD3FC" opacity={0.5} stroke="#0284C7" strokeWidth="1" />
        </Svg>
      );

    case 'heart_pepe':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Glowing Heart */}
          <Path
            d="M18 30 C18 30 6 22 6 13 C6 7.5 10.5 4 15 7 C18 9 18 10 18 10 C18 10 18 9 21 7 C25.5 4 30 7.5 30 13 C30 22 18 30 18 30 Z"
            fill="#F43F5E"
            stroke="#BE123C"
            strokeWidth="2"
          />
          <Circle cx="12" cy="11" r="2" fill="#FFFFFF" opacity={0.6} />
        </Svg>
      );

    case 'pig':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Pig Ears */}
          <Path d="M8 12 L12 4 L16 11 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="1.5" />
          <Path d="M28 12 L24 4 L20 11 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="1.5" />
          {/* Head */}
          <Circle cx="18" cy="20" r="12" fill="#FBCFE8" stroke="#BE185D" strokeWidth="2" />
          {/* Eyes */}
          <Circle cx="13" cy="17" r="2" fill="#1F2937" />
          <Circle cx="23" cy="17" r="2" fill="#1F2937" />
          {/* Big Pig Snout */}
          <Ellipse cx="18" cy="23" rx="5" ry="3.5" fill="#F472B6" stroke="#BE185D" strokeWidth="1.5" />
          <Circle cx="16" cy="23" r="1.2" fill="#831843" />
          <Circle cx="20" cy="23" r="1.2" fill="#831843" />
        </Svg>
      );

    case 'shark':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          {/* Shark Fin */}
          <Path d="M18 4 Q22 10 24 14 L12 14 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.5" />
          {/* Shark Body */}
          <Ellipse cx="18" cy="22" rx="13" ry="9" fill="#7DD3FC" stroke="#0369A1" strokeWidth="2" />
          {/* White Belly */}
          <Ellipse cx="18" cy="25" rx="10" ry="5" fill="#F0F9FF" />
          {/* Eye */}
          <Circle cx="11" cy="19" r="2" fill="#0F172A" />
          <Circle cx="10.5" cy="18.5" r="0.6" fill="#FFFFFF" />
          {/* Sharp Teeth Smile */}
          <Path d="M15 24 L16 26 L17 24 L18 26 L19 24 L20 26 L21 24" stroke="#0369A1" strokeWidth="1" fill="#FFFFFF" />
        </Svg>
      );

    default:
      return null;
  }
};
