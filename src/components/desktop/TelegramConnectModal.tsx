import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { CustomModal } from '../ui/CustomModal';
import { RemixIcon } from '../ui/RemixIcon';
import { ModernAvatar } from '../ui/ModernAvatar';
import { useTelegramStore } from '../../store/useTelegramStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { toast } from '../../store/useToastStore';

interface TelegramConnectModalProps {
  visible: boolean;
  onClose: () => void;
}

type SettingsTab = 'account' | 'ghost' | 'chats' | 'storage';

export const TelegramConnectModal: React.FC<TelegramConnectModalProps> = ({
  visible,
  onClose,
}) => {
  const language = useLanguageStore((state) => state.language);
  const isKh = language === 'kh';

  const isConnected = useTelegramStore((state) => state.isConnected);
  const isConnecting = useTelegramStore((state) => state.isConnecting);
  const user = useTelegramStore((state) => state.user);
  const isCodeSent = useTelegramStore((state) => state.isCodeSent);
  const isCodeViaApp = useTelegramStore((state) => state.isCodeViaApp);
  const sendVerificationCode = useTelegramStore((state) => state.sendVerificationCode);
  const submitOtp = useTelegramStore((state) => state.submitOtp);
  const disconnect = useTelegramStore((state) => state.disconnect);
  const resetSignInState = useTelegramStore((state) => state.resetSignInState);
  const clearCache = useTelegramStore((state) => state.clearCache);
  const fetchDialogs = useTelegramStore((state) => state.fetchDialogs);
  const updateProfile = useTelegramStore((state) => state.updateProfile);
  const uploadProfilePhoto = useTelegramStore((state) => state.uploadProfilePhoto);
  const dialogsCount = useTelegramStore((state) => state.dialogs.length);

  const ghostSettings = useTelegramStore((state) => state.ghostSettings);
  const updateGhostSettings = useTelegramStore((state) => state.updateGhostSettings);

  // Settings State
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [sendOnEnter, setSendOnEnter] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [autoDownloadPhotos, setAutoDownloadPhotos] = useState(true);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setEditFirstName(user.firstName || '');
      setEditLastName((user as any)?.lastName || '');
      setEditUsername(user.username || '');
      setEditBio((user as any)?.about || '');
    }
  }, [user]);

  // Auth Flow State
  const [phone, setPhone] = useState('+855');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const handlePickPhoto = () => {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File Too Large', isKh ? 'រូបភាពមិនអាចលើសពី 10MB ទេ' : 'Image size cannot exceed 10MB');
        return;
      }
      setIsUploadingPhoto(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          await uploadProfilePhoto(base64, file.name);
        } finally {
          setIsUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSendCode = async () => {
    if (!phone.trim()) return;
    await sendVerificationCode(phone.trim());
  };

  const handleVerify = async () => {
    if (!code.trim()) return;
    const success = await submitOtp(code.trim(), password.trim() || undefined);
    if (success) {
      setCode('');
      setPassword('');
      onClose();
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    resetSignInState();
    setShowConfirmDisconnect(false);
  };

  const handleClearCache = () => {
    clearCache();
  };

  const handleResync = async () => {
    await fetchDialogs();
    toast.success('Synced', isKh ? 'បានទាញយកបញ្ជីសារឡើងវិញ' : 'Dialogs re-synced successfully');
  };

  const handleSaveProfile = async () => {
    if (!editFirstName.trim()) {
      toast.error('Required', isKh ? 'សូមបញ្ចូលឈ្មោះដំបូង' : 'First name is required');
      return;
    }
    setIsSavingProfile(true);
    const ok = await updateProfile({
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      username: editUsername.trim(),
      about: editBio.trim(),
    });
    setIsSavingProfile(false);
    if (ok) {
      setIsEditingProfile(false);
    }
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title={
        isConnected && user
          ? isKh ? 'ការកំណត់ Telegram (Settings)' : 'Telegram Settings'
          : isKh ? 'ភ្ជាប់គណនី Telegram (MTProto)' : 'Connect Telegram Account'
      }
      icon="telegram-official"
      iconColor="#0284C7"
      maxWidth={isConnected && user ? 520 : 460}
    >
      <View style={styles.container}>
        {isConnected && user ? (
          /* Telegram Desktop Settings UI */
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Top Profile Header */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarPickerWrap}
                onPress={handlePickPhoto}
                disabled={isUploadingPhoto}
                activeOpacity={0.8}
              >
                <ModernAvatar
                  name={user.firstName || 'Telegram User'}
                  avatarUrl={(user as any)?.avatarUrl || ((user as any)?.id ? `http://localhost:4000/api/v1/telegram/avatar/${encodeURIComponent((user as any).id)}` : undefined)}
                  size={58}
                  showPresence={true}
                  isOnline={true}
                />
                <View style={styles.avatarCameraBadge}>
                  {isUploadingPhoto ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <RemixIcon name={'camera-fill' as any} size={11} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.profileTextCol}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName}>
                    {user.firstName} {(user as any)?.lastName || ''}
                  </Text>
                  <View style={styles.activePill}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activePillText}>{isKh ? 'បានភ្ជាប់' : 'Active'}</Text>
                  </View>
                </View>
                {user.username && (
                  <Text style={styles.profileHandle}>@{user.username}</Text>
                )}
                {user.phone && (
                  <Text style={styles.profilePhone}>+{user.phone}</Text>
                )}
              </View>
            </View>

            {/* Consistent 4-Segment Tab Bar */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'account' && styles.tabBtnActive]}
                onPress={() => setActiveTab('account')}
                activeOpacity={0.7}
              >
                <RemixIcon
                  name="user-line"
                  size={14}
                  color={activeTab === 'account' ? '#0F172A' : '#64748B'}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === 'account' && styles.tabBtnTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {isKh ? 'គណនី' : 'Account'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'ghost' && styles.tabBtnActive]}
                onPress={() => setActiveTab('ghost')}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 13 }}>👻</Text>
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === 'ghost' && styles.tabBtnTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {isKh ? 'Ghost Mode' : 'Ghost Mode'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'chats' && styles.tabBtnActive]}
                onPress={() => setActiveTab('chats')}
                activeOpacity={0.7}
              >
                <RemixIcon
                  name="chat-3-line"
                  size={14}
                  color={activeTab === 'chats' ? '#0F172A' : '#64748B'}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === 'chats' && styles.tabBtnTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {isKh ? 'ការជជែក' : 'Chats'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'storage' && styles.tabBtnActive]}
                onPress={() => setActiveTab('storage')}
                activeOpacity={0.7}
              >
                <RemixIcon
                  name="folder-line"
                  size={14}
                  color={activeTab === 'storage' ? '#0F172A' : '#64748B'}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === 'storage' && styles.tabBtnTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {isKh ? 'ទិន្នន័យ' : 'Storage'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab 1: Account Info & Edit Profile Form */}
            {activeTab === 'account' && (
              <View style={styles.tabContent}>
                {isEditingProfile ? (
                  /* Edit Profile Form */
                  <View style={styles.cardSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionTitle}>
                        {isKh ? 'កែសម្រួលព័ត៌មានគណនី' : 'Edit Telegram Profile'}
                      </Text>
                      <TouchableOpacity
                        style={styles.cancelEditBtn}
                        onPress={() => setIsEditingProfile(false)}
                      >
                        <Text style={styles.cancelEditText}>{isKh ? 'បោះបង់' : 'Cancel'}</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.changePhotoBtn}
                      onPress={handlePickPhoto}
                      disabled={isUploadingPhoto}
                      activeOpacity={0.75}
                    >
                      <RemixIcon name={'camera-fill' as any} size={14} color="#0284C7" />
                      <Text style={styles.changePhotoBtnText}>
                        {isUploadingPhoto
                          ? isKh ? 'កំពុងផ្ទុករូបភាព...' : 'Uploading Photo...'
                          : isKh ? 'ប្តូររូបថត Profile (Change Photo)' : 'Change Profile Photo'}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.formRow}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.inputLabel}>{isKh ? 'ឈ្មោះដំបូង (First Name) *' : 'First Name *'}</Text>
                        <View style={styles.inputField}>
                          <TextInput
                            style={styles.formInput}
                            value={editFirstName}
                            onChangeText={setEditFirstName}
                            placeholder="First Name"
                            placeholderTextColor="#94A3B8"
                          />
                        </View>
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.inputLabel}>{isKh ? 'ត្រកូល (Last Name)' : 'Last Name'}</Text>
                        <View style={styles.inputField}>
                          <TextInput
                            style={styles.formInput}
                            value={editLastName}
                            onChangeText={setEditLastName}
                            placeholder="Last Name"
                            placeholderTextColor="#94A3B8"
                          />
                        </View>
                      </View>
                    </View>

                    <View style={{ gap: 4 }}>
                      <Text style={styles.inputLabel}>{isKh ? 'ឈ្មោះអ្នកប្រើប្រាស់ (Username)' : 'Username'}</Text>
                      <View style={styles.inputField}>
                        <Text style={styles.inputPrefix}>@</Text>
                        <TextInput
                          style={styles.formInput}
                          value={editUsername}
                          onChangeText={setEditUsername}
                          placeholder="username"
                          placeholderTextColor="#94A3B8"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>

                    <View style={{ gap: 4 }}>
                      <Text style={styles.inputLabel}>{isKh ? 'អំពីខ្ញុំ / Bio' : 'Bio / About'}</Text>
                      <View style={[styles.inputField, { height: 64, alignItems: 'flex-start', paddingTop: 6 }]}>
                        <TextInput
                          style={[styles.formInput, { height: '100%' }]}
                          value={editBio}
                          onChangeText={setEditBio}
                          placeholder={isKh ? 'រៀបរាប់សង្ខេបអំពីអ្នក...' : 'A few words about you...'}
                          placeholderTextColor="#94A3B8"
                          multiline={true}
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.saveProfileBtn, isSavingProfile && styles.btnDisabled]}
                      onPress={handleSaveProfile}
                      disabled={isSavingProfile}
                      activeOpacity={0.8}
                    >
                      {isSavingProfile ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <RemixIcon name="check-line" size={14} color="#FFFFFF" />
                          <Text style={styles.saveProfileBtnText}>
                            {isKh ? 'រក្សាទុកព័ត៌មាន (Save Changes)' : 'Save Changes'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  /* Profile Details & Features */
                  <View style={styles.cardSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionTitle}>
                        {isKh ? 'ព័ត៌មានមូលដ្ឋាន' : 'Basic Information'}
                      </Text>
                      <TouchableOpacity
                        style={styles.editPillBtn}
                        onPress={() => setIsEditingProfile(true)}
                        activeOpacity={0.7}
                      >
                        <RemixIcon name={'edit-box-line' as any} size={13} color="#0284C7" />
                        <Text style={styles.editPillText}>{isKh ? 'កែសម្រួល' : 'Edit'}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.infoGrid}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoKey}>{isKh ? 'ឈ្មោះ' : 'Name'}:</Text>
                        <Text style={styles.infoValue}>
                          {user.firstName} {(user as any)?.lastName || ''}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoKey}>{isKh ? 'Username' : 'Username'}:</Text>
                        <Text style={styles.infoValue}>
                          {user.username ? `@${user.username}` : isKh ? 'មិនទាន់កំណត់' : 'Not set'}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoKey}>{isKh ? 'ទូរស័ព្ទ' : 'Phone'}:</Text>
                        <Text style={styles.infoValue}>+{user.phone}</Text>
                      </View>
                      {(user as any)?.about ? (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoKey}>{isKh ? 'Bio' : 'Bio'}:</Text>
                          <Text style={styles.infoValue}>{(user as any).about}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Tab: Ghost Mode (Stealth & Ninja Mode) */}
            {activeTab === 'ghost' && (
              <View style={styles.tabContent}>
                {/* Master Ghost Mode Banner Card */}
                <View style={[styles.cardSection, ghostSettings.enabled && styles.ghostCardActive]}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingTextCol}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.settingLabel, { fontSize: 13, color: ghostSettings.enabled ? '#7C3AED' : '#0F172A' }]}>
                          👻 {isKh ? 'មុខងារសម្ងាត់ (Master Ghost Mode)' : 'Master Ghost Mode'}
                        </Text>
                        <View style={[styles.ghostBadge, { backgroundColor: ghostSettings.enabled ? '#EDE9FE' : '#F1F5F9' }]}>
                          <Text style={[styles.ghostBadgeText, { color: ghostSettings.enabled ? '#7C3AED' : '#64748B' }]}>
                            {ghostSettings.enabled ? (isKh ? 'សកម្ម (Active)' : 'Stealth Active') : (isKh ? 'បិទ' : 'Disabled')}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.settingDesc}>
                        {isKh
                          ? 'អានសារ និងប្រើប្រាស់ Telegram ដោយលាក់វត្តមាន Online និង Read Receipts មិនឱ្យអ្នកដទៃដឹង។'
                          : 'Read messages and use Telegram completely invisibly without sending read receipts or online status.'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, ghostSettings.enabled && styles.toggleBtnGhostActive]}
                      onPress={() => updateGhostSettings({ enabled: !ghostSettings.enabled })}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.toggleThumb, ghostSettings.enabled && styles.toggleThumbGhostActive]} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Granular Ghost Mode Capabilities */}
                <View style={styles.cardSection}>
                  {/* 1. Stealth Read (Don't Send Read Receipts) */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingTextCol}>
                      <Text style={styles.settingLabel}>
                        👁️ {isKh ? 'អានសារដោយសម្ងាត់ (Don’t Send Read Receipts)' : 'Stealth Read (No Double Checks)'}
                      </Text>
                      <Text style={styles.settingDesc}>
                        {isKh
                          ? 'អ្នកអាចបើកមើលសារទាំងអស់បាន ប៉ុន្តែអ្នកផ្ញើនឹងនៅតែឃើញសញ្ញាធីក ១ (Unread) ដដែល។'
                          : 'Open and read chats without sending read receipts. Senders still see single check mark.'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, ghostSettings.noReadReceipts && styles.toggleBtnActive]}
                      onPress={() => updateGhostSettings({ noReadReceipts: !ghostSettings.noReadReceipts })}
                      disabled={!ghostSettings.enabled}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.toggleThumb, ghostSettings.noReadReceipts && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rowDivider} />

                  {/* 2. Hide Online Status (Always Offline) */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingTextCol}>
                      <Text style={styles.settingLabel}>
                        📴 {isKh ? 'លាក់ស្ថានភាព Online (Stay Invisible)' : 'Hide Online Status (Stay Invisible)'}
                      </Text>
                      <Text style={styles.settingDesc}>
                        {isKh
                          ? 'កុំផ្ញើស្ថានភាព Online ទៅកាន់ Server។ អ្នកដទៃនឹងឃើញត្រឹម «Last seen recently»។'
                          : 'Do not broadcast online presence to Telegram. Always appear offline / last seen recently.'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, ghostSettings.hideOnline && styles.toggleBtnActive]}
                      onPress={() => updateGhostSettings({ hideOnline: !ghostSettings.hideOnline })}
                      disabled={!ghostSettings.enabled}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.toggleThumb, ghostSettings.hideOnline && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rowDivider} />

                  {/* 3. Hide Typing Broadcast */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingTextCol}>
                      <Text style={styles.settingLabel}>
                        ✍️ {isKh ? 'លាក់ស្ថានភាពពេលវាយអក្សរ (Hide Typing Status)' : 'Hide Typing Status'}
                      </Text>
                      <Text style={styles.settingDesc}>
                        {isKh
                          ? 'មិនបង្ហាញសញ្ញា «Typing...» ឬ «Recording audio...» ពេលអ្នកកំពុងសរសេរឡើយ។'
                          : 'Never broadcast typing or voice recording actions to chats.'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, ghostSettings.hideTyping && styles.toggleBtnActive]}
                      onPress={() => updateGhostSettings({ hideTyping: !ghostSettings.hideTyping })}
                      disabled={!ghostSettings.enabled}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.toggleThumb, ghostSettings.hideTyping && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rowDivider} />

                  {/* 4. Anti-Delete Message Vault */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingTextCol}>
                      <Text style={styles.settingLabel}>
                        🛡️ {isKh ? 'ការពារការលុបសារ (Anti-Delete Messages)' : 'Anti-Delete Message Vault'}
                      </Text>
                      <Text style={styles.settingDesc}>
                        {isKh
                          ? 'ប្រសិនបើដៃគូសន្ទនាលុបសារសម្រាប់មនុស្សគ្រប់គ្នា ប្រព័ន្ធនឹងរក្សាទុកច្បាប់ដើមជាមួយស្លាក [Deleted]។'
                          : 'Retain cached copies of messages revoked/deleted by the sender with a [Deleted] tag.'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, ghostSettings.antiDelete && styles.toggleBtnActive]}
                      onPress={() => updateGhostSettings({ antiDelete: !ghostSettings.antiDelete })}
                      disabled={!ghostSettings.enabled}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.toggleThumb, ghostSettings.antiDelete && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rowDivider} />

                  {/* 5. Stealth Story Viewing */}
                  <View style={styles.settingRow}>
                    <View style={styles.settingTextCol}>
                      <Text style={styles.settingLabel}>
                        🎭 {isKh ? 'មើល Story ដោយសម្ងាត់ (Anonymous Story View)' : 'Anonymous Story Viewer'}
                      </Text>
                      <Text style={styles.settingDesc}>
                        {isKh
                          ? 'មើល Telegram Stories ដោយមិនឱ្យម្ចាស់ Story ឃើញឈ្មោះរបស់អ្នកក្នុងបញ្ជីអ្នកមើល។'
                          : 'View contact stories anonymously without appearing on their viewer list.'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, ghostSettings.stealthStories && styles.toggleBtnActive]}
                      onPress={() => updateGhostSettings({ stealthStories: !ghostSettings.stealthStories })}
                      disabled={!ghostSettings.enabled}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.toggleThumb, ghostSettings.stealthStories && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Tab 3: Chat & Notification Settings */}
            {activeTab === 'chats' && (
              <View style={styles.tabContent}>
                <View style={styles.cardSection}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingTextCol}>
                      <Text style={styles.settingLabel}>
                        {isKh ? 'ចុច Enter ដើម្បីផ្ញើសារ' : 'Send on Enter'}
                      </Text>
                      <Text style={styles.settingDesc}>
                        {sendOnEnter
                          ? isKh ? 'ចុច Enter ដើម្បីផ្ញើ (Shift+Enter ចុះបន្ទាត់)' : 'Press Enter to send, Shift+Enter for new line'
                          : isKh ? 'ចុច Ctrl+Enter ដើម្បីផ្ញើ' : 'Press Ctrl+Enter to send'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, sendOnEnter && styles.toggleBtnActive]}
                      onPress={() => setSendOnEnter(!sendOnEnter)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.toggleThumb, sendOnEnter && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rowDivider} />

                  <View style={styles.settingRow}>
                    <View style={styles.settingTextCol}>
                      <Text style={styles.settingLabel}>
                        {isKh ? 'ទាញយករូបភាពស្វ័យប្រវត្តិ' : 'Auto-download Media'}
                      </Text>
                      <Text style={styles.settingDesc}>
                        {isKh ? 'បង្ហាញរូបភាព Preview និង Thumbnail ភ្លាមៗ' : 'Preload thumbnails and posters automatically'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, autoDownloadPhotos && styles.toggleBtnActive]}
                      onPress={() => setAutoDownloadPhotos(!autoDownloadPhotos)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.toggleThumb, autoDownloadPhotos && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rowDivider} />

                  <View style={styles.settingRow}>
                    <View style={styles.settingTextCol}>
                      <Text style={styles.settingLabel}>
                        {isKh ? 'សំឡេងសារចូល (Message Sound)' : 'Sound Notifications'}
                      </Text>
                      <Text style={styles.settingDesc}>
                        {isKh ? 'បន្លឺសំឡេងនៅពេលមានសារ Telegram ចូលថ្មី' : 'Play audio alert when new messages arrive'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, soundEnabled && styles.toggleBtnActive]}
                      onPress={() => setSoundEnabled(!soundEnabled)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.toggleThumb, soundEnabled && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rowDivider} />

                  <View style={styles.settingRow}>
                    <View style={styles.settingTextCol}>
                      <Text style={styles.settingLabel}>
                        {isKh ? 'ការជូនដំណឹង (Desktop Push)' : 'Desktop Push Notifications'}
                      </Text>
                      <Text style={styles.settingDesc}>
                        {isKh ? 'បង្ហាញផ្ទាំងជូនដំណឹងលើ Desktop' : 'Show system banner for incoming chats'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, desktopNotifications && styles.toggleBtnActive]}
                      onPress={() => setDesktopNotifications(!desktopNotifications)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.toggleThumb, desktopNotifications && styles.toggleThumbActive]} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Tab 3: Data & Storage */}
            {activeTab === 'storage' && (
              <View style={styles.tabContent}>
                <View style={styles.statsCard}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>{isKh ? 'បញ្ជីសន្ទនា (Dialogs)' : 'Active Dialogs'}</Text>
                    <Text style={styles.statVal}>{dialogsCount}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>{isKh ? 'ពិធីការ Sync' : 'Sync Engine'}</Text>
                    <Text style={styles.statVal}>MTProto 2.0</Text>
                  </View>
                </View>

                <View style={styles.actionRowBox}>
                  <TouchableOpacity
                    style={styles.outlineActionBtn}
                    onPress={handleClearCache}
                    activeOpacity={0.7}
                  >
                    <RemixIcon name="task-line" size={14} color="#0284C7" />
                    <Text style={styles.outlineActionText}>
                      {isKh ? 'លុបសម្អាត In-Memory Cache' : 'Clear In-Memory Cache'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.outlineActionBtn}
                    onPress={handleResync}
                    activeOpacity={0.7}
                  >
                    <RemixIcon name="chat-double-fill" size={14} color="#0284C7" />
                    <Text style={styles.outlineActionText}>
                      {isKh ? 'ទាញយកបញ្ជី Chats ឡើងវិញ' : 'Re-sync Dialogs'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Disconnect Confirmation Alert Box */}
            {showConfirmDisconnect ? (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmTitle}>
                  {isKh ? 'តើអ្នកពិតជាចង់ផ្តាច់គណនី Telegram មែនទេ?' : 'Disconnect Telegram Account?'}
                </Text>
                <Text style={styles.confirmSub}>
                  {isKh
                    ? 'បន្ទាប់ពីផ្តាច់ ការផ្ញើ និងទទួលសារនឹងត្រូវបញ្ឈប់រហូតដល់អ្នក Sign in ម្តងទៀត។'
                    : 'Real-time message synchronization will stop until you connect again.'}
                </Text>
                <View style={styles.confirmActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setShowConfirmDisconnect(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelBtnText}>{isKh ? 'បោះបង់' : 'Cancel'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmDisconnectBtn}
                    onPress={handleDisconnect}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmDisconnectBtnText}>
                      {isKh ? 'បាទ/ចាស ផ្តាច់គណនី' : 'Yes, Disconnect'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Footer Actions */
              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={styles.disconnectBtn}
                  onPress={() => setShowConfirmDisconnect(true)}
                  activeOpacity={0.7}
                >
                  <RemixIcon name="close-circle-fill" size={13} color="#DC2626" />
                  <Text style={styles.disconnectBtnText}>
                    {isKh ? 'ផ្តាច់ការភ្ជាប់ (Disconnect)' : 'Disconnect Account'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.doneBtnText}>{isKh ? 'រួចរាល់' : 'Done'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        ) : (
          /* Sign In Flow */
          <View style={styles.formContainer}>
            <Text style={styles.subtext}>
              {isKh
                ? 'ភ្ជាប់គណនី Telegram ផ្ទាល់ខ្លួនរបស់អ្នកដើម្បីជជែក និង Sync សារផ្ទាល់ក្នុង Desktop Workspace។'
                : 'Connect your personal Telegram account to chat and sync messages directly in Desktop Workspace.'}
            </Text>

            {!isCodeSent ? (
              /* Step 1: Input Phone Number */
              <View style={styles.stepBox}>
                <Text style={styles.fieldLabel}>
                  {isKh ? 'លេខទូរស័ព្ទ Telegram (រួមទាំងលេខកូដប្រទេស)៖' : 'Telegram Phone Number (with Country Code):'}
                </Text>

                <View style={styles.inputWrapper}>
                  <RemixIcon name="phone-fill" size={15} color="#64748B" />
                  <TextInput
                    style={styles.textInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+855 12 345 678"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    autoFocus={true}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryBtn, isConnecting && styles.btnDisabled]}
                  onPress={handleSendCode}
                  disabled={isConnecting || !phone.trim()}
                  activeOpacity={0.8}
                >
                  {isConnecting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <RemixIcon name="arrow-right-line" size={13} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>
                        {isKh ? 'ផ្ញើលេខកូដផ្ទៀងផ្ទាត់ (Send Code)' : 'Send Verification Code'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* Step 2: Input Verification Code & 2FA */
              <View style={styles.stepBox}>
                <View style={styles.codeNoticeBox}>
                  <RemixIcon name="information-fill" size={14} color="#0284C7" />
                  <Text style={styles.codeNoticeText}>
                    {isCodeViaApp
                      ? isKh
                        ? 'លេខកូដត្រូវបានផ្ញើទៅកាន់ Telegram App របស់អ្នក'
                        : 'Code was sent to your active Telegram App'
                      : isKh
                      ? 'លេខកូដត្រូវបានផ្ញើតាមរយៈ SMS'
                      : 'Code was sent via SMS'}
                  </Text>
                </View>

                <Text style={styles.fieldLabel}>
                  {isKh ? 'បញ្ចូលលេខកូដផ្ទៀងផ្ទាត់ (OTP Code)៖' : 'Enter Verification Code:'}
                </Text>

                <View style={styles.inputWrapper}>
                  <RemixIcon name="lock-line" size={15} color="#64748B" />
                  <TextInput
                    style={styles.textInput}
                    value={code}
                    onChangeText={setCode}
                    placeholder="12345"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    autoFocus={true}
                  />
                </View>

                {showPasswordInput ? (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.fieldLabel}>
                      {isKh ? 'ពាក្យសម្ងាត់ Two-Step Verification (2FA)៖' : '2-Step Verification Password (2FA):'}
                    </Text>
                    <View style={styles.inputWrapper}>
                      <RemixIcon name="lock-unlock-line" size={15} color="#64748B" />
                      <TextInput
                        style={styles.textInput}
                        value={password}
                        onChangeText={setPassword}
                        placeholder={isKh ? 'បញ្ចូល 2FA Password' : 'Enter 2FA Password'}
                        placeholderTextColor="#94A3B8"
                        secureTextEntry={true}
                      />
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.twoFaToggle}
                    onPress={() => setShowPasswordInput(true)}
                  >
                    <Text style={styles.twoFaToggleText}>
                      {isKh ? '+ គណនីមានភ្ជាប់ 2FA Password?' : '+ Account has 2FA Password?'}
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={resetSignInState}
                    disabled={isConnecting}
                  >
                    <Text style={styles.secondaryBtnText}>{isKh ? 'ត្រឡប់ក្រោយ' : 'Back'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryBtnFlex, isConnecting && styles.btnDisabled]}
                    onPress={handleVerify}
                    disabled={isConnecting || !code.trim()}
                    activeOpacity={0.8}
                  >
                    {isConnecting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <RemixIcon name="check-line" size={13} color="#FFFFFF" />
                        <Text style={styles.primaryBtnText}>
                          {isKh ? 'ផ្ទៀងផ្ទាត់ និងភ្ជាប់' : 'Verify & Connect'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scroll: {
    width: '100%',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  avatarPickerWrap: {
    position: 'relative',
    cursor: 'pointer',
  } as any,
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0284C7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextCol: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileName: {
    fontSize: 14.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
  },
  profileHandle: {
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#0284C7',
  },
  profilePhone: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFFCEE',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  activePillText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    color: '#15803D',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    gap: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  tabBtnText: {
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  tabBtnTextActive: {
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
  },
  tabContent: {
    gap: 12,
    marginBottom: 14,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    cursor: 'pointer',
  } as any,
  changePhotoBtnText: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    color: '#0284C7',
  },
  editPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  editPillText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#0284C7',
  },
  cancelEditBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cancelEditText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  infoGrid: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoKey: {
    width: 80,
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  infoValue: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    color: '#334155',
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 7,
    paddingHorizontal: 9,
    height: 36,
  },
  inputPrefix: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
    marginRight: 4,
  },
  formInput: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
    outlineStyle: 'none',
  } as any,
  saveProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 9,
    borderRadius: 7,
    marginTop: 4,
  },
  saveProfileBtnText: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#334155',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  settingTextCol: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
  },
  settingDesc: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  toggleBtn: {
    width: 38,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    padding: 2,
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#0284C7',
  },
  toggleBtnGhostActive: {
    backgroundColor: '#7C3AED',
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  toggleThumbGhostActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
  },
  ghostCardActive: {
    borderColor: '#C4B5FD',
    backgroundColor: '#FAF5FF',
  },
  ghostBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ghostBadgeText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  statVal: {
    fontSize: 14.5,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  actionRowBox: {
    gap: 8,
  },
  outlineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  outlineActionText: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    color: '#0F172A',
  },
  confirmBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginTop: 4,
  },
  confirmTitle: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    color: '#991B1B',
  },
  confirmSub: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#B91C1C',
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cancelBtnText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#475569',
  },
  confirmDisconnectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#DC2626',
  },
  confirmDisconnectBtnText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  disconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  disconnectBtnText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#DC2626',
  },
  doneBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 7,
  },
  doneBtnText: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
  },
  formContainer: {
    width: '100%',
    gap: 14,
  },
  subtext: {
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    lineHeight: 18,
  },
  stepBox: {
    width: '100%',
    gap: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    color: '#334155',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    fontFamily: 'Krasar-Regular',
    color: '#0F172A',
    outlineStyle: 'none',
  } as any,
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  primaryBtnFlex: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryBtnText: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  codeNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 9,
    borderRadius: 8,
  },
  codeNoticeText: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#0369A1',
  },
  twoFaToggle: {
    paddingVertical: 4,
  },
  twoFaToggleText: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    color: '#0284C7',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#475569',
  },
});
