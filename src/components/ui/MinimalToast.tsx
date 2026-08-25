import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useToastStore, ToastItem, ToastType } from '../../store/useToastStore';
import { RemixIcon, RemixIconName } from './RemixIcon';

const ToastPill: React.FC<{ item: ToastItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, item.duration || 3500);
    return () => clearTimeout(timer);
  }, [item, onDismiss]);

  const getTheme = (type: ToastType): { icon: RemixIconName; color: string; bgBadge: string } => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkbox-circle-fill',
          color: '#10B981',
          bgBadge: 'rgba(16, 185, 129, 0.15)',
        };
      case 'error':
        return {
          icon: 'close-circle-fill',
          color: '#EF4444',
          bgBadge: 'rgba(239, 68, 68, 0.15)',
        };
      case 'warning':
        return {
          icon: 'error-warning-fill',
          color: '#F59E0B',
          bgBadge: 'rgba(245, 158, 11, 0.15)',
        };
      case 'info':
      default:
        return {
          icon: 'information-fill',
          color: '#38BDF8',
          bgBadge: 'rgba(56, 189, 248, 0.15)',
        };
    }
  };

  const theme = getTheme(item.type);

  return (
    <View style={styles.pillCard}>
      {/* Status Dot / Micro Icon */}
      <View style={[styles.statusIconBox, { backgroundColor: theme.bgBadge }]}>
        <RemixIcon name={theme.icon} size={15} color={theme.color} />
      </View>

      {/* Text Info */}
      <View style={styles.contentBox}>
        <Text style={styles.titleText} numberOfLines={1}>
          {item.title}
        </Text>
        {item.message ? (
          <Text style={styles.messageText} numberOfLines={1}>
            {item.message}
          </Text>
        ) : null}
      </View>

      {/* Dismiss Button */}
      <TouchableOpacity 
        onPress={onDismiss} 
        style={styles.closeBtn} 
        activeOpacity={0.6}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <RemixIcon name="close-line" size={14} color="#64748B" />
      </TouchableOpacity>
    </View>
  );
};

export const MinimalToast: React.FC = () => {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((item) => (
        <ToastPill key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    zIndex: 999999,
    alignItems: 'center',
    gap: 8,
  },
  pillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172AF0',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 10,
    gap: 8,
    maxWidth: 340,
  },
  statusIconBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  titleText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.1,
  },
  messageText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },
  closeBtn: {
    padding: 2,
    marginLeft: 2,
  },
});
