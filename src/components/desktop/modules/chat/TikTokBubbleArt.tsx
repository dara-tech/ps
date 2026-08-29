import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Ellipse, G, Polygon } from 'react-native-svg';

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
 * Creative Illustrated Frame Shells for TikTok Custom Chat Bubbles
 * Transforms the entire message bubble into a living character scene!
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
  const scale = mini ? 0.6 : 1;

  switch (bubbleId) {
    /* 1. FROG CHICK (The Bathtub / Water Pond) */
    case 'frog_chick':
      return (
        <View style={styles.shellContainer}>
          {/* Top-Left Swimming Frog */}
          <View style={[styles.anchor, { top: mini ? -12 : -18, left: mini ? -6 : -10 }]}>
            <Svg width={36 * scale} height={28 * scale} viewBox="0 0 36 28" fill="none">
              {/* Frog Body peeking over rim */}
              <Ellipse cx="18" cy="18" rx="14" ry="9" fill="#4ADE80" stroke="#166534" strokeWidth="1.8" />
              {/* Eyes */}
              <Circle cx="10" cy="9" r="6.5" fill="#4ADE80" stroke="#166534" strokeWidth="1.8" />
              <Circle cx="10" cy="9" r="4.5" fill="#FFFFFF" />
              <Circle cx="11" cy="9" r="2.2" fill="#0F172A" />
              <Circle cx="9.5" cy="7.5" r="0.9" fill="#FFFFFF" />

              <Circle cx="26" cy="9" r="6.5" fill="#4ADE80" stroke="#166534" strokeWidth="1.8" />
              <Circle cx="26" cy="9" r="4.5" fill="#FFFFFF" />
              <Circle cx="25" cy="9" r="2.2" fill="#0F172A" />
              <Circle cx="23.5" cy="7.5" r="0.9" fill="#FFFFFF" />
              {/* Cheeks */}
              <Circle cx="8" cy="19" r="2.2" fill="#F472B6" opacity={0.6} />
              <Circle cx="28" cy="19" r="2.2" fill="#F472B6" opacity={0.6} />
              {/* Smile */}
              <Path d="M14 20 Q18 23 22 20" stroke="#166534" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              {/* Paws grasping the rim */}
              <Ellipse cx="9" cy="24" rx="4" ry="2.2" fill="#22C55E" stroke="#166534" strokeWidth="1.5" />
              <Ellipse cx="27" cy="24" rx="4" ry="2.2" fill="#22C55E" stroke="#166534" strokeWidth="1.5" />
            </Svg>
          </View>

          {/* Top-Right Bathing Chick */}
          <View style={[styles.anchor, { top: mini ? -12 : -18, right: mini ? -6 : -10 }]}>
            <Svg width={34 * scale} height={28 * scale} viewBox="0 0 34 28" fill="none">
              {/* Chick head */}
              <Circle cx="17" cy="16" r="11" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.8" />
              {/* Hair Tuft */}
              <Path d="M17 5 Q15 1 14 3 Q17 4 17 5" fill="#FACC15" />
              <Path d="M17 5 Q19 1 20 3 Q17 4 17 5" fill="#FACC15" />
              {/* Eyes */}
              <Circle cx="12" cy="14" r="2.2" fill="#0F172A" />
              <Circle cx="22" cy="14" r="2.2" fill="#0F172A" />
              {/* Beak */}
              <Path d="M14 16 L20 16 L17 21 Z" fill="#F97316" stroke="#C2410C" strokeWidth="1" />
              {/* Wings clutching rim */}
              <Ellipse cx="6" cy="20" rx="3" ry="2" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.2" />
              <Ellipse cx="28" cy="20" rx="3" ry="2" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.2" />
            </Svg>
          </View>

          {/* Bottom-Right Water Foam Bubbles */}
          <View style={[styles.anchor, { bottom: mini ? -8 : -12, right: mini ? -4 : -8 }]}>
            <Svg width={38 * scale} height={24 * scale} viewBox="0 0 38 24" fill="none">
              <Circle cx="10" cy="14" r="7" fill="#38BDF8" opacity={0.6} stroke="#0284C7" strokeWidth="1.5" />
              <Circle cx="8" cy="11" r="2" fill="#FFFFFF" opacity={0.8} />
              <Circle cx="24" cy="10" r="5.5" fill="#38BDF8" opacity={0.7} stroke="#0284C7" strokeWidth="1.5" />
              <Circle cx="22" cy="8" r="1.5" fill="#FFFFFF" opacity={0.8} />
              <Circle cx="32" cy="16" r="4" fill="#7DD3FC" opacity={0.6} stroke="#0284C7" strokeWidth="1.2" />
            </Svg>
          </View>

          {/* Main Bubble Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingTop: mini ? 6 : 10,
                paddingBottom: mini ? 6 : 8,
                paddingHorizontal: mini ? 8 : 14,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                borderBottomLeftRadius: isMe ? 18 : 4,
                borderBottomRightRadius: isMe ? 4 : 18,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* 2. HUNGRY DOG (The Sausage Dog Clamping the Bubble) */
    case 'hungry_dog':
      return (
        <View style={styles.shellContainer}>
          {/* Left: Dog Head Biting the Border */}
          <View style={[styles.anchor, { top: -4, left: mini ? -14 : -22 }]}>
            <Svg width={30 * scale} height={36 * scale} viewBox="0 0 30 36" fill="none">
              {/* Dog Ear */}
              <Ellipse cx="7" cy="12" rx="4" ry="9" fill="#92400E" stroke="#78350F" strokeWidth="1.5" transform="rotate(-15 7 12)" />
              {/* Dog Head */}
              <Circle cx="16" cy="18" r="11" fill="#FDE68A" stroke="#B45309" strokeWidth="1.8" />
              {/* Eye looking hungry */}
              <Circle cx="14" cy="16" r="2.2" fill="#1F2937" />
              <Circle cx="13" cy="15" r="0.7" fill="#FFFFFF" />
              {/* Nose */}
              <Ellipse cx="22" cy="18" rx="2.5" ry="1.8" fill="#1F2937" />
              {/* Jaw Clamping Left Edge */}
              <Path d="M14 24 Q22 28 26 23" fill="#FECDD3" stroke="#B45309" strokeWidth="1.5" />
            </Svg>
          </View>

          {/* Right: Dog Tail / Butt */}
          <View style={[styles.anchor, { top: -2, right: mini ? -10 : -16 }]}>
            <Svg width={24 * scale} height={28 * scale} viewBox="0 0 24 28" fill="none">
              {/* Wagging Tail */}
              <Path d="M4 18 Q14 10 18 4 Q19 6 12 18 Z" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
              {/* Rear Paw */}
              <Ellipse cx="8" cy="22" rx="4" ry="3" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
            </Svg>
          </View>

          {/* Bottom Running Paws */}
          <View style={[styles.anchor, { bottom: -6, left: 16 }]}>
            <Svg width={18 * scale} height={10 * scale} viewBox="0 0 18 10" fill="none">
              <Ellipse cx="6" cy="5" rx="3.5" ry="2.5" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
              <Ellipse cx="14" cy="5" rx="3.5" ry="2.5" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
            </Svg>
          </View>

          {/* Sausage Bubble Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 8 : 14,
                paddingVertical: mini ? 6 : 8,
                borderRadius: 20,
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
          {/* Left: Long Dog Snout & Droopy Ear */}
          <View style={[styles.anchor, { top: -4, left: mini ? -14 : -22 }]}>
            <Svg width={28 * scale} height={34 * scale} viewBox="0 0 28 34" fill="none">
              {/* Droopy Long Ear */}
              <Ellipse cx="8" cy="14" rx="5" ry="12" fill="#583B1F" stroke="#38220F" strokeWidth="1.5" transform="rotate(-10 8 14)" />
              {/* Head */}
              <Ellipse cx="15" cy="16" rx="9" ry="8" fill="#8C582B" stroke="#583B1F" strokeWidth="1.8" />
              {/* Eye */}
              <Circle cx="14" cy="14" r="2.2" fill="#1F2937" />
              <Circle cx="13" cy="13" r="0.7" fill="#FFFFFF" />
              {/* Snout */}
              <Path d="M16 16 L24 18 L18 22 Z" fill="#583B1F" />
              <Circle cx="23" cy="18" r="1.5" fill="#1F2937" />
            </Svg>
          </View>

          {/* Right: Perky Upright Tail */}
          <View style={[styles.anchor, { top: -6, right: mini ? -8 : -12 }]}>
            <Svg width={18 * scale} height={24 * scale} viewBox="0 0 18 24" fill="none">
              <Path d="M4 18 Q12 12 14 4 Q15 6 8 20 Z" fill="#8C582B" stroke="#583B1F" strokeWidth="1.5" />
            </Svg>
          </View>

          {/* Bottom 4 Stubby Paws */}
          <View style={[styles.anchor, { bottom: -6, left: 14 }]}>
            <Svg width={36 * scale} height={10 * scale} viewBox="0 0 36 10" fill="none">
              <Ellipse cx="6" cy="5" rx="3.5" ry="2.5" fill="#583B1F" stroke="#38220F" strokeWidth="1.2" />
              <Ellipse cx="14" cy="5" rx="3.5" ry="2.5" fill="#583B1F" stroke="#38220F" strokeWidth="1.2" />
              <Ellipse cx="24" cy="5" rx="3.5" ry="2.5" fill="#583B1F" stroke="#38220F" strokeWidth="1.2" />
              <Ellipse cx="32" cy="5" rx="3.5" ry="2.5" fill="#583B1F" stroke="#38220F" strokeWidth="1.2" />
            </Svg>
          </View>

          {/* Long Dog Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 8 : 14,
                paddingVertical: mini ? 6 : 8,
                borderRadius: 14,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* 4. HUNGRY FROG (The Long Tongue Bottom Border) */
    case 'hungry_frog':
      return (
        <View style={styles.shellContainer}>
          {/* Bottom-Left: Big Mouth Frog */}
          <View style={[styles.anchor, { bottom: mini ? -8 : -12, left: mini ? -10 : -16 }]}>
            <Svg width={34 * scale} height={34 * scale} viewBox="0 0 34 34" fill="none">
              {/* Frog Head */}
              <Circle cx="16" cy="18" r="11" fill="#4ADE80" stroke="#166534" strokeWidth="1.8" />
              {/* Big Frog Eyes */}
              <Circle cx="10" cy="9" r="5" fill="#4ADE80" stroke="#166534" strokeWidth="1.5" />
              <Circle cx="10" cy="9" r="3.5" fill="#FFFFFF" />
              <Circle cx="11" cy="9" r="1.8" fill="#0F172A" />

              <Circle cx="22" cy="9" r="5" fill="#4ADE80" stroke="#166534" strokeWidth="1.5" />
              <Circle cx="22" cy="9" r="3.5" fill="#FFFFFF" />
              <Circle cx="21" cy="9" r="1.8" fill="#0F172A" />

              {/* Wide Open Mouth from where tongue launches */}
              <Path d="M10 22 Q18 28 26 22 Z" fill="#881337" stroke="#166534" strokeWidth="1.2" />
            </Svg>
          </View>

          {/* Bottom-Right: Trapped Fly on Tongue Tip */}
          <View style={[styles.anchor, { bottom: mini ? -6 : -8, right: mini ? -4 : -8 }]}>
            <Svg width={22 * scale} height={20 * scale} viewBox="0 0 22 20" fill="none">
              {/* Little Fly Wings */}
              <Ellipse cx="7" cy="6" rx="4" ry="2.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1" transform="rotate(-30 7 6)" />
              <Ellipse cx="15" cy="6" rx="4" ry="2.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1" transform="rotate(30 15 6)" />
              {/* Fly Body */}
              <Ellipse cx="11" cy="10" rx="3.5" ry="3" fill="#1E293B" />
              <Circle cx="9" cy="9" r="1" fill="#EF4444" />
              <Circle cx="13" cy="9" r="1" fill="#EF4444" />
            </Svg>
          </View>

          {/* Main Bubble Body with Pink Tongue Underline */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                borderBottomColor: '#FB7185',
                borderBottomWidth: 3,
                paddingHorizontal: mini ? 8 : 14,
                paddingVertical: mini ? 6 : 8,
                borderRadius: 16,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* 5. DINO (The Chomping Tyrannosaurus) */
    case 'dino':
      return (
        <View style={styles.shellContainer}>
          {/* Left: Big Dino Head Chomping on Bubble */}
          <View style={[styles.anchor, { top: mini ? -12 : -16, left: mini ? -12 : -18 }]}>
            <Svg width={34 * scale} height={38 * scale} viewBox="0 0 34 38" fill="none">
              {/* Spikes */}
              <Path d="M8 8 L11 2 L14 8 Z" fill="#047857" />
              <Path d="M16 6 L19 1 L22 6 Z" fill="#047857" />
              {/* Dino Head */}
              <Rect x="4" y="8" width="22" height="22" rx="7" fill="#34D399" stroke="#065F46" strokeWidth="1.8" />
              {/* Eye */}
              <Circle cx="12" cy="15" r="4" fill="#FFFFFF" stroke="#065F46" strokeWidth="1.2" />
              <Circle cx="13" cy="15" r="2" fill="#0F172A" />
              <Circle cx="12" cy="14" r="0.6" fill="#FFFFFF" />
              {/* Chomping Sharp Teeth */}
              <Path d="M22 18 L28 18 L24 22 L28 26 L22 26 Z" fill="#FEE2E2" stroke="#065F46" strokeWidth="1.2" />
              <Path d="M22 18 L24 21 L26 18" fill="#FFFFFF" />
              <Path d="M22 26 L24 23 L26 26" fill="#FFFFFF" />
            </Svg>
          </View>

          {/* Top Spikes along bubble top edge */}
          <View style={[styles.anchor, { top: -7, left: '35%' }]}>
            <Svg width={30 * scale} height={8 * scale} viewBox="0 0 30 8" fill="none">
              <Polygon points="0,8 5,0 10,8" fill="#10B981" />
              <Polygon points="10,8 15,0 20,8" fill="#10B981" />
              <Polygon points="20,8 25,0 30,8" fill="#10B981" />
            </Svg>
          </View>

          {/* Main Bubble Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 8 : 14,
                paddingVertical: mini ? 6 : 8,
                borderRadius: 16,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* 6. DOGE (Doge Thumbs-Up Signboard) */
    case 'doge':
      return (
        <View style={styles.shellContainer}>
          {/* Left: Doge Thumbs Up Paw */}
          <View style={[styles.anchor, { top: -2, left: mini ? -12 : -18 }]}>
            <Svg width={26 * scale} height={30 * scale} viewBox="0 0 26 30" fill="none">
              {/* Thumbs Up Hand */}
              <Path d="M12 18 L12 6 Q12 2 16 2 Q20 2 20 6 L20 14 L24 14 Q26 14 26 18 L22 26 L12 26 Z" fill="#FCD34D" stroke="#92400E" strokeWidth="1.5" />
              <Circle cx="16" cy="6" r="1.5" fill="#FDE68A" />
            </Svg>
          </View>

          {/* Right: Smug Doge Face */}
          <View style={[styles.anchor, { top: mini ? -12 : -18, right: mini ? -8 : -14 }]}>
            <Svg width={36 * scale} height={36 * scale} viewBox="0 0 36 36" fill="none">
              {/* Shiba Ears */}
              <Path d="M8 12 L12 2 L17 9 Z" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
              <Path d="M28 12 L24 2 L19 9 Z" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
              {/* Face */}
              <Circle cx="18" cy="19" r="12" fill="#FCD34D" stroke="#92400E" strokeWidth="1.8" />
              {/* White Mask */}
              <Ellipse cx="18" cy="23" rx="6" ry="4.5" fill="#FFFBEB" />
              {/* Side Eye */}
              <Circle cx="13" cy="17" r="2.2" fill="#1F2937" />
              <Circle cx="14.5" cy="16" r="0.8" fill="#FFFFFF" />
              <Circle cx="23" cy="17" r="2.2" fill="#1F2937" />
              <Circle cx="24.5" cy="16" r="0.8" fill="#FFFFFF" />
              {/* Eyebrow dots */}
              <Circle cx="13" cy="13" r="1.2" fill="#FFFBEB" />
              <Circle cx="23" cy="13" r="1.2" fill="#FFFBEB" />
              {/* Nose & Smile */}
              <Circle cx="18" cy="21" r="1.5" fill="#1F2937" />
              <Path d="M15 24 Q18 26 21 24" stroke="#78350F" strokeWidth="1.2" fill="none" />
            </Svg>
          </View>

          {/* Main Bubble Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 8 : 14,
                paddingVertical: mini ? 6 : 8,
                borderRadius: 14,
              },
            ]}
          >
            {children}
          </View>
        </View>
      );

    /* 7. CAPYBARA (The Onsen Hot Spring) */
    case 'capybara':
      return (
        <View style={styles.shellContainer}>
          {/* Top-Left Floating Yuzu Orange */}
          <View style={[styles.anchor, { top: -10, left: -4 }]}>
            <Svg width={20 * scale} height={20 * scale} viewBox="0 0 20 20" fill="none">
              <Circle cx="10" cy="11" r="6" fill="#F97316" stroke="#C2410C" strokeWidth="1.2" />
              <Path d="M10 5 Q11 2 13 3" stroke="#15803D" strokeWidth="1.2" fill="none" />
            </Svg>
          </View>

          {/* Top-Right Zen Capybara with Orange */}
          <View style={[styles.anchor, { top: mini ? -12 : -18, right: mini ? -6 : -12 }]}>
            <Svg width={36 * scale} height={34 * scale} viewBox="0 0 36 34" fill="none">
              {/* Head */}
              <Rect x="7" y="9" width="22" height="19" rx="8" fill="#A87343" stroke="#583B1F" strokeWidth="1.8" />
              {/* Ears */}
              <Circle cx="7" cy="10" r="3" fill="#784C25" stroke="#583B1F" strokeWidth="1.2" />
              <Circle cx="29" cy="10" r="3" fill="#784C25" stroke="#583B1F" strokeWidth="1.2" />
              {/* Orange on head */}
              <Circle cx="18" cy="5" r="4" fill="#F97316" stroke="#C2410C" strokeWidth="1.2" />
              <Path d="M18 1 Q19 0 20 1" stroke="#15803D" strokeWidth="1" fill="none" />
              {/* Calm Closed Eyes */}
              <Path d="M11 17 L15 17" stroke="#38220F" strokeWidth="1.8" strokeLinecap="round" />
              <Path d="M21 17 L25 17" stroke="#38220F" strokeWidth="1.8" strokeLinecap="round" />
              {/* Snout */}
              <Ellipse cx="18" cy="22" rx="4.5" ry="3" fill="#784C25" />
              <Circle cx="16.5" cy="21.5" r="0.8" fill="#29180B" />
              <Circle cx="19.5" cy="21.5" r="0.8" fill="#29180B" />
            </Svg>
          </View>

          {/* Main Bubble Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 8 : 14,
                paddingVertical: mini ? 6 : 8,
                borderRadius: 16,
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
          {/* Top-Left Sleeping Cat Curled Over Rim */}
          <View style={[styles.anchor, { top: mini ? -10 : -16, left: mini ? -6 : -10 }]}>
            <Svg width={36 * scale} height={26 * scale} viewBox="0 0 36 26" fill="none">
              {/* Ears */}
              <Path d="M6 12 L10 2 L15 9 Z" fill="#FB923C" stroke="#C2410C" strokeWidth="1.2" />
              <Path d="M26 12 L22 2 L17 9 Z" fill="#FB923C" stroke="#C2410C" strokeWidth="1.2" />
              {/* Face */}
              <Circle cx="16" cy="15" r="10" fill="#FED7AA" stroke="#C2410C" strokeWidth="1.6" />
              {/* Sleeping Eyes */}
              <Path d="M10 14 Q12 12 14 14" stroke="#7C2D12" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <Path d="M18 14 Q20 12 22 14" stroke="#7C2D12" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              {/* Whiskers */}
              <Path d="M6 16 L10 17" stroke="#9A3412" strokeWidth="1" />
              <Path d="M26 16 L22 17" stroke="#9A3412" strokeWidth="1" />
            </Svg>
          </View>

          {/* Top-Right Happy Puppy */}
          <View style={[styles.anchor, { top: mini ? -10 : -16, right: mini ? -6 : -10 }]}>
            <Svg width={34 * scale} height={26 * scale} viewBox="0 0 34 26" fill="none">
              {/* Floppy Ears */}
              <Ellipse cx="6" cy="14" rx="3.5" ry="7" fill="#92400E" stroke="#78350F" strokeWidth="1.2" transform="rotate(-15 6 14)" />
              <Ellipse cx="28" cy="14" rx="3.5" ry="7" fill="#92400E" stroke="#78350F" strokeWidth="1.2" transform="rotate(15 28 14)" />
              {/* Head */}
              <Circle cx="17" cy="15" r="10" fill="#FDE68A" stroke="#B45309" strokeWidth="1.6" />
              {/* Eyes */}
              <Circle cx="13" cy="13" r="1.8" fill="#1F2937" />
              <Circle cx="21" cy="13" r="1.8" fill="#1F2937" />
              {/* Snout & Tongue */}
              <Ellipse cx="17" cy="18" rx="3.5" ry="2.5" fill="#FFFFFF" />
              <Circle cx="17" cy="17" r="1.2" fill="#1F2937" />
              <Path d="M17 19 Q18 22 19 21" fill="#F43F5E" />
            </Svg>
          </View>

          {/* Main Bubble Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 8 : 14,
                paddingVertical: mini ? 6 : 8,
                borderRadius: 16,
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
          {/* Bottom-Left Little Pig */}
          <View style={[styles.anchor, { bottom: mini ? -8 : -14, left: mini ? -6 : -12 }]}>
            <Svg width={30 * scale} height={30 * scale} viewBox="0 0 30 30" fill="none">
              {/* Ears */}
              <Path d="M6 10 L10 2 L14 9 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="1.2" />
              <Path d="M24 10 L20 2 L16 9 Z" fill="#F472B6" stroke="#BE185D" strokeWidth="1.2" />
              {/* Head */}
              <Circle cx="15" cy="16" r="10" fill="#FBCFE8" stroke="#BE185D" strokeWidth="1.6" />
              {/* Eyes */}
              <Circle cx="11" cy="13" r="1.8" fill="#1F2937" />
              <Circle cx="19" cy="13" r="1.8" fill="#1F2937" />
              {/* Snout */}
              <Ellipse cx="15" cy="18" rx="4" ry="2.8" fill="#F472B6" stroke="#BE185D" strokeWidth="1.2" />
              <Circle cx="13.5" cy="18" r="1" fill="#831843" />
              <Circle cx="16.5" cy="18" r="1" fill="#831843" />
            </Svg>
          </View>

          {/* Bottom-Right Blue Shark */}
          <View style={[styles.anchor, { bottom: mini ? -8 : -14, right: mini ? -6 : -12 }]}>
            <Svg width={32 * scale} height={30 * scale} viewBox="0 0 32 30" fill="none">
              {/* Fin */}
              <Path d="M16 2 Q20 8 22 12 L10 12 Z" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.2" />
              {/* Body */}
              <Ellipse cx="16" cy="18" rx="11" ry="8" fill="#7DD3FC" stroke="#0369A1" strokeWidth="1.6" />
              {/* Belly */}
              <Ellipse cx="16" cy="21" rx="8" ry="4" fill="#F0F9FF" />
              {/* Eye */}
              <Circle cx="10" cy="16" r="1.8" fill="#0F172A" />
              <Circle cx="9.5" cy="15.5" r="0.5" fill="#FFFFFF" />
            </Svg>
          </View>

          {/* Main Bubble Body */}
          <View
            style={[
              styles.bubbleBase,
              {
                backgroundColor,
                borderColor,
                paddingHorizontal: mini ? 8 : 14,
                paddingVertical: mini ? 6 : 8,
                borderRadius: 16,
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
              paddingHorizontal: mini ? 8 : 12,
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
