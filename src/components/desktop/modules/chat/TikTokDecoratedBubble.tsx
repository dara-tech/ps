import React from 'react';
import { ViewStyle } from 'react-native';
import { TikTokBubbleId } from '../../../../styles/theme';
import { TikTokCreativeShell } from './TikTokBubbleArt';

interface TikTokDecoratedBubbleProps {
  bubbleId: TikTokBubbleId;
  isMe?: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor?: string;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  mini?: boolean;
}

export const TikTokDecoratedBubble: React.FC<TikTokDecoratedBubbleProps> = ({
  bubbleId,
  isMe = true,
  backgroundColor,
  borderColor,
  textColor = '#0F172A',
  children,
  mini = false,
}) => {
  return (
    <TikTokCreativeShell
      bubbleId={bubbleId}
      isMe={isMe}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      textColor={textColor}
      mini={mini}
    >
      {children}
    </TikTokCreativeShell>
  );
};
