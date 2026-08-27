import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { BankBrand } from '../desktop/modules/PersonalFinanceModule';

export interface BankLogoProps {
  brand: BankBrand | 'income' | 'food' | 'transport';
  size?: number;
  height?: number;
}

const BANK_LOGOS: Partial<Record<BankBrand, any>> = {
  acleda: require('../../../assets/banks/acleda_icon.png'),
  aba: require('../../../assets/banks/aba.png'),
  khqr: require('../../../assets/banks/khqr.png'),
  canadia: require('../../../assets/banks/canadia.png'),
};

export const BankLogo: React.FC<BankLogoProps> = ({ brand, size = 36, height = 36 }) => {
  const localImage = BANK_LOGOS[brand as BankBrand];

  if (localImage) {
    const isAcleda = brand === 'acleda';
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: height,
            backgroundColor: isAcleda ? '#0B2546' : '#FFFFFF',
            borderColor: isAcleda ? '#1E3A8A' : '#E2E8F0',
          },
        ]}
      >
        <Image
          source={localImage}
          style={[
            styles.logoImage,
            brand === 'khqr' && { width: '90%', height: '60%' },
            brand === 'canadia' && { width: '90%', height: '70%' },
            brand === 'acleda' && { width: '85%', height: '85%' },
            brand === 'aba' && { width: '85%', height: '85%' },
          ]}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (brand === 'income') {
    return (
      <View style={[styles.container, { width: size, height, backgroundColor: '#059669', borderColor: '#047857' }]}>
        <Svg width={size * 0.65} height={height * 0.65} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" fill="#10B981" />
          <Path d="M12 7V17M7 12L12 17L17 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    );
  }

  if (brand === 'food') {
    return (
      <View style={[styles.container, { width: size, height, backgroundColor: '#EA580C', borderColor: '#C2410C' }]}>
        <Svg width={size * 0.6} height={height * 0.6} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 3V10A6 6 0 0 0 18 10V3M12 16V22M7 22H17"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </Svg>
      </View>
    );
  }

  if (brand === 'transport') {
    return (
      <View style={[styles.container, { width: size, height, backgroundColor: '#7C3AED', borderColor: '#6D28D9' }]}>
        <Svg width={size * 0.65} height={height * 0.65} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 14H21M5 5H19L22 12V19H2V12L5 5Z"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Circle cx="7" cy="17" r="2" fill="#FFFFFF" />
          <Circle cx="17" cy="17" r="2" fill="#FFFFFF" />
        </Svg>
      </View>
    );
  }

  // Fallback Bank Icon
  return (
    <View style={[styles.container, { width: size, height, backgroundColor: '#0F172A', borderColor: '#1E293B' }]}>
      <Svg width={size * 0.6} height={height * 0.6} viewBox="0 0 24 24" fill="none">
        <Path d="M3 21H21V19H3V21ZM12 2L2 7V10H22V7L12 2ZM5 12H7V17H5V12ZM9 12H11V17H9V12ZM13 12H15V17H13V12ZM17 12H19V17H17V12Z" fill="#38BDF8" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '80%',
    height: '80%',
  },
});
