import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { RemixIcon, RemixIconName } from './RemixIcon';

export interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  icon?: RemixIconName;
  iconColor?: string;
  children: React.ReactNode;
  maxWidth?: number;
  showCloseButton?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  icon,
  iconColor,
  children,
  maxWidth = 440,
  showCloseButton = true,
  containerStyle,
}) => {
  const tokens = useThemeStore((state) => state.tokens);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.card,
            { maxWidth, backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle },
            containerStyle,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header Row (Clean Title Only) */}
          {(title || showCloseButton) && (
            <View style={[styles.header, { backgroundColor: tokens.surfaceBg, borderBottomColor: tokens.borderSubtle }]}>
              <View style={styles.titleRow}>
                {icon && <RemixIcon name={icon} size={15} color={iconColor || tokens.accentColor} />}
                {title && <Text style={[styles.title, { color: tokens.textPrimary }]}>{title}</Text>}
              </View>

              {showCloseButton && (
                <TouchableOpacity
                  style={[styles.closeBtn, { backgroundColor: tokens.surfaceMuted }]}
                  onPress={onClose}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <RemixIcon name="close-line" size={14} color={tokens.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Body Content */}
          <View style={styles.body}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 9999,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 16,
  },
});
