import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Ellipse, G, Polygon, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';

interface CreativeBubbleShellProps {
  bubbleId: string;
  isMe?: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  children: React.ReactNode;
  mini?: boolean;
}

/**
 * Ultra-Premium Illustrative Vector Character Shells for TikTok Custom Chat Bubbles
 * High-production vector art with gradients, highlights, and organic framing.
 */
export const TikTokCreativeShell: React.FC<CreativeBubbleShellProps> = ({
  bubbleId,
  isMe = true,
  backgroundColor,
  borderColor,
  textColor,
  children,
  mini = false,
}) => {
  const scale = mini ? 0.72 : 1;

  switch (bubbleId) {
    /* 1. FROG CHICK (Bathtub / Pond Scene) */
    case 'frog_chick':
      return (
        <View style={styles.shellContainer}>
          {/* Top-Left Glossy Frog */}
          <View style={[styles.anchor, { top: mini ? -14 : -22, left: mini ? -8 : -14 }]}>
            <Svg width={44 * scale} height={34 * scale} viewBox="0 0 44 34" fill="none">
              <Defs>
                <LinearGradient id="frogSkin" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#86EFAC" />
                  <Stop offset="100%" stopColor="#22C55E" />
                </LinearGradient>
                <LinearGradient id="frogEye" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#4ADE80" />
                  <Stop offset="100%" stopColor="#16A34A" />
                </LinearGradient>
              </Defs>
              {/* Left Eye */}
              <Circle cx="12" cy="11" r="8" fill="url(#frogEye)" stroke="#14532D" strokeWidth="1.8" />
              <Circle cx="12" cy="11" r="5.5" fill="#FFFFFF" />
              <Circle cx="13" cy="11" r="3" fill="#0F172A" />
              <Circle cx="11.5" cy="9.5" r="1.2" fill="#FFFFFF" />
              {/* Right Eye */}
              <Circle cx="32" cy="11" r="8" fill="url(#frogEye)" stroke="#14532D" strokeWidth="1.8" />
              <Circle cx="32" cy="11" r="5.5" fill="#FFFFFF" />
              <Circle cx="31" cy="11" r="3" fill="#0F172A" />
              <Circle cx="29.5" cy="9.5" r="1.2" fill="#FFFFFF" />
              {/* Head Body */}
              <Ellipse cx="22" cy="22" rx="17" ry="11" fill="url(#frogSkin)" stroke="#14532D" strokeWidth="2" />
              {/* Blushing Cheeks */}
              <Circle cx="9" cy="23" r="3" fill="#FB7185" opacity={0.65} />
              <Circle cx="35" cy="23" r="3" fill="#FB7185" opacity={0.65} />
              {/* Cute Smile */}
              <Path d="M16 23 Q22 28 28 23" stroke="#14532D" strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Overhanging Little Hands */}
              <Ellipse cx="11" cy="29" rx="4.5" ry="3" fill="#4ADE80" stroke="#14532D" strokeWidth="1.6" />
              <Ellipse cx="33" cy="29" rx="4.5" ry="3" fill="#4ADE80" stroke="#14532D" strokeWidth="1.6" />
            </Svg>
          </View>

          {/* Top-Right Glossy Chick */}
          <View style={[styles.anchor, { top: mini ? -14 : -22, right: mini ? -8 : -14 }]}>
            <Svg width={42 * scale} height={34 * scale} viewBox="0 0 42 34" fill="none">
              <Defs>
                <LinearGradient id="chickSkin" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#FEF08A" />
                  <Stop offset="100%" stopColor="#EAB308" />
                </LinearGradient>
              </Defs>
              {/* Little Feather Tufts */}
              <Path d="M21 6 Q18 0 17 2 Q21 4 21 6" fill="#FACC15" />
              <Path d="M21 6 Q24 0 25 2 Q21 4 21 6" fill="#FACC15" />
              {/* Chick Head */}
              <Circle cx="21" cy="19" r="13" fill="url(#chickSkin)" stroke="#854D0E" strokeWidth="2" />
              {/* Eyes */}
              <Circle cx="15" cy="17" r="2.5" fill="#0F172A" />
              <Circle cx="14" cy="16" r="0.9" fill="#FFFFFF" />
              <Circle cx="27" cy="17" r="2.5" fill="#0F172A" />
              <Circle cx="26" cy="16" r="0.9" fill="#FFFFFF" />
              {/* Blush */}
              <Circle cx="11" cy="22" r="2.5" fill="#FB923C" opacity={0.6} />
              <Circle cx="31" cy="22" r="2.5" fill="#FB923C" opacity={0.6} />
              {/* Beak with highlight */}
              <Path d="M17 19 L25 19 L21 25 Z" fill="#F97316" stroke="#9A3412" strokeWidth="1.2" />
              <Path d="M18 20 L24 20 L21 21 Z" fill="#FDBA74" />
              {/* Wings Overhanging Rim */}
              <Ellipse cx="7" cy="24" rx="3.5" ry="2.5" fill="#FACC15" stroke="#854D0E" strokeWidth="1.4" />
              <Ellipse cx="35" cy="24" rx="3.5" ry="2.5" fill="#FACC15" stroke="#854D0E" strokeWidth="1.4" />
            </Svg>
          </View>

          {/* Bottom-Right Translucent Water Bubbles */}
          <View style={[styles.anchor, { bottom: mini ? -10 : -14, right: mini ? -6 : -10 }]}>
            <Svg width={46 * scale} height={28 * scale} viewBox="0 0 46 28" fill="none">
              <Defs>
                <RadialGradient id="bubbleGrad" cx="35%" cy="35%" r="65%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
                  <Stop offset="40%" stopColor="#7DD3FC" stopOpacity={0.7} />
                  <Stop offset="100%" stopColor="#0284C7" stopOpacity={0.5} />
                </RadialGradient>
              </Defs>
              <Circle cx="12" cy="16" r="8" fill="url(#bubbleGrad)" stroke="#0284C7" strokeWidth="1.5" />
              <Circle cx="10" cy="13" r="2.2" fill="#FFFFFF" opacity={0.9} />
              <Circle cx="28" cy="11" r="6.5" fill="url(#bubbleGrad)" stroke="#0284C7" strokeWidth="1.5" />
              <Circle cx="26" cy="9" r="1.8" fill="#FFFFFF" opacity={0.9} />
              <Circle cx="39" cy="18" r="4.5" fill="url(#bubbleGrad)" stroke="#0284C7" strokeWidth="1.2" />
            </Svg>
          </View>

          {/* Bathtub Rim Container */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingTop: mini ? 8 : 12,
                paddingBottom: mini ? 6 : 10,
                paddingHorizontal: mini ? 10 : 16,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: isMe ? 20 : 4,
                borderBottomRightRadius: isMe ? 4 : 20,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* 2. HUNGRY DOG (Sausage Dog Chomp) */
    case 'hungry_dog':
      return (
        <View style={styles.shellContainer}>
          {/* Left: Animated Chomp Head */}
          <View style={[styles.anchor, { top: -4, left: mini ? -18 : -26 }]}>
            <Svg width={38 * scale} height={42 * scale} viewBox="0 0 38 42" fill="none">
              {/* Droopy Ear */}
              <Ellipse cx="9" cy="14" rx="5" ry="11" fill="#78350F" stroke="#451A03" strokeWidth="1.8" transform="rotate(-15 9 14)" />
              {/* Head */}
              <Circle cx="20" cy="21" r="13" fill="#FDE68A" stroke="#92400E" strokeWidth="2" />
              {/* Big Expressive Eye */}
              <Circle cx="17" cy="18" r="3.2" fill="#1E293B" />
              <Circle cx="15.5" cy="16.5" r="1.2" fill="#FFFFFF" />
              <Circle cx="18.5" cy="19" r="0.6" fill="#FFFFFF" />
              {/* Snout & Nose */}
              <Ellipse cx="27" cy="22" rx="3.5" ry="2.5" fill="#1E293B" />
              {/* Chomp Mouth holding left border */}
              <Path d="M16 28 Q26 34 32 27" fill="#FECDD3" stroke="#92400E" strokeWidth="1.8" />
            </Svg>
          </View>

          {/* Right: Wagging Tail & Butt */}
          <View style={[styles.anchor, { top: -4, right: mini ? -12 : -18 }]}>
            <Svg width={28 * scale} height={32 * scale} viewBox="0 0 28 32" fill="none">
              <Path d="M4 20 Q16 10 21 2 Q22 5 14 20 Z" fill="#D97706" stroke="#78350F" strokeWidth="1.8" />
              <Circle cx="8" cy="22" r="5" fill="#FDE68A" stroke="#92400E" strokeWidth="1.8" />
            </Svg>
          </View>

          {/* Running Paws */}
          <View style={[styles.anchor, { bottom: -7, left: 20 }]}>
            <Svg width={24 * scale} height={12 * scale} viewBox="0 0 24 12" fill="none">
              <Ellipse cx="6" cy="6" rx="4" ry="3" fill="#FDE68A" stroke="#92400E" strokeWidth="1.4" />
              <Ellipse cx="18" cy="6" rx="4" ry="3" fill="#FDE68A" stroke="#92400E" strokeWidth="1.4" />
            </Svg>
          </View>

          {/* Sausage Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 10 : 16,
                paddingVertical: mini ? 8 : 10,
                borderRadius: 22,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* 3. DACHSHUND (Long Sausage Dog) */
    case 'dachshund':
      return (
        <View style={styles.shellContainer}>
          {/* Left: Long Dachshund Snout & Glossy Leather Nose */}
          <View style={[styles.anchor, { top: -4, left: mini ? -18 : -26 }]}>
            <Svg width={36 * scale} height={40 * scale} viewBox="0 0 36 40" fill="none">
              {/* Droopy Long Ear */}
              <Ellipse cx="10" cy="16" rx="6" ry="14" fill="#451A03" stroke="#1C0A00" strokeWidth="1.8" transform="rotate(-10 10 16)" />
              {/* Head */}
              <Ellipse cx="19" cy="19" rx="11" ry="10" fill="#78350F" stroke="#451A03" strokeWidth="2" />
              {/* Eye */}
              <Circle cx="17" cy="16" r="2.8" fill="#1C0A00" />
              <Circle cx="16" cy="15" r="1" fill="#FFFFFF" />
              {/* Long Snout */}
              <Path d="M21 19 L32 21 L24 27 Z" fill="#58240C" />
              <Circle cx="31" cy="21" r="2" fill="#1C0A00" />
            </Svg>
          </View>

          {/* Right: Upright Perky Tail */}
          <View style={[styles.anchor, { top: -8, right: mini ? -10 : -14 }]}>
            <Svg width={22 * scale} height={28 * scale} viewBox="0 0 22 28" fill="none">
              <Path d="M4 22 Q15 14 17 3 Q19 6 9 24 Z" fill="#78350F" stroke="#451A03" strokeWidth="1.8" />
            </Svg>
          </View>

          {/* 4 Running Stubby Paws */}
          <View style={[styles.anchor, { bottom: -7, left: 16 }]}>
            <Svg width={44 * scale} height={12 * scale} viewBox="0 0 44 12" fill="none">
              <Ellipse cx="6" cy="6" rx="4" ry="3" fill="#451A03" stroke="#1C0A00" strokeWidth="1.4" />
              <Ellipse cx="16" cy="6" rx="4" ry="3" fill="#451A03" stroke="#1C0A00" strokeWidth="1.4" />
              <Ellipse cx="28" cy="6" rx="4" ry="3" fill="#451A03" stroke="#1C0A00" strokeWidth="1.4" />
              <Ellipse cx="38" cy="6" rx="4" ry="3" fill="#451A03" stroke="#1C0A00" strokeWidth="1.4" />
            </Svg>
          </View>

          {/* Long Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 10 : 16,
                paddingVertical: mini ? 8 : 10,
                borderRadius: 16,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* 4. HUNGRY FROG (The Long Stretching Tongue Border) */
    case 'hungry_frog':
      return (
        <View style={styles.shellContainer}>
          {/* Bottom-Left: Frog Shooting Tongue */}
          <View style={[styles.anchor, { bottom: mini ? -10 : -15, left: mini ? -14 : -20 }]}>
            <Svg width={42 * scale} height={42 * scale} viewBox="0 0 42 42" fill="none">
              {/* Frog Head */}
              <Circle cx="20" cy="22" r="14" fill="#22C55E" stroke="#14532D" strokeWidth="2" />
              {/* Big Frog Eyes */}
              <Circle cx="12" cy="11" r="6.5" fill="#22C55E" stroke="#14532D" strokeWidth="1.8" />
              <Circle cx="12" cy="11" r="4.5" fill="#FFFFFF" />
              <Circle cx="13.5" cy="11" r="2.2" fill="#0F172A" />

              <Circle cx="28" cy="11" r="6.5" fill="#22C55E" stroke="#14532D" strokeWidth="1.8" />
              <Circle cx="28" cy="11" r="4.5" fill="#FFFFFF" />
              <Circle cx="26.5" cy="11" r="2.2" fill="#0F172A" />
              {/* Wide Open Mouth from where tongue launches */}
              <Path d="M12 26 Q20 34 28 26 Z" fill="#881337" stroke="#14532D" strokeWidth="1.6" />
            </Svg>
          </View>

          {/* Bottom-Right: Trapped Fly on Tongue Tip */}
          <View style={[styles.anchor, { bottom: mini ? -7 : -10, right: mini ? -6 : -10 }]}>
            <Svg width={26 * scale} height={24 * scale} viewBox="0 0 26 24" fill="none">
              {/* Shiny Fly Wings */}
              <Ellipse cx="8" cy="7" rx="5" ry="3" fill="#BAE6FD" opacity={0.8} stroke="#0284C7" strokeWidth="1.2" transform="rotate(-30 8 7)" />
              <Ellipse cx="18" cy="7" rx="5" ry="3" fill="#BAE6FD" opacity={0.8} stroke="#0284C7" strokeWidth="1.2" transform="rotate(30 18 7)" />
              {/* Fly Body */}
              <Ellipse cx="13" cy="12" rx="4.5" ry="3.8" fill="#0F172A" />
              {/* Red Eyes */}
              <Circle cx="10.5" cy="11" r="1.5" fill="#EF4444" />
              <Circle cx="15.5" cy="11" r="1.5" fill="#EF4444" />
            </Svg>
          </View>

          {/* Bubble Body with Pink Tongue Underline */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                borderBottomColor: '#FB7185',
                borderBottomWidth: 4,
                paddingHorizontal: mini ? 10 : 16,
                paddingVertical: mini ? 8 : 10,
                borderRadius: 18,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* 5. DINO (The Chomping Dino Monster) */
    case 'dino':
      return (
        <View style={styles.shellContainer}>
          {/* Left: Dino Chomping Head */}
          <View style={[styles.anchor, { top: mini ? -14 : -20, left: mini ? -16 : -22 }]}>
            <Svg width={42 * scale} height={46 * scale} viewBox="0 0 42 46" fill="none">
              {/* Spikes */}
              <Path d="M10 10 L14 2 L18 10 Z" fill="#047857" />
              <Path d="M20 7 L24 0 L28 7 Z" fill="#047857" />
              {/* Dino Head */}
              <Rect x="5" y="10" width="28" height="26" rx="9" fill="#10B981" stroke="#064E3B" strokeWidth="2.2" />
              {/* Big Expressive Eye */}
              <Circle cx="15" cy="18" r="5" fill="#FFFFFF" stroke="#064E3B" strokeWidth="1.6" />
              <Circle cx="16" cy="18" r="2.5" fill="#0F172A" />
              <Circle cx="15" cy="17" r="0.9" fill="#FFFFFF" />
              {/* Chomping Jagged Teeth biting the edge */}
              <Path d="M28 22 L36 22 L31 27 L36 32 L28 32 Z" fill="#FEE2E2" stroke="#064E3B" strokeWidth="1.6" />
              <Path d="M28 22 L30 25 L32 22" fill="#FFFFFF" />
              <Path d="M28 32 L30 29 L32 32" fill="#FFFFFF" />
            </Svg>
          </View>

          {/* Top Spikes */}
          <View style={[styles.anchor, { top: -9, left: '35%' }]}>
            <Svg width={36 * scale} height={10 * scale} viewBox="0 0 36 10" fill="none">
              <Polygon points="0,10 6,0 12,10" fill="#047857" />
              <Polygon points="12,10 18,0 24,10" fill="#047857" />
              <Polygon points="24,10 30,0 36,10" fill="#047857" />
            </Svg>
          </View>

          {/* Bubble Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 10 : 16,
                paddingVertical: mini ? 8 : 10,
                borderRadius: 18,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* 6. DOGE (Doge Signboard with Thumbs Up) */
    case 'doge':
      return (
        <View style={styles.shellContainer}>
          {/* Left: Doge Thumbs Up Paw */}
          <View style={[styles.anchor, { top: -2, left: mini ? -16 : -22 }]}>
            <Svg width={32 * scale} height={36 * scale} viewBox="0 0 32 36" fill="none">
              <Path d="M14 22 L14 8 Q14 3 19 3 Q24 3 24 8 L24 17 L29 17 Q31 17 31 22 L26 31 L14 31 Z" fill="#FCD34D" stroke="#78350F" strokeWidth="1.8" />
              <Circle cx="19" cy="8" r="2" fill="#FDE68A" />
            </Svg>
          </View>

          {/* Right: Smug Doge Face */}
          <View style={[styles.anchor, { top: mini ? -14 : -20, right: mini ? -10 : -16 }]}>
            <Svg width={42 * scale} height={42 * scale} viewBox="0 0 42 42" fill="none">
              {/* Shiba Ears */}
              <Path d="M9 14 L14 2 L20 10 Z" fill="#D97706" stroke="#78350F" strokeWidth="1.8" />
              <Path d="M33 14 L28 2 L22 10 Z" fill="#D97706" stroke="#78350F" strokeWidth="1.8" />
              {/* Face */}
              <Circle cx="21" cy="22" r="14" fill="#FCD34D" stroke="#78350F" strokeWidth="2.2" />
              {/* White Mask */}
              <Ellipse cx="21" cy="27" rx="7" ry="5.5" fill="#FFFBEB" />
              {/* Suspicious Side-Eye */}
              <Circle cx="15" cy="20" r="2.8" fill="#1F2937" />
              <Circle cx="17" cy="19" r="1" fill="#FFFFFF" />
              <Circle cx="27" cy="20" r="2.8" fill="#1F2937" />
              <Circle cx="29" cy="19" r="1" fill="#FFFFFF" />
              {/* Eyebrows */}
              <Circle cx="15" cy="15" r="1.5" fill="#FFFBEB" />
              <Circle cx="27" cy="15" r="1.5" fill="#FFFBEB" />
              {/* Nose & Smug Smile */}
              <Circle cx="21" cy="25" r="1.8" fill="#1F2937" />
              <Path d="M17 28 Q21 31 25 28" stroke="#78350F" strokeWidth="1.5" fill="none" />
            </Svg>
          </View>

          {/* Bubble Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 10 : 16,
                paddingVertical: mini ? 8 : 10,
                borderRadius: 16,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* 7. CAPYBARA (Zen Onsen Hot Spring) */
    case 'capybara':
      return (
        <View style={styles.shellContainer}>
          {/* Top-Left Floating Yuzu Orange */}
          <View style={[styles.anchor, { top: -12, left: -6 }]}>
            <Svg width={24 * scale} height={24 * scale} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="13" r="7.5" fill="#F97316" stroke="#9A3412" strokeWidth="1.5" />
              <Path d="M12 6 Q13 2 16 3" stroke="#15803D" strokeWidth="1.5" fill="none" />
            </Svg>
          </View>

          {/* Top-Right Zen Capybara */}
          <View style={[styles.anchor, { top: mini ? -14 : -22, right: mini ? -8 : -14 }]}>
            <Svg width={42 * scale} height={40 * scale} viewBox="0 0 42 40" fill="none">
              {/* Head */}
              <Rect x="8" y="10" width="26" height="23" rx="10" fill="#A87343" stroke="#451A03" strokeWidth="2.2" />
              {/* Ears */}
              <Circle cx="8" cy="11" r="3.5" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
              <Circle cx="34" cy="11" r="3.5" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
              {/* Satsuma Orange on Head */}
              <Circle cx="21" cy="5" r="5" fill="#F97316" stroke="#9A3412" strokeWidth="1.5" />
              <Path d="M21 0 Q22 -1 24 0" stroke="#15803D" strokeWidth="1.5" fill="none" />
              {/* Zen Closed Eyes */}
              <Path d="M13 19 L18 19" stroke="#1C0A00" strokeWidth="2.2" strokeLinecap="round" />
              <Path d="M24 19 L29 19" stroke="#1C0A00" strokeWidth="2.2" strokeLinecap="round" />
              {/* Snout */}
              <Ellipse cx="21" cy="26" rx="5.5" ry="3.8" fill="#78350F" />
              <Circle cx="19" cy="25.5" r="1" fill="#1C0A00" />
              <Circle cx="23" cy="25.5" r="1" fill="#1C0A00" />
            </Svg>
          </View>

          {/* Bubble Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 10 : 16,
                paddingVertical: mini ? 8 : 10,
                borderRadius: 18,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* 8. CAT DOG (Stretching Sleeping Friends) */
    case 'cat_dog':
      return (
        <View style={styles.shellContainer}>
          {/* Top-Left Sleeping Tabby Cat */}
          <View style={[styles.anchor, { top: mini ? -12 : -18, left: mini ? -8 : -14 }]}>
            <Svg width={42 * scale} height={32 * scale} viewBox="0 0 42 32" fill="none">
              {/* Ears */}
              <Path d="M7 14 L12 2 L18 10 Z" fill="#FB923C" stroke="#9A3412" strokeWidth="1.5" />
              <Path d="M31 14 L26 2 L20 10 Z" fill="#FB923C" stroke="#9A3412" strokeWidth="1.5" />
              {/* Face */}
              <Circle cx="19" cy="18" r="12" fill="#FED7AA" stroke="#9A3412" strokeWidth="2" />
              {/* Sleeping Eyes */}
              <Path d="M12 17 Q15 14 17 17" stroke="#7C2D12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <Path d="M21 17 Q23 14 26 17" stroke="#7C2D12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              {/* Whiskers */}
              <Path d="M7 19 L12 20" stroke="#7C2D12" strokeWidth="1.2" />
              <Path d="M31 19 L26 20" stroke="#7C2D12" strokeWidth="1.2" />
            </Svg>
          </View>

          {/* Top-Right Happy Puppy */}
          <View style={[styles.anchor, { top: mini ? -12 : -18, right: mini ? -8 : -14 }]}>
            <Svg width={40 * scale} height={32 * scale} viewBox="0 0 40 32" fill="none">
              {/* Floppy Ears */}
              <Ellipse cx="7" cy="16" rx="4" ry="8" fill="#92400E" stroke="#78350F" strokeWidth="1.5" transform="rotate(-15 7 16)" />
              <Ellipse cx="33" cy="16" rx="4" ry="8" fill="#92400E" stroke="#78350F" strokeWidth="1.5" transform="rotate(15 33 16)" />
              {/* Head */}
              <Circle cx="20" cy="18" r="12" fill="#FDE68A" stroke="#92400E" strokeWidth="2" />
              {/* Eyes */}
              <Circle cx="15" cy="16" r="2.2" fill="#1F2937" />
              <Circle cx="25" cy="16" r="2.2" fill="#1F2937" />
              {/* Snout & Tongue */}
              <Ellipse cx="20" cy="22" rx="4" ry="3" fill="#FFFFFF" />
              <Circle cx="20" cy="21" r="1.5" fill="#1F2937" />
              <Path d="M20 23 Q21 27 22 25" fill="#F43F5E" />
            </Svg>
          </View>

          {/* Bubble Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 10 : 16,
                paddingVertical: mini ? 8 : 10,
                borderRadius: 18,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* 9. PIG SHARK (Pastel Underwater Duo) */
    case 'pig_shark':
      return (
        <View style={styles.shellContainer}>
          {/* Bottom-Left Pink Pig */}
          <View style={[styles.anchor, { bottom: mini ? -10 : -16, left: mini ? -8 : -14 }]}>
            <Svg width={36 * scale} height={36 * scale} viewBox="0 0 36 36" fill="none">
              {/* Ears */}
              <Path d="M7 12 L12 2 L17 11 Z" fill="#F472B6" stroke="#9D174D" strokeWidth="1.5" />
              <Path d="M29 12 L24 2 L19 11 Z" fill="#F472B6" stroke="#9D174D" strokeWidth="1.5" />
              {/* Head */}
              <Circle cx="18" cy="19" r="12" fill="#FBCFE8" stroke="#9D174D" strokeWidth="2" />
              {/* Eyes */}
              <Circle cx="13" cy="16" r="2.2" fill="#1F2937" />
              <Circle cx="23" cy="16" r="2.2" fill="#1F2937" />
              {/* Snout */}
              <Ellipse cx="18" cy="22" rx="5" ry="3.5" fill="#F472B6" stroke="#9D174D" strokeWidth="1.5" />
              <Circle cx="16" cy="22" r="1.2" fill="#831843" />
              <Circle cx="20" cy="22" r="1.2" fill="#831843" />
            </Svg>
          </View>

          {/* Bottom-Right Blue Shark */}
          <View style={[styles.anchor, { bottom: mini ? -10 : -16, right: mini ? -8 : -14 }]}>
            <Svg width={38 * scale} height={36 * scale} viewBox="0 0 38 36" fill="none">
              {/* Fin */}
              <Path d="M19 2 Q24 9 26 14 L12 14 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.5" />
              {/* Body */}
              <Ellipse cx="19" cy="22" rx="13" ry="10" fill="#7DD3FC" stroke="#0369A1" strokeWidth="2" />
              {/* Belly */}
              <Ellipse cx="19" cy="26" rx="9" ry="5" fill="#F0F9FF" />
              {/* Eye */}
              <Circle cx="12" cy="20" r="2.2" fill="#0F172A" />
              <Circle cx="11.5" cy="19.5" r="0.7" fill="#FFFFFF" />
            </Svg>
          </View>

          {/* Bubble Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 10 : 16,
                paddingVertical: mini ? 8 : 10,
                borderRadius: 18,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* DEFAULT (Classic Crisp Clean Bubble) */
    default:
      return (
        <View
          style={[
            styles.bubbleBase,
            {
              backgroundColor,
              borderColor,
              paddingHorizontal: mini ? 8 : 14,
              paddingVertical: mini ? 6 : 8,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              borderBottomLeftRadius: isMe ? 18 : 4,
              borderBottomRightRadius: isMe ? 4 : 18,
            },
          ]}
        >
          {children}
        </View>
      );
  }
};

const styles = StyleSheet.create({
  shellContainer: {
    position: 'relative',
    overflow: 'visible',
  },
  anchor: {
    position: 'absolute',
    zIndex: 20,
    pointerEvents: 'none',
  },
  bubbleBase: {
    borderWidth: 1.5,
    minWidth: 40,
    justifyContent: 'center',
  },
});
