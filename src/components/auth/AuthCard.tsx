import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LanguageToggle } from '../ui/LanguageToggle';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export const AuthCard: React.FC = () => {
  const authMode = useAuthStore((state) => state.authMode);
  const setAuthMode = useAuthStore((state) => state.setAuthMode);
  const t = useLanguageStore((state) => state.t);

  return (
    <View style={styles.desktopContainer}>
      {/* Left Column: Clean Brand Hero */}
      <View style={styles.leftHeroCol}>
        {/* Subtle Ambient Background Lighting */}
        <View style={styles.glowTopLeft} />
        <View style={styles.glowBottomRight} />

        {/* Brand Top Row */}
        <View style={styles.brandTopRow}>
          <View style={styles.brandMark}>
            <View style={styles.brandMarkInner} />
          </View>
          <Text style={styles.brandTitleText}>{t.appName}</Text>
        </View>

        {/* Hero Center Text (Kantumruy Pro for Headings) */}
        <View style={styles.heroCenterBlock}>
          <Text style={styles.heroHeadline}>
            {t.heroHeadline}
          </Text>
          <Text style={styles.heroParagraph}>
            {t.heroParagraph}
          </Text>
        </View>

        {/* Footer Status */}
        <View style={styles.heroFooter}>
          <View style={styles.liveGreenDot} />
          <Text style={styles.footerVersionText}>{t.systemsOperational}</Text>
        </View>
      </View>

      {/* Right Column: Centered Form with Language Switcher */}
      <View style={styles.rightFormCol}>
        {/* Top Floating Language Switcher Bar */}
        <View style={styles.topLangBar}>
          <LanguageToggle />
        </View>

        <ScrollView 
          style={styles.formScroll} 
          contentContainerStyle={styles.formScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Centered Width-Fit Form Wrapper */}
          <View style={styles.formWrapper}>
            {/* Header (Kantumruy Pro for Form Heading) */}
            <View style={styles.formTopHeader}>
              <Text style={styles.formTitle}>
                {authMode === 'login' ? t.signInTitle : t.createAccountTitle}
              </Text>
              <Text style={styles.formSubtitle}>
                {authMode === 'login' ? t.signInSubtitle : t.createSubtitle}
              </Text>
            </View>

            {/* Segment Switcher */}
            <View style={styles.segmentWrap}>
              <TouchableOpacity
                style={[styles.segmentBtn, authMode === 'login' && styles.segmentBtnActive]}
                onPress={() => setAuthMode('login')}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, authMode === 'login' && styles.segmentTextActive]}>
                  {t.signIn}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, authMode === 'signup' && styles.segmentBtnActive]}
                onPress={() => setAuthMode('signup')}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, authMode === 'signup' && styles.segmentTextActive]}>
                  {t.createAccount}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            {authMode === 'login' ? <LoginForm /> : <SignupForm />}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    backgroundColor: '#FAFBFC',
  },
  leftHeroCol: {
    width: '40%',
    backgroundColor: '#0A0E17',
    paddingHorizontal: 44,
    paddingTop: 68,
    paddingBottom: 44,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
  },
  glowTopLeft: {
    position: 'absolute',
    top: -90,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(42, 157, 143, 0.18)',
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -70,
    right: -70,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(79, 70, 229, 0.14)',
  },
  brandTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#2A9D8F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  brandTitleText: {
    fontSize: 20,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroCenterBlock: {
    zIndex: 10,
    marginVertical: 20,
  },
  heroHeadline: {
    fontSize: 32,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  heroParagraph: {
    fontSize: 15,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    marginTop: 14,
    lineHeight: 24,
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  liveGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  footerVersionText: {
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
  },
  rightFormCol: {
    flex: 1,
    backgroundColor: '#FAFBFC',
    height: '100%',
    position: 'relative',
  },
  topLangBar: {
    position: 'absolute',
    top: 20,
    right: 24,
    zIndex: 999,
  },
  formScroll: {
    flex: 1,
    width: '100%',
  },
  formScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 56,
    width: '100%',
  },
  formWrapper: {
    width: '100%',
    maxWidth: 390,
  },
  formTopHeader: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 27,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: 13,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 4,
    lineHeight: 20,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F4',
    borderRadius: 12,
    padding: 3.5,
    marginBottom: 22,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  segmentText: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0F172A',
  },
});
