import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguageStore } from '../../store/useLanguageStore';

export const LanguageToggle: React.FC = () => {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <View style={styles.toggleContainer}>
      {/* Khmer Button */}
      <TouchableOpacity
        style={[styles.langBtn, language === 'kh' && styles.langBtnActive]}
        onPress={() => setLanguage('kh')}
        activeOpacity={0.8}
      >
        <Text style={[styles.langText, language === 'kh' && styles.langTextActive]}>
          ខ្មែរ
        </Text>
      </TouchableOpacity>

      {/* English Button */}
      <TouchableOpacity
        style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
        onPress={() => setLanguage('en')}
        activeOpacity={0.8}
      >
        <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
          EN
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    height: 26,
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    padding: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langBtn: {
    height: 20,
    paddingHorizontal: 7,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  langText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
    lineHeight: 14,
  },
  langTextActive: {
    color: '#0F172A',
  },
});
