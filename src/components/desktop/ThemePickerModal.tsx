import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  ThemeMode,
  AccentColor,
  BubbleStyle,
  ACCENT_PALETTES,
  BUBBLE_COLOR_PRESETS,
  BUBBLE_STYLE_OPTIONS,
  getBubbleBorderRadius,
} from '../../styles/theme';
import { RemixIcon } from '../ui/RemixIcon';

interface ThemePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ThemeOption {
  id: ThemeMode;
  label: string;
  khLabel: string;
  desc: string;
  khDesc: string;
  icon: any;
  bgHex: string;
  surfaceHex: string;
  borderHex: string;
  textHex: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    label: 'Classic Light',
    khLabel: 'ពន្លឺបុរាណ',
    desc: 'Clean, high contrast Nordic white surface',
    khDesc: 'ផ្ទៃសស្អាតបាត កម្រិតពណ៌ច្បាស់',
    icon: 'sun-line',
    bgHex: '#FFFFFF',
    surfaceHex: '#F8FAFC',
    borderHex: '#E2E8F0',
    textHex: '#0F172A',
  },
  {
    id: 'tiktok',
    label: 'TikTok Dark',
    khLabel: 'TikTok ងងឹត',
    desc: 'TikTok-style neon coral on sleek dark surface',
    khDesc: 'រចនាប័ទ្ម TikTok ពណ៌ក្រហមផ្កាឈូក រំលេចលើផ្ទៃងងឹត',
    icon: 'music-2-line',
    bgHex: '#121212',
    surfaceHex: '#161823',
    borderHex: '#2F3142',
    textHex: '#FFFFFF',
  },
  {
    id: 'dark',
    label: 'Slate Navy',
    khLabel: 'ខៀវងងឹត (Night)',
    desc: 'Telegram-style deep navy slate',
    khDesc: 'ផ្ទៃពណ៌ខៀវងងឹតស្រទន់ ងាយស្រួលមើលពេលយប់',
    icon: 'moon-line',
    bgHex: '#0F172A',
    surfaceHex: '#1E293B',
    borderHex: '#334155',
    textHex: '#F8FAFC',
  },
  {
    id: 'midnight',
    label: 'Obsidian OLED',
    khLabel: 'ខ្មៅសុទ្ធ (OLED)',
    desc: 'Pure jet black with ultra-vibrant contrast',
    khDesc: 'ផ្ទៃខ្មៅសុទ្ធកម្រិតខ្ពស់ សន្សំសំចៃថ្ម',
    icon: 'contrast-drop-2-line',
    bgHex: '#05070B',
    surfaceHex: '#0B0F17',
    borderHex: '#1E293B',
    textHex: '#FFFFFF',
  },
  {
    id: 'warm',
    label: 'Matcha Cream',
    khLabel: 'ពណ៌ក្រែមទន់',
    desc: 'Warm ivory editorial comfort',
    khDesc: 'ផ្ទៃពណ៌ក្រែមទន់ភ្នែក បែបស្ងប់ស្ងាត់',
    icon: 'cup-line',
    bgHex: '#F7F6F2',
    surfaceHex: '#FFFFFF',
    borderHex: '#E5E1D8',
    textHex: '#2D312E',
  },
];

