import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { RemixIcon, RemixIconName } from './RemixIcon';

export interface SelectOption {
  label: string;
  value: string;
  icon?: RemixIconName;
  badgeColor?: string;
  description?: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: RemixIconName;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'minimal';
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  dropdownStyle?: StyleProp<ViewStyle>;
  align?: 'left' | 'right';
  menuWidth?: number;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  icon,
  size = 'md',
  variant = 'outline',
  disabled = false,
  containerStyle,
  dropdownStyle,
  align = 'left',
  menuWidth = 200,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const tokens = useThemeStore((state) => state.tokens);

  const selectedOption = options.find((o) => o.value === value);

  const sizeStyles = {
    sm: { height: 28, fontSize: 11, paddingH: 8, iconSize: 12 },
    md: { height: 34, fontSize: 12, paddingH: 10, iconSize: 13 },
    lg: { height: 40, fontSize: 13, paddingH: 12, iconSize: 15 },
  }[size];

  const getVariantStyle = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: tokens.surfaceMuted,
          borderWidth: 1,
          borderColor: isOpen ? tokens.accentColor : tokens.borderSubtle,
        };
      case 'minimal':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: 'transparent',
        };
      case 'outline':
      default:
        return {
          backgroundColor: tokens.surfaceBg,
          borderWidth: 1,
          borderColor: isOpen ? tokens.accentColor : tokens.borderSubtle,
        };
    }
  };

  const triggerRef = React.useRef<any>(null);

  const handleOpen = (e: any) => {
    if (disabled) return;
    if (Platform.OS === 'web' && triggerRef.current) {
      try {
        const rect = (triggerRef.current as any).getBoundingClientRect();
        setTriggerLayout({
          x: rect.left,
          y: rect.bottom + 4,
          width: rect.width,
          height: rect.height,
        });
      } catch (err) {
        // Fallback
      }
    }
    setIsOpen(true);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Trigger Button */}
      <TouchableOpacity
        ref={triggerRef}
        style={[
          styles.baseTrigger,
          { minHeight: sizeStyles.height, paddingHorizontal: sizeStyles.paddingH },
          getVariantStyle(),
          disabled && { opacity: 0.5 },
        ]}
        onPress={handleOpen}
        activeOpacity={0.75}
        disabled={disabled}
      >
        {selectedOption?.badgeColor ? (
          <View style={[styles.badgeDot, { backgroundColor: selectedOption.badgeColor }]} />
        ) : (icon || selectedOption?.icon) ? (
          <RemixIcon
            name={(selectedOption?.icon || icon)!}
            size={sizeStyles.iconSize}
            color={tokens.textSecondary}
          />
        ) : null}

        <Text
          style={[
            styles.triggerText,
            { fontSize: sizeStyles.fontSize, color: selectedOption ? tokens.textPrimary : tokens.textMuted },
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        <RemixIcon
          name={isOpen ? 'chevron-up-line' as any : 'chevron-down-line'}
          size={11}
          color={tokens.textSecondary}
        />
      </TouchableOpacity>

      {/* Floating Options Dropdown Menu Modal */}
      {isOpen && (
        <Modal transparent visible={isOpen} onRequestClose={() => setIsOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsOpen(false)}>
            <View
              style={[
                styles.dropdownMenu,
                {
                  backgroundColor: tokens.surfaceBg,
                  borderColor: tokens.borderSubtle,
                  width: Math.max(menuWidth, triggerLayout?.width || 180),
                },
                triggerLayout
                  ? {
                      top: triggerLayout.y,
                      left: align === 'right' ? triggerLayout.x + triggerLayout.width - Math.max(menuWidth, triggerLayout.width) : triggerLayout.x,
                    }
                  : styles.dropdownCenterFallback,
                dropdownStyle,
              ]}
            >
              <ScrollView style={styles.optionsScroll} showsVerticalScrollIndicator={false}>
                {options.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.optionItem,
                        isSelected && { backgroundColor: tokens.accentSoft },
                      ]}
                      onPress={() => handleSelect(opt.value)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionLeft}>
                        {opt.badgeColor ? (
                          <View style={[styles.badgeDot, { backgroundColor: opt.badgeColor }]} />
                        ) : opt.icon ? (
                          <RemixIcon
                            name={opt.icon}
                            size={13}
                            color={isSelected ? tokens.accentColor : tokens.textSecondary}
                          />
                        ) : null}

                        <View style={styles.optionTextCol}>
                          <Text
                            style={[
                              styles.optionLabel,
                              { fontSize: sizeStyles.fontSize, color: isSelected ? tokens.accentColor : tokens.textPrimary },
                              isSelected && { fontWeight: '700', fontFamily: 'Krasar-Bold' },
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {opt.description && (
                            <Text style={[styles.optionDesc, { color: tokens.textMuted }]}>{opt.description}</Text>
                          )}
                        </View>
                      </View>

                      {isSelected && (
                        <RemixIcon name="check-line" size={13} color={tokens.accentColor} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  baseTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    gap: 6,
  },
  triggerText: {
    flex: 1,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownMenu: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
    maxHeight: 240,
    zIndex: 1000,
  },
  dropdownCenterFallback: {
    top: '30%',
    left: '30%',
  },
  optionsScroll: {
    maxHeight: 220,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 5,
    gap: 8,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: 'Krasar-Regular',
  },
  optionDesc: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    marginTop: 1,
  },
});
