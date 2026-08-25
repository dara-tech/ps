import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { RemixIcon } from '../ui/RemixIcon';
import { toast } from '../../store/useToastStore';
import { BiometricAuthModal } from '../desktop/BiometricAuthModal';

export const LoginForm: React.FC = () => {
  const login = useAuthStore((state) => state.login);
  const biometricLogin = useAuthStore((state) => state.biometricLogin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const t = useLanguageStore((state) => state.t);
  const language = useLanguageStore((state) => state.language);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      toast.warning(t.emailRequired);
      return;
    }
    if (!password.trim()) {
      toast.warning(t.passwordRequired);
      return;
    }
    await login(email.trim(), password.trim());
  };

  const handleSSO = (provider: string) => {
    toast.info(`SSO (${provider})`, `Connecting to ${provider}...`);
  };

  return (
    <View style={styles.container}>
      {/* 1. Touch ID Biometric Fast Sign In Card */}
      <TouchableOpacity
        style={styles.biometricCard}
        onPress={() => setShowBiometricModal(true)}
        activeOpacity={0.8}
      >
        <View style={styles.biometricIconBox}>
          <RemixIcon name="fingerprint-line" size={20} color="#0F172A" />
        </View>
        <View style={styles.biometricInfo}>
          <Text style={styles.biometricTitle}>
            {language === 'kh' ? 'ចូលដោយស្កេនម្រាមដៃ (Touch ID)' : 'Sign In with Touch ID'}
          </Text>
          <Text style={styles.biometricSub}>
            {language === 'kh' ? 'ផ្ទៀងផ្ទាត់រហ័ស 1-Click Instant Unlock' : 'Fast 1-click biometric workspace unlock'}
          </Text>
        </View>
        <RemixIcon name="arrow-right-line" size={14} color="#94A3B8" />
      </TouchableOpacity>

      {/* 2 Equal-Width Social SSO Buttons: Google/Gmail + Telegram */}
      <View style={styles.ssoRow}>
        <TouchableOpacity 
          style={styles.ssoCard} 
          onPress={() => handleSSO('Google Workspace / Gmail')}
          activeOpacity={0.75}
        >
          <View style={styles.ssoIconWrapper}>
            <RemixIcon name="google-official" size={19} />
          </View>
          <Text style={styles.ssoText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.ssoCard} 
          onPress={() => handleSSO('Telegram')}
          activeOpacity={0.75}
        >
          <View style={styles.ssoIconWrapper}>
            <RemixIcon name="telegram-official" size={20} />
          </View>
          <Text style={styles.ssoText}>Telegram</Text>
        </TouchableOpacity>
      </View>

      {/* Or Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t.orContinueWith}</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Email Input */}
      <View style={[
        styles.inputBox,
        focused === 'email' && styles.inputBoxFocused
      ]}>
        <View style={styles.iconBox}>
          <RemixIcon 
            name="mail-line" 
            size={17} 
            color={focused === 'email' ? '#0F172A' : '#94A3B8'} 
          />
        </View>
        <TextInput
          style={styles.textInput}
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          placeholder={t.workEmailPlaceholder}
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* Password Input */}
      <View style={[
        styles.inputBox,
        focused === 'password' && styles.inputBoxFocused,
        { marginTop: 12 }
      ]}>
        <View style={styles.iconBox}>
          <RemixIcon 
            name="lock-line" 
            size={17} 
            color={focused === 'password' ? '#0F172A' : '#94A3B8'} 
          />
        </View>
        <TextInput
          style={styles.textInput}
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
          placeholder={t.passwordPlaceholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPassword}
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeBtn}
          activeOpacity={0.7}
        >
          <RemixIcon 
            name={showPassword ? 'eye-off-line' : 'eye-line'} 
            size={17} 
            color="#94A3B8" 
          />
        </TouchableOpacity>
      </View>

      {/* Meta Row */}
      <View style={styles.metaRow}>
        <TouchableOpacity 
          style={styles.rememberRow}
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
            {rememberMe && <RemixIcon name="check-line" size={11} color="#FFFFFF" />}
          </View>
          <Text style={styles.rememberText}>{t.rememberMe}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => toast.info(t.resetDispatched)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.forgotLink}>{t.forgotPassword}</Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitBtn, isLoading && styles.submitBtnLoading]}
        onPress={handleLogin}
        disabled={isLoading}
        activeOpacity={0.88}
      >
        <Text style={styles.submitBtnText}>
          {isLoading ? t.signingIn : t.signInButton}
        </Text>
        <RemixIcon name="arrow-right-line" size={16} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Biometric Touch ID Modal */}
      <BiometricAuthModal
        visible={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSuccess={async () => {
          await biometricLogin();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  biometricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 14,
    gap: 12,
  },
  biometricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricInfo: {
    flex: 1,
  },
  biometricTitle: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  biometricSub: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 1,
  },
  ssoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  ssoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 44,
    gap: 8,
  },
  ssoIconWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ssoText: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#334155',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  dividerText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#94A3B8',
    marginHorizontal: 12,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputBoxFocused: {
    borderColor: '#0F172A',
  },
  iconBox: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
    paddingVertical: 0,
    outlineStyle: 'none',
  } as any,
  eyeBtn: {
    padding: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 22,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  rememberText: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  forgotLink: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#2A9D8F',
  },
  submitBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnLoading: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
