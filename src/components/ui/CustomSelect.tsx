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

  const selectedOption = options.find((o) => o.value === value);

  const sizeStyles = {
    sm: { height: 28, fontSize: 11, paddingH: 8, iconSize: 12 },
    md: { height: 34, fontSize: 12, paddingH: 10, iconSize: 13 },
    lg: { height: 40, fontSize: 13, paddingH: 12, iconSize: 15 },
  }[size];

  const getVariantStyle = () => {
    switch (variant) {
      case 'filled':
        return styles.filledTrigger;
      case 'minimal':
        return styles.minimalTrigger;
      case 'outline':
      default:
        return styles.outlineTrigger;
    }
  };

  const triggerRef = React.useRef<any>(null);

  const handleOpen = (e: any) => {
    if (disabled) return;
    if (triggerRef.current?.measureInWindow) {
      triggerRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        setTriggerLayout({ x, y: y + height + 4, width, height });
        setIsOpen(true);
      });
    } else if (e?.currentTarget?.getBoundingClientRect) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTriggerLayout({
        x: rect.left,
        y: rect.bottom + 4,
        width: rect.width,
        height: rect.height,
      });
      setIsOpen(true);
    } else {
      setIsOpen(true);
    }
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
          isOpen && styles.triggerActive,
          disabled && styles.triggerDisabled,
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
            color="#64748B"
          />
        ) : null}

        <Text
          style={[
            styles.triggerText,
            { fontSize: sizeStyles.fontSize },
            !selectedOption && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        <RemixIcon
          name={isOpen ? 'chevron-up-line' as any : 'chevron-down-line'}
          size={11}
          color="#94A3B8"
        />
      </TouchableOpacity>

      {/* Floating Options Dropdown Menu Modal */}
      {isOpen && (
        <Modal transparent visible={isOpen} onRequestClose={() => setIsOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsOpen(false)}>
            <View
              style={[
                styles.dropdownMenu,
                { width: Math.max(menuWidth, triggerLayout?.width || 180) },
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
                      style={[styles.optionItem, isSelected && styles.optionItemActive]}
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
                            color={isSelected ? '#2563EB' : '#64748B'}
                          />
                        ) : null}

                        <View style={styles.optionTextCol}>
                          <Text
                            style={[
                              styles.optionLabel,
                              { fontSize: sizeStyles.fontSize },
                              isSelected && styles.optionLabelActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                          {opt.description && (
                            <Text style={styles.optionDesc}>{opt.description}</Text>
                          )}
                        </View>
                      </View>

                      {isSelected && (
                        <RemixIcon name="check-line" size={12} color="#2563EB" />
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
    backgroundColor: '#FFFFFF',
  },
  outlineTrigger: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filledTrigger: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  minimalTrigger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  triggerActive: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerText: {
    flex: 1,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#0F172A',
  },
  placeholderText: {
    color: '#94A3B8',
    fontFamily: 'Krasar-Regular',
    fontWeight: '400',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
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
  optionItemActive: {
    backgroundColor: '#EFF6FF',
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
    color: '#334155',
  },
  optionLabelActive: {
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#2563EB',
  },
  optionDesc: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    marginTop: 1,
  },
});
