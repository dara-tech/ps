import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface ModernAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  showPresence?: boolean;
  isOnline?: boolean;
}

const GRADIENTS = [
  { bg: '#0F172A', text: '#FFFFFF' },
  { bg: '#2A9D8F', text: '#FFFFFF' },
  { bg: '#3B82F6', text: '#FFFFFF' },
  { bg: '#6366F1', text: '#FFFFFF' },
  { bg: '#0D9488', text: '#FFFFFF' },
  { bg: '#475569', text: '#FFFFFF' },
];

export const ModernAvatar: React.FC<ModernAvatarProps> = ({
  name,
  avatarUrl,
  size = 22,
  showPresence = false,
  isOnline = true,
}) => {
  // Deterministic color palette based on name characters
  const charCode = (name || 'User').charCodeAt(0);
  const colorScheme = GRADIENTS[charCode % GRADIENTS.length];
  const initial = (name || 'U').charAt(0).toUpperCase();

  const fontSize = Math.max(9, Math.round(size * 0.45));
  const dotSize = Math.max(5, Math.round(size * 0.28));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {avatarUrl && avatarUrl.startsWith('http') && !avatarUrl.includes('placeholder') ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
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
    fontFamily: 'PlusJakartaSans-Bold',
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  presenceDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
