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
  placeholderTextColor = '#94A3B8',
  icon,
  iconColor = '#64748B',
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

  const sizeStyles = {
    sm: { height: 30, fontSize: 11.5, paddingH: 8, iconSize: 13 },
    md: { height: 36, fontSize: 12.5, paddingH: 10, iconSize: 14 },
    lg: { height: 42, fontSize: 13.5, paddingH: 12, iconSize: 16 },
  }[size];

  const getVariantContainerStyle = () => {
    switch (variant) {
      case 'filled':
        return [
          styles.filledContainer,
          isHovered && styles.filledHovered,
          isFocused && styles.focused,
        ];
      case 'minimal':
        return [
          styles.minimalContainer,
          isFocused && styles.minimalFocused,
        ];
      case 'outline':
      default:
        return [
          styles.outlineContainer,
          isHovered && styles.outlineHovered,
          isFocused && styles.focused,
        ];
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
        isInvalid && styles.invalid,
        containerStyle,
      ]}
    >
      {icon && (
        <View style={styles.leftIcon}>
          <RemixIcon name={icon} size={sizeStyles.iconSize} color={isFocused ? '#2563EB' : iconColor} />
        </View>
      )}

      <TextInput
        style={[
          styles.input,
          { fontSize: sizeStyles.fontSize },
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
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
    backgroundColor: '#FFFFFF',
    transitionProperty: 'border-color, background-color',
    transitionDuration: '150ms',
  } as any,
  outlineContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  outlineHovered: {
    borderColor: '#CBD5E1',
  },
  filledContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filledHovered: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  minimalContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  minimalFocused: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
  },
  focused: {
    borderColor: '#2563EB',
  },
  invalid: {
    borderColor: '#EF4444',
  },
  leftIcon: {
    marginRight: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    // Universal web outline disable to eliminate default orange/blue browser focus rings
    outlineStyle: 'none',
    outlineWidth: 0,
    boxShadow: 'none',
  } as any,
  rightElement: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
