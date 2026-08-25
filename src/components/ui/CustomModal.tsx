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
  iconColor = '#2563EB',
  children,
  maxWidth = 440,
  showCloseButton = true,
  containerStyle,
}) => {
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
          style={[styles.card, { maxWidth }, containerStyle]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header Row (Clean Title Only) */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              <View style={styles.titleRow}>
                {icon && <RemixIcon name={icon} size={15} color={iconColor} />}
                {title && <Text style={styles.title}>{title}</Text>}
              </View>

              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <RemixIcon name="close-line" size={14} color="#64748B" />
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
    backdropFilter: 'blur(4px)',
  } as any,
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
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
    color: '#0F172A',
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  body: {
    padding: 16,
  },
});