export const ThemePickerModal: React.FC<ThemePickerModalProps> = ({ visible, onClose }) => {
  const mode = useThemeStore((state) => state.mode);
  const accent = useThemeStore((state) => state.accent);
  const bubbleStyle = useThemeStore((state) => state.bubbleStyle);
  const customBubbleOutgoing = useThemeStore((state) => state.customBubbleOutgoing);
  const tokens = useThemeStore((state) => state.tokens);
  const isAutoNight = useThemeStore((state) => state.isAutoNight);
  const setMode = useThemeStore((state) => state.setMode);
  const setAccent = useThemeStore((state) => state.setAccent);
  const setBubbleStyle = useThemeStore((state) => state.setBubbleStyle);
  const setCustomBubbleOutgoing = useThemeStore((state) => state.setCustomBubbleOutgoing);
  const setIsAutoNight = useThemeStore((state) => state.setIsAutoNight);
  const language = useLanguageStore((state) => state.language);
  const isKh = language === 'kh';

  if (!visible) return null;

  const currentBubbleOutgoing = customBubbleOutgoing || tokens.bubbleOutgoing;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.modalCard, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: tokens.borderSubtle }]}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.headerIconBox, { backgroundColor: tokens.accentSoft }]}>
                <RemixIcon name="palette-line" size={16} color={tokens.accentColor} />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>
                  {isKh ? 'រូបរាង & ពណ៌ចម្បង' : 'Appearance & Themes'}
                </Text>
                <Text style={[styles.headerSub, { color: tokens.textSecondary }]}>
                  {isKh ? 'កំណត់រចនាប័ទ្ម TikTok & Telegram តាមចំណូលចិត្ត' : 'Customize your workspace style, TikTok bubbles & accent palette'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={[styles.closeBtn, { borderColor: tokens.borderSubtle }]} onPress={onClose} activeOpacity={0.7}>
              <RemixIcon name="close-line" size={15} color={tokens.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Section 1: Base Themes (5 Presets) */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: tokens.textPrimary }]}>
                {isKh ? '១. រូបរាងផ្ទៃមេ (Base Theme Mode)' : '1. Base Theme Mode'}
              </Text>

              <View style={styles.themeGrid}>
                {THEME_OPTIONS.map((opt) => {
                  const isSelected = mode === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.themeCard,
                        {
                          backgroundColor: opt.bgHex,
                          borderColor: isSelected ? tokens.accentColor : opt.borderHex,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => setMode(opt.id)}
                      activeOpacity={0.8}
                    >
                      {/* Mini Mock UI Preview inside card */}
                      <View style={[styles.mockBar, { backgroundColor: opt.surfaceHex, borderColor: opt.borderHex }]}>
                        <View style={[styles.mockDot, { backgroundColor: tokens.accentColor }]} />
                        <View style={[styles.mockLine, { backgroundColor: opt.borderHex, width: 40 }]} />
                      </View>

                      <View style={styles.themeCardFooter}>
                        <View style={styles.themeCardInfo}>
                          <Text style={[styles.themeCardName, { color: opt.textHex }]}>
                            {isKh ? opt.khLabel : opt.label}
                          </Text>
                          <Text style={[styles.themeCardDesc, { color: opt.textHex, opacity: 0.6 }]} numberOfLines={1}>
                            {isKh ? opt.khDesc : opt.desc}
                          </Text>
                        </View>

                        {isSelected && (
                          <View style={[styles.selectedCheckBadge, { backgroundColor: tokens.accentColor }]}>
                            <RemixIcon name="check-line" size={11} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 2: Custom Message Bubble Styles & Shapes (TikTok / Telegram / Capsule / Minimal) */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: tokens.textPrimary }]}>
                {isKh ? '២. រចនាប័ទ្មរាងពពុះសារ (Bubble Shape & Style)' : '2. Message Bubble Shape'}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: tokens.textSecondary }]}>
                {isKh ? 'ជ្រើសរើសរាងកោងនៃ Bubble សារបែប TikTok ឬ Telegram' : 'Choose curved corner styling for chat bubbles'}
              </Text>

              <View style={styles.bubbleStyleGrid}>
                {BUBBLE_STYLE_OPTIONS.map((opt) => {
                  const isSelected = bubbleStyle === opt.id;
                  const radiusStyle = getBubbleBorderRadius(opt.id, true);
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.bubbleStyleCard,
                        {
                          backgroundColor: tokens.surfaceMuted,
                          borderColor: isSelected ? tokens.accentColor : tokens.borderSubtle,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => setBubbleStyle(opt.id)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.miniBubbleDemo,
                          radiusStyle,
                          { backgroundColor: isSelected ? tokens.accentColor : tokens.borderStrong },
                        ]}
                      >
                        <Text style={styles.miniBubbleText}>{opt.label.split(' ')[0]}</Text>
                      </View>
                      <Text style={[styles.bubbleStyleLabel, { color: isSelected ? tokens.textPrimary : tokens.textSecondary, fontWeight: isSelected ? '700' : '500' }]}>
                        {isKh ? opt.khLabel : opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 3: TikTok & Custom Bubble Outgoing Colors */}
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.sectionTitle, { color: tokens.textPrimary }]}>
                  {isKh ? '៣. ពណ៌ពពុះសារផ្ញើចេញ (Custom Bubble Color)' : '3. Outgoing Bubble Color'}
                </Text>
                {Boolean(customBubbleOutgoing) && (
                  <TouchableOpacity onPress={() => setCustomBubbleOutgoing(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={{ fontSize: 11, fontFamily: 'Krasar-Bold', color: tokens.accentColor }}>
                      {isKh ? 'កំណត់ដើម (Reset)' : 'Reset Default'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={[styles.sectionSubtitle, { color: tokens.textSecondary }]}>
                {isKh ? 'ជ្រើសរើសពណ៌ TikTok Red, Electric Cyan, Neon Purple ឬ ពណ៌ផ្សេងៗ' : 'Choose TikTok neon coral, electric cyan, or vibrant custom tints'}
              </Text>

              <View style={styles.accentRow}>
                {BUBBLE_COLOR_PRESETS.map((item) => {
                  const isSelected = currentBubbleOutgoing.toLowerCase() === item.hex.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.accentBtn,
                        { borderColor: isSelected ? tokens.textPrimary : 'transparent' },
                      ]}
                      onPress={() => setCustomBubbleOutgoing(item.hex)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.accentColorDot, { backgroundColor: item.hex }]}>
                        {isSelected && <RemixIcon name="check-line" size={14} color="#FFFFFF" />}
                      </View>
                      <Text style={[styles.accentLabel, { color: isSelected ? tokens.textPrimary : tokens.textSecondary, fontWeight: isSelected ? '700' : '500' }]}>
                        {isKh ? item.khLabel : item.label.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 4: Live Theme Interactive Preview */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: tokens.textPrimary }]}>
                {isKh ? '៤. ទិដ្ឋភាពជាក់ស្តែង (Live Preview)' : '4. Real-Time Preview'}
              </Text>

              <View style={[styles.previewContainer, { backgroundColor: tokens.windowBg, borderColor: tokens.borderSubtle }]}>
                {/* Incoming Message Bubble */}
                <View
                  style={[
                    styles.previewBubbleIn,
                    getBubbleBorderRadius(tokens.bubbleStyle, false),
                    { backgroundColor: tokens.bubbleIncoming, borderColor: tokens.bubbleIncomingBorder },
                  ]}
                >
                  <Text style={[styles.previewBubbleTextIn, { color: tokens.bubbleIncomingText }]}>
                    {isKh ? 'សួស្តីបង! ប្រព័ន្ធ Theme ថ្មីនេះស្អាត និងទាន់សម័យណាស់ ✨' : 'Hello! This TikTok & Telegram theme engine looks ultra-clean ✨'}
                  </Text>
                </View>

                {/* Outgoing Message Bubble (Tinted with chosen bubble color/shape) */}
                <View
                  style={[
                    styles.previewBubbleOut,
                    getBubbleBorderRadius(tokens.bubbleStyle, true),
                    { backgroundColor: tokens.bubbleOutgoing, borderColor: tokens.bubbleOutgoingBorder },
                  ]}
                >
                  <Text style={[styles.previewBubbleTextOut, { color: tokens.bubbleOutgoingText }]}>
                    {isKh ? 'អស្ចារ្យណាស់! ពណ៌រំលេចស៊ីគ្នាយ៉ាងឥតខ្ចោះ 🚀' : 'Super sleek! Perfectly matches my personal style 🚀'}
                  </Text>
                </View>

                {/* Sample Action Buttons & Badges */}
                <View style={styles.previewActionsRow}>
                  <View style={[styles.previewPill, { backgroundColor: tokens.accentSoft, borderColor: tokens.accentBorder }]}>
                    <RemixIcon name="sparkles-fill" size={11} color={tokens.accentColor} />
                    <Text style={[styles.previewPillText, { color: tokens.accentColor }]}>
                      {isKh ? 'មុខងារពិសេស' : 'Active Feature'}
                    </Text>
                  </View>

                  <TouchableOpacity style={[styles.previewButton, { backgroundColor: tokens.accentColor }]} activeOpacity={0.8}>
                    <Text style={[styles.previewButtonText, { color: tokens.accentFg }]}>
                      {isKh ? 'ប៊ូតុងសាកល្បង' : 'Primary Action'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Section 5: Auto-Night Follow System Setting */}
            <View style={[styles.settingRow, { borderTopColor: tokens.borderSubtle }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: tokens.textPrimary }]}>
                  {isKh ? 'ប្តូរពណ៌ស្វ័យប្រវត្តិតាមម៉ាស៊ីន (Follow System)' : 'Follow System Appearance'}
                </Text>
                <Text style={[styles.settingDesc, { color: tokens.textSecondary }]}>
                  {isKh ? 'ប្តូរទៅ Dark Mode នៅពេលប្រព័ន្ធកុំព្យូទ័រ macOS/Windows ប្រើ Dark Mode' : 'Automatically switch light/dark mode based on macOS/Windows settings'}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.toggleTrack,
                  { backgroundColor: isAutoNight ? tokens.accentColor : tokens.borderSubtle },
                ]}
                onPress={() => setIsAutoNight(!isAutoNight)}
                activeOpacity={0.8}
              >
                <View style={[styles.toggleThumb, isAutoNight && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 580,
    maxHeight: '90%',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    marginTop: 1,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    marginBottom: 10,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  themeCard: {
    width: '48.5%',
    borderRadius: 8,
    padding: 10,
    minHeight: 85,
    justifyContent: 'space-between',
  },
  mockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
  },
  mockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  mockLine: {
    height: 4,
    borderRadius: 2,
  },
  themeCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  themeCardInfo: {
    flex: 1,
  },
  themeCardName: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  themeCardDesc: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Regular',
    marginTop: 1,
  },
  selectedCheckBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  bubbleStyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  bubbleStyleCard: {
    width: '48.5%',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  miniBubbleDemo: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBubbleText: {
    fontSize: 9.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bubbleStyleLabel: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    textAlign: 'center',
  },
  accentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  accentBtn: {
    width: '23.2%',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  accentColorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  accentLabel: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    textAlign: 'center',
  },
  previewContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginTop: 8,
  },
  previewBubbleIn: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewBubbleTextIn: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    lineHeight: 16,
  },
  previewBubbleOut: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewBubbleTextOut: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Regular',
    lineHeight: 16,
  },
  previewActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
  },
  previewPillText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  previewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  previewButtonText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 14,
  },
  settingLabel: {
    fontSize: 11.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    marginTop: 2,
  },
  toggleTrack: {
    width: 36,
    height: 20,
    borderRadius: 10,
    padding: 2,
    justifyContent: 'center',
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
});
