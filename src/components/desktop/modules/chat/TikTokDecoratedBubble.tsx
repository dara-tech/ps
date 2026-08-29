import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { TikTokBubbleId, TIKTOK_BUBBLE_PRESETS } from '../../../../styles/theme';
import { TikTokCharacterArt } from './TikTokBubbleArt';

interface TikTokDecoratedBubbleProps {
  bubbleId: TikTokBubbleId;
  isMe?: boolean;
  backgroundColor: string;
  borderColor: string;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  mini?: boolean;
}

export const TikTokDecoratedBubble: React.FC<TikTokDecoratedBubbleProps> = ({
  bubbleId,
  isMe = true,
  backgroundColor,
  borderColor,
  children,
  style,
  mini = false,
}) => {
  const preset = TIKTOK_BUBBLE_PRESETS.find((p) => p.id === bubbleId);
  const size = mini ? 18 : 28;

  // Determine character art keys based on preset
  let topLeftArt: string | null = null;
  let topRightArt: string | null = null;
  let bottomLeftArt: string | null = null;
  let bottomRightArt: string | null = null;

  if (bubbleId === 'frog_chick') {
    topLeftArt = 'frog_head';
    topRightArt = 'chick_head';
    bottomRightArt = 'bubbles';
  } else if (bubbleId === 'cat_dog') {
    topLeftArt = 'cat';
    topRightArt = 'dog';
  } else if (bubbleId === 'capybara') {
    topLeftArt = 'capybara';
    topRightArt = 'bubbles';
  } else if (bubbleId === 'doge') {
    topLeftArt = 'doge';
    topRightArt = 'dog';
  } else if (bubbleId === 'heart_pepe') {
    topLeftArt = 'heart_pepe';
    topRightArt = 'frog_head';
  } else if (bubbleId === 'pig_shark') {
    bottomLeftArt = 'pig';
    bottomRightArt = 'shark';
  } else if (bubbleId === 'dino') {
    topLeftArt = 'dino';
  }

  // Calculate safe insets
  const safePaddingTop = topLeftArt || topRightArt ? (mini ? 4 : 8) : mini ? 4 : 6;
  const safePaddingBottom = bottomLeftArt || bottomRightArt ? (mini ? 4 : 6) : mini ? 4 : 6;

  return (
    <View style={[styles.wrapper, { zIndex: 1 }]}>
      {/* Top Left Overhang Character Badge */}
      {Boolean(topLeftArt) && (
        <View style={[styles.decorTopLeft, mini && styles.decorTopLeftMini]}>
          <TikTokCharacterArt type={topLeftArt!} size={size} />
        </View>
      )}

      {/* Top Right Overhang Character Badge */}
      {Boolean(topRightArt) && (
        <View style={[styles.decorTopRight, mini && styles.decorTopRightMini]}>
          <TikTokCharacterArt type={topRightArt!} size={size} />
        </View>
      )}

      {/* Bottom Left Overhang Character Badge */}
      {Boolean(bottomLeftArt) && (
        <View style={[styles.decorBottomLeft, mini && styles.decorBottomLeftMini]}>
          <TikTokCharacterArt type={bottomLeftArt!} size={size} />
        </View>
      )}

      {/* Bottom Right Overhang Character Badge */}
      {Boolean(bottomRightArt) && (
        <View style={[styles.decorBottomRight, mini && styles.decorBottomRightMini]}>
          <TikTokCharacterArt type={bottomRightArt!} size={size} />
        </View>
      )}

      {/* Main Scalable Bubble Body */}
      <View
        style={[
          styles.bubbleBody,
          {
            backgroundColor,
            borderColor,
            paddingTop: safePaddingTop,
            paddingBottom: safePaddingBottom,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            borderBottomLeftRadius: isMe ? 18 : 4,
            borderBottomRightRadius: isMe ? 4 : 18,
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'visible',
  },
  bubbleBody: {
    paddingHorizontal: 12,
    borderWidth: 1.5,
    minWidth: 40,
    justifyContent: 'center',
  },
  decorTopLeft: {
    position: 'absolute',
    top: -15,
    left: -8,
    zIndex: 10,
    pointerEvents: 'none',
  },
  decorTopLeftMini: {
    top: -10,
    left: -5,
  },
  decorTopRight: {
    position: 'absolute',
    top: -15,
    right: -8,
    zIndex: 10,
    pointerEvents: 'none',
  },
  decorTopRightMini: {
    top: -10,
    right: -5,
  },
  decorBottomLeft: {
    position: 'absolute',
    bottom: -12,
    left: -8,
    zIndex: 10,
    pointerEvents: 'none',
  },
  decorBottomLeftMini: {
    bottom: -8,
    left: -5,
  },
  decorBottomRight: {
    position: 'absolute',
    bottom: -12,
    right: -8,
    zIndex: 10,
    pointerEvents: 'none',
  },
  decorBottomRightMini: {
    bottom: -8,
    right: -5,
  },
});
