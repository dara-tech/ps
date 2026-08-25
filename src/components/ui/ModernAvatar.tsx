import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface ModernAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  showPresence?: boolean;
  isOnline?: boolean;
}

const GRADIENTS = [
  { bg: '#0284C7', text: '#FFFFFF' },
  { bg: '#0F172A', text: '#FFFFFF' },
  { bg: '#2563EB', text: '#FFFFFF' },
  { bg: '#059669', text: '#FFFFFF' },
  { bg: '#7C3AED', text: '#FFFFFF' },
  { bg: '#D97706', text: '#FFFFFF' },
  { bg: '#475569', text: '#FFFFFF' },
];

export const ModernAvatar: React.FC<ModernAvatarProps> = ({
  name,
  avatarUrl,
  size = 22,
  showPresence = false,
  isOnline = true,
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [avatarUrl]);

  const charCode = (name || 'User').charCodeAt(0);
  const colorScheme = GRADIENTS[charCode % GRADIENTS.length];
  const initial = (name || 'U').charAt(0).toUpperCase();

  const fontSize = Math.max(9, Math.round(size * 0.42));
  const dotSize = Math.max(5, Math.round(size * 0.28));

  const shouldShowImage = Boolean(avatarUrl && !hasError && avatarUrl.startsWith('http') && !avatarUrl.includes('placeholder'));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {shouldShowImage ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          onError={() => setHasError(true)}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.monogramBox,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colorScheme.bg,
            },
          ]}
        >
          <Text style={[styles.monogramText, { fontSize, color: colorScheme.text }]}>
            {initial}
          </Text>
        </View>
      )}

      {showPresence && (
        <View
          style={[
            styles.presenceDot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: isOnline ? '#10B981' : '#94A3B8',
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: '#E2E8F0',
  },
  monogramBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  presenceDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
