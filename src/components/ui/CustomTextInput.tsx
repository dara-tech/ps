import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Platform,
} from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { RemixIcon, RemixIconName } from './RemixIcon';

export interface CustomTextInputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  icon?: RemixIconName;
  iconColor?: string;
  rightElement?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  variant?: 'outline' | 'filled' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  isInvalid?: boolean;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
  icon,
  iconColor,
  rightElement,
  containerStyle,
  inputStyle,
  variant = 'outline',
  size = 'md',
  isInvalid = false,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const tokens = useThemeStore((state) => state.tokens);

  const sizeStyles = {
    sm: { height: 30, fontSize: 11.5, paddingH: 8, iconSize: 13 },
    md: { height: 36, fontSize: 12.5, paddingH: 10, iconSize: 14 },
    lg: { height: 42, fontSize: 13.5, paddingH: 12, iconSize: 16 },
  }[size];

  const getVariantContainerStyle = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: isHovered ? tokens.surfaceHover : tokens.surfaceMuted,
          borderWidth: 1,
          borderColor: isFocused ? tokens.accentColor : tokens.borderSubtle,
        };
      case 'minimal':
        return {
          backgroundColor: isFocused ? tokens.surfaceBg : 'transparent',
          borderWidth: 1,
          borderColor: isFocused ? tokens.accentColor : 'transparent',
        };
      case 'outline':
      default:
        return {
          backgroundColor: tokens.surfaceBg,
          borderWidth: 1,
          borderColor: isFocused ? tokens.accentColor : isHovered ? tokens.borderStrong : tokens.borderSubtle,
        };
    }
  };

  const webHoverProps = Platform.OS === 'web' ? {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  } : {};

  return (
    <View
      {...(webHoverProps as any)}
      style={[
        styles.baseContainer,
        {
          minHeight: sizeStyles.height,
          paddingLeft: sizeStyles.paddingH,
          paddingRight: rightElement ? 4 : sizeStyles.paddingH,
        },
        getVariantContainerStyle(),
        isInvalid && { borderColor: '#EF4444' },
        containerStyle,
      ]}
    >
      {icon && (
        <View style={styles.leftIcon}>
          <RemixIcon name={icon} size={sizeStyles.iconSize} color={isFocused ? tokens.accentColor : iconColor || tokens.textSecondary} />
        </View>
      )}

      <TextInput
        style={[
          styles.input,
          { fontSize: sizeStyles.fontSize, color: tokens.textPrimary },
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor || tokens.textMuted}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />

      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 7,
  },
  leftIcon: {
    marginRight: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: 'Krasar-Regular',
    paddingVertical: 4,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  rightElement: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
