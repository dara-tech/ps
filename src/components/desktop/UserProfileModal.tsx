import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useDesktopStore } from '../../store/useDesktopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { CustomModal } from '../ui/CustomModal';
import { CustomTextInput } from '../ui/CustomTextInput';
import { CustomSelect } from '../ui/CustomSelect';
import { ModernAvatar } from '../ui/ModernAvatar';
import { LanguageToggle } from '../ui/LanguageToggle';
import { RemixIcon } from '../ui/RemixIcon';

import { BiometricAuthModal } from './BiometricAuthModal';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ visible, onClose }) => {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);
  const selectedModel = useDesktopStore((state) => state.selectedModel);
  const setSelectedModel = useDesktopStore((state) => state.setSelectedModel);
  const aiModels = useDesktopStore((state) => state.aiModels);
  const language = useLanguageStore((state) => state.language);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [headline, setHeadline] = useState(user?.role || '');
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarUrl(user.avatar || '');
      setHeadline(user.role || (language === 'kh' ? 'អ្នកបង្កើតផ្ទាល់ខ្លួន' : 'Personal Creator'));
    }
  }, [user, visible, language]);

  const handleSave = () => {
    if (!name.trim()) return;
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      avatar: avatarUrl,
      role: headline.trim() || 'Personal',
      department: 'Personal',
      userRole: 'Executive',
    });
    onClose();
  };

  const handleSignOut = () => {
    onClose();
    logout();
  };

  const AI_MODEL_OPTIONS = aiModels.map((m) => ({
    label: m === 'gemini-3.7-flash' ? `${m} (Recommended)` : m,
    value: m,
  }));

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={language === 'kh' ? 'គណនីផ្ទាល់ខ្លួន' : 'Personal Profile'}
      maxWidth={500}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Avatar Banner */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <ModernAvatar
              name={name || 'User'}
              avatarUrl={avatarUrl}
              size={64}
              showPresence={true}
              isOnline={true}
            />
          </View>

          <View style={styles.presetRow}>
            <Text style={styles.presetLabel}>
              {language === 'kh' ? 'ជ្រើសរើសរូបតំណាង៖' : 'Avatar Presets:'}
            </Text>
            <View style={styles.presetList}>
              {AVATAR_PRESETS.map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.presetThumb, avatarUrl === p && styles.presetThumbActive]}
                  onPress={() => setAvatarUrl(p)}
                  activeOpacity={0.8}
                >
                  <ModernAvatar name={`User ${idx}`} avatarUrl={p} size={28} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.presetThumb, !avatarUrl && styles.presetThumbActive]}
                onPress={() => setAvatarUrl('')}
                activeOpacity={0.8}
              >
                <View style={styles.monogramBtn}>
                  <Text style={styles.monogramBtnText}>{name.charAt(0) || 'U'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Identity Inputs */}
        <View style={styles.formSection}>
          <View style={styles.inputField}>
            <Text style={styles.fieldLabel}>
              {language === 'kh' ? 'ឈ្មោះពេញ' : 'Full Name'}
            </Text>
            <CustomTextInput
              value={name}
              onChangeText={setName}
              placeholder={language === 'kh' ? 'បញ្ចូលឈ្មោះរបស់អ្នក...' : 'Enter your name...'}
              icon="user-line"
              size="md"
            />
          </View>

          <View style={styles.inputField}>
            <Text style={styles.fieldLabel}>
              {language === 'kh' ? 'អ៊ីមែលគណនី' : 'Account Email'}
            </Text>
            <CustomTextInput
              value={email}
              onChangeText={setEmail}
              placeholder="user@gmail.com"
              icon="mail-line"
              size="md"
              editable={false}
            />
          </View>

          <View style={styles.rowFields}>
            <View style={[styles.inputField, { flex: 1.3 }]}>
              <Text style={styles.fieldLabel}>
                {language === 'kh' ? 'មុខរបរ / ចំណងជើង' : 'Headline / Profession'}
              </Text>
              <CustomTextInput
                value={headline}
                onChangeText={setHeadline}
                placeholder={language === 'kh' ? 'ឧ. Developer / Creator' : 'e.g. Software Creator'}
                icon="briefcase-line"
                size="md"
              />
            </View>

            <View style={[styles.inputField, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>
                {language === 'kh' ? 'ប្រភេទ Workspace' : 'Workspace Mode'}
              </Text>
              <View style={styles.personalModeBadge}>
                <View style={styles.personalDot} />
                <Text style={styles.personalModeText}>
                  {language === 'kh' ? 'គណនីផ្ទាល់ខ្លួន' : 'Personal OS'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences & Security Section */}
        <View style={styles.prefSection}>
          <Text style={styles.prefSectionTitle}>
            {language === 'kh' ? 'ការកំណត់ភាសា និងសុវត្ថិភាព' : 'Preferences & Security'}
          </Text>

          {/* 1. Language Row */}
          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Text style={styles.prefLabel}>
                {language === 'kh' ? 'ភាសាកម្មវិធី' : 'Application Language'}
              </Text>
              <Text style={styles.prefSub}>
                {language === 'kh' ? 'ប្តូរភាសាបង្ហាញ' : 'Switch interface display language'}
              </Text>
            </View>
            <LanguageToggle />
          </View>

          {/* 2. Biometric Touch ID Fingerprint Row */}
          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <View style={styles.biometricLabelRow}>
                <RemixIcon name="fingerprint-line" size={14} color="#0F172A" />
                <Text style={styles.prefLabel}>
                  {language === 'kh' ? 'ស្កេនម្រាមដៃ (Touch ID)' : 'Touch ID / Fingerprint'}
                </Text>
              </View>
              <Text style={styles.prefSub}>
                {language === 'kh'
                  ? 'ផ្ទៀងផ្ទាត់រហ័សសម្រាប់ដោះសោ និងការពារទិន្នន័យ'
                  : 'Instant biometric scan for fast & secure workspace unlock'}
              </Text>
            </View>

            <View style={styles.biometricActions}>
              <TouchableOpacity
                style={[
                  styles.biometricToggleBtn,
                  biometricEnabled && styles.biometricToggleBtnActive,
                ]}
                onPress={() => setBiometricEnabled(!biometricEnabled)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.biometricSwitchDot,
                    biometricEnabled && styles.biometricSwitchDotActive,
                  ]}
                />
              </TouchableOpacity>

              {biometricEnabled && (
                <TouchableOpacity
                  style={styles.testScanBtn}
                  onPress={() => setShowBiometricModal(true)}
                  activeOpacity={0.75}
                >
                  <RemixIcon name="fingerprint-line" size={12} color="#2563EB" />
                  <Text style={styles.testScanText}>
                    {language === 'kh' ? 'ស្កេន' : 'Test Scan'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 3. Gemini AI Model Row */}
          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Text style={styles.prefLabel}>
                {language === 'kh' ? 'ម៉ូដែល Gemini AI' : 'Gemini AI Engine'}
              </Text>
              <Text style={styles.prefSub}>
                {language === 'kh' ? 'ម៉ូដែលឆ្លាតវៃសម្រាប់ Copilot' : 'Cloud LLM model for AI tasks'}
              </Text>
            </View>
            <View style={{ width: 170 }}>
              <CustomSelect
                options={AI_MODEL_OPTIONS}
                value={selectedModel}
                onChange={setSelectedModel}
                size="sm"
                variant="filled"
                menuWidth={200}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal Actions */}
      <View style={styles.modalFooter}>
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <RemixIcon name="logout-box-r-line" size={13} color="#EF4444" />
          <Text style={styles.signOutText}>
            {language === 'kh' ? 'ចាកចេញ' : 'Sign Out'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footerRight}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>
              {language === 'kh' ? 'បោះបង់' : 'Cancel'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <RemixIcon name="check-line" size={14} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>
              {language === 'kh' ? 'រក្សាទុក' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Biometric Touch ID Scanner Modal */}
      <BiometricAuthModal
        visible={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onSuccess={() => setBiometricEnabled(true)}
      />
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 520,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  presetRow: {
    alignItems: 'center',
    gap: 6,
  },
  presetLabel: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
  presetList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  presetThumb: {
    padding: 2,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  presetThumbActive: {
    borderColor: '#2563EB',
  },
  monogramBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#4F46E5',
    fontWeight: '700',
  },
  formSection: {
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  inputField: {
    gap: 5,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#334155',
    fontWeight: '600',
  },
  rowFields: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  personalModeBadge: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  personalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  personalModeText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '600',
  },
  prefSection: {
    paddingVertical: 14,
    gap: 12,
  },
  prefSectionTitle: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
  },
  prefCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    gap: 10,
  },
  prefRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  githubInputGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  prefLeft: {
    flex: 1,
    paddingRight: 10,
  },
  prefLabel: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
    fontWeight: '600',
  },
  prefSub: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  biometricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  biometricActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  biometricToggleBtn: {
    width: 38,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    padding: 2,
    justifyContent: 'center',
  },
  biometricToggleBtnActive: {
    backgroundColor: '#0F172A',
  },
  biometricSwitchDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  biometricSwitchDotActive: {
    alignSelf: 'flex-end',
  },
  testScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  testScanText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#2563EB',
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 10,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  signOutText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#EF4444',
    fontWeight: '600',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#0F172A',
  },
  saveBtnText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
