import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { RemixIcon } from '../ui/RemixIcon';
import { toast } from '../../store/useToastStore';

export const SignupForm: React.FC = () => {
  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);
  const t = useLanguageStore((state) => state.t);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<'name' | 'email' | 'password' | null>(null);

  const handleSignup = async () => {
    if (!name.trim()) {
      toast.warning(t.nameRequired);
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.warning(t.emailRequired);
      return;
    }
    if (password.length < 6) {
      toast.warning(t.passwordShort);
      return;
    }

    await signup({
      name: name.trim(),
      email: email.trim(),
      password,
      role: 'Owner',
      department: 'Personal',
      userRole: 'Executive',
    });
  };

  const handleSSO = (provider: string) => {
    toast.info(`SSO (${provider})`, `Connecting to ${provider}...`);
  };

  return (
    <View style={styles.container}>
      {/* 2 Equal-Width Social SSO Buttons: Google + Telegram */}
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

      {/* Full Name Input */}
      <View style={[
        styles.inputBox,
        focused === 'name' && styles.inputBoxFocused
      ]}>
        <View style={styles.iconBox}>
          <RemixIcon 
            name="user-line" 
            size={17} 
            color={focused === 'name' ? '#0F172A' : '#94A3B8'} 
          />
        </View>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          onFocus={() => setFocused('name')}
          onBlur={() => setFocused(null)}
          placeholder={t.fullNamePlaceholder}
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* Email Input */}
      <View style={[
        styles.inputBox,
        focused === 'email' && styles.inputBoxFocused,
        { marginTop: 12 }
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
          placeholder={t.passwordMinPlaceholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPassword}
          onSubmitEditing={handleSignup}
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

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitBtn, isLoading && styles.submitBtnLoading, { marginTop: 20 }]}
        onPress={handleSignup}
        disabled={isLoading}
        activeOpacity={0.88}
      >
        <Text style={styles.submitBtnText}>
          {isLoading ? t.creatingAccount : t.createAccountButton}
        </Text>
        <RemixIcon name="arrow-right-line" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
    fontWeight: '700',
    color: '#334155',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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
