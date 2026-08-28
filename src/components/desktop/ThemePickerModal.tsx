import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { useThemeStore } from '../../store/useThemeStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  ThemeMode,
  AccentColor,
  BubbleStyle,
  TikTokBubbleId,
  ACCENT_PALETTES,
  BUBBLE_COLOR_PRESETS,
  BUBBLE_STYLE_OPTIONS,
  TIKTOK_BUBBLE_PRESETS,
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
  const [activeTab, setActiveTab] = useState<'tiktok' | 'theme'>('tiktok');

  const mode = useThemeStore((state) => state.mode);
  const accent = useThemeStore((state) => state.accent);
  const bubbleStyle = useThemeStore((state) => state.bubbleStyle);
  const tiktokBubbleId = useThemeStore((state) => state.tiktokBubbleId);
  const customBubbleOutgoing = useThemeStore((state) => state.customBubbleOutgoing);
  const tokens = useThemeStore((state) => state.tokens);
  const isAutoNight = useThemeStore((state) => state.isAutoNight);
  const setMode = useThemeStore((state) => state.setMode);
  const setAccent = useThemeStore((state) => state.setAccent);
  const setBubbleStyle = useThemeStore((state) => state.setBubbleStyle);
  const setTikTokBubbleId = useThemeStore((state) => state.setTikTokBubbleId);
  const setCustomBubbleOutgoing = useThemeStore((state) => state.setCustomBubbleOutgoing);
  const setIsAutoNight = useThemeStore((state) => state.setIsAutoNight);
  const language = useLanguageStore((state) => state.language);
  const isKh = language === 'kh';

  if (!visible) return null;

  const currentBubbleOutgoing = customBubbleOutgoing || tokens.bubbleOutgoing;
  const currentTikTokPreset = TIKTOK_BUBBLE_PRESETS.find((p) => p.id === tiktokBubbleId) || TIKTOK_BUBBLE_PRESETS[1];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.modalCard, { backgroundColor: tokens.surfaceBg, borderColor: tokens.borderSubtle }]} onPress={(e) => e.stopPropagation()}>
          {/* Header Bar */}
          <View style={[styles.header, { borderBottomColor: tokens.borderSubtle }]}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.navActionText, { color: tokens.textSecondary }]}>
                {isKh ? 'បោះបង់' : 'Cancel'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.modalMainTitle, { color: tokens.textPrimary }]}>
              {activeTab === 'tiktok' ? (isKh ? 'ជ្រើសរើសរចនាប័ទ្មពពុះសារ' : 'Select bubble style') : (isKh ? 'រូបរាង & ពណ៌ចម្បង' : 'Appearance & Themes')}
            </Text>

            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.navActionText, { color: tokens.accentColor, fontWeight: '700' }]}>
                {isKh ? 'រក្សាទុក' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Navigation Sub-Tabs */}
          <View style={[styles.tabBar, { borderBottomColor: tokens.borderSubtle }]}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'tiktok' && [styles.tabBtnActive, { borderBottomColor: tokens.accentColor }],
              ]}
              onPress={() => setActiveTab('tiktok')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, { color: activeTab === 'tiktok' ? tokens.textPrimary : tokens.textSecondary }]}>
                🫧 {isKh ? 'រចនាប័ទ្ម TikTok Bubble' : 'TikTok Bubble Style'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'theme' && [styles.tabBtnActive, { borderBottomColor: tokens.accentColor }],
              ]}
              onPress={() => setActiveTab('theme')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, { color: activeTab === 'theme' ? tokens.textPrimary : tokens.textSecondary }]}>
                🎨 {isKh ? 'ប្រព័ន្ធ Theme & ពណ៌' : 'Base Themes & Colors'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {activeTab === 'tiktok' ? (
              /* TAB 1: EXACT TIKTOK BUBBLE STYLE SELECTOR */
              <View style={styles.ttContainer}>
                {/* 1. Live Decorated Bubble Preview at the top */}
                <View style={[styles.ttPreviewBox, { backgroundColor: mode === 'light' ? '#F8FAFC' : '#05070B', borderColor: tokens.borderSubtle }]}>
                  <View
                    style={[
                      styles.ttDecoratedBubble,
                      getBubbleBorderRadius(tokens.bubbleStyle, true),
                      {
                        backgroundColor: tokens.bubbleOutgoing,
                        borderColor: tokens.bubbleOutgoingBorder,
                      },
                    ]}
                  >
                    {/* Character Corner Badges */}
                    {Boolean(tokens.tiktokBubbleDecor?.topLeft) && (
                      <Text style={styles.ttDecorTopLeft}>{tokens.tiktokBubbleDecor?.topLeft}</Text>
                    )}
                    {Boolean(tokens.tiktokBubbleDecor?.topRight) && (
                      <Text style={styles.ttDecorTopRight}>{tokens.tiktokBubbleDecor?.topRight}</Text>
                    )}
                    {Boolean(tokens.tiktokBubbleDecor?.bottomLeft) && (
                      <Text style={styles.ttDecorBottomLeft}>{tokens.tiktokBubbleDecor?.bottomLeft}</Text>
                    )}
                    {Boolean(tokens.tiktokBubbleDecor?.bottomRight) && (
                      <Text style={styles.ttDecorBottomRight}>{tokens.tiktokBubbleDecor?.bottomRight}</Text>
                    )}

                    <Text style={[styles.ttBubbleText, { color: tokens.bubbleOutgoingText }]}>
                      {currentTikTokPreset.previewSample || 'Did you know you can change your bubble style and all your chats get the new look? So cool! ✨'}
                    </Text>
                  </View>
                </View>

                {/* Subtitle helper note */}
                <Text style={[styles.ttHelperText, { color: tokens.textSecondary }]}>
                  {isKh
                    ? 'ពពុះសារនេះនឹងអនុវត្តលើគ្រប់ការជជែក Chat ទាំងអស់។ វាមានប្រសិទ្ធភាពភ្លាមៗបន្ទាប់ពីរើសរួច។'
                    : 'The bubble applies to all chats. It only affects messages you send after saving.'}
                </Text>

                {/* 2. 3-Column TikTok Grid */}
                <View style={styles.ttPresetsGrid}>
                  {TIKTOK_BUBBLE_PRESETS.map((preset) => {
                    const isSelected = tiktokBubbleId === preset.id;
                    const isDark = mode === 'dark' || mode === 'midnight' || mode === 'tiktok';
                    const previewBg = isDark ? preset.bgDark : preset.bgLight;
                    const previewBorder = isDark ? preset.borderDark : preset.borderLight;
                    const previewText = isDark ? preset.textDark : preset.textLight;

                    return (
                      <TouchableOpacity
                        key={preset.id}
                        style={[
                          styles.ttPresetCard,
                          {
                            borderColor: isSelected ? tokens.accentColor : 'transparent',
                            backgroundColor: isSelected ? tokens.accentSoft : 'transparent',
                          },
                        ]}
                        onPress={() => setTikTokBubbleId(preset.id)}
                        activeOpacity={0.8}
                      >
                        {/* Mini Bubble Demo with Corners */}
                        <View style={styles.ttMiniBubbleWrapper}>
                          <View
                            style={[
                              styles.ttMiniBubble,
                              getBubbleBorderRadius(tokens.bubbleStyle, true),
                              {
                                backgroundColor: previewBg,
                                borderColor: previewBorder,
                              },
                            ]}
                          >
                            {Boolean(preset.topLeftEmoji) && (
                              <Text style={styles.ttMiniDecorTopLeft}>{preset.topLeftEmoji}</Text>
                            )}
                            {Boolean(preset.topRightEmoji) && (
                              <Text style={styles.ttMiniDecorTopRight}>{preset.topRightEmoji}</Text>
                            )}
                            {Boolean(preset.bottomLeftEmoji) && (
                              <Text style={styles.ttMiniDecorBottomLeft}>{preset.bottomLeftEmoji}</Text>
                            )}
                            {Boolean(preset.bottomRightEmoji) && (
                              <Text style={styles.ttMiniDecorBottomRight}>{preset.bottomRightEmoji}</Text>
                            )}

                            <View style={[styles.ttMiniLine, { backgroundColor: previewText, opacity: 0.7 }]} />
                            <View style={[styles.ttMiniLine, { backgroundColor: previewText, width: '60%', opacity: 0.7 }]} />
                          </View>
                        </View>

                        <Text
                          style={[
                            styles.ttPresetLabel,
                            {
                              color: isSelected ? tokens.textPrimary : tokens.textSecondary,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {isKh ? preset.khLabel : preset.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              /* TAB 2: BASE THEMES & PALETTES */
              <View>
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

                {/* Section 2: Custom Message Bubble Shapes (TikTok / Telegram / Capsule / Minimal) */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: tokens.textPrimary }]}>
                    {isKh ? '២. រចនាប័ទ្មរាងពពុះសារ (Bubble Shape & Curvature)' : '2. Bubble Shape & Corner Radius'}
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

                {/* Section 3: Accent Highlights */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: tokens.textPrimary }]}>
                    {isKh ? '៣. ពណ៌រំលេចចម្បង (Accent Highlights)' : '3. Accent Highlights'}
                  </Text>
                  <View style={styles.accentRow}>
                    {(Object.keys(ACCENT_PALETTES) as AccentColor[]).map((key) => {
                      const pal = ACCENT_PALETTES[key];
                      const isSelected = accent === key;
                      return (
                        <TouchableOpacity
                          key={key}
                          style={[
                            styles.accentBtn,
                            { borderColor: isSelected ? tokens.textPrimary : 'transparent' },
                          ]}
                          onPress={() => setAccent(key)}
                          activeOpacity={0.8}
                        >
                          <View style={[styles.accentColorDot, { backgroundColor: pal.hex }]}>
                            {isSelected && <RemixIcon name="check-line" size={14} color="#FFFFFF" />}
                          </View>
                          <Text style={[styles.accentLabel, { color: isSelected ? tokens.textPrimary : tokens.textSecondary, fontWeight: isSelected ? '700' : '500' }]}>
                            {isKh ? pal.khLabel : pal.label.split(' ')[0]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Section 4: Auto-Night Follow System Setting */}
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
              </View>
            )}
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
  modalMainTitle: {
    fontSize: 14.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
  },
  navActionText: {
    fontSize: 13,
    fontFamily: 'Krasar-Bold',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 14,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
  },
  // TikTok Bubble Screen Styles
  ttContainer: {
    paddingTop: 8,
  },
  ttPreviewBox: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  ttDecoratedBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '90%',
    borderWidth: 1.5,
    position: 'relative',
  },
  ttBubbleText: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    lineHeight: 18,
    textAlign: 'center',
  },
  ttDecorTopLeft: {
    position: 'absolute',
    top: -12,
    left: -8,
    fontSize: 18,
    zIndex: 10,
  },
  ttDecorTopRight: {
    position: 'absolute',
    top: -12,
    right: -8,
    fontSize: 18,
    zIndex: 10,
  },
  ttDecorBottomLeft: {
    position: 'absolute',
    bottom: -10,
    left: -8,
    fontSize: 16,
    zIndex: 10,
  },
  ttDecorBottomRight: {
    position: 'absolute',
    bottom: -10,
    right: -8,
    fontSize: 16,
    zIndex: 10,
  },
  ttHelperText: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  ttPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ttPresetCard: {
    width: '31.3%',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 8,
  },
  ttMiniBubbleWrapper: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ttMiniBubble: {
    width: '85%',
    height: 34,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  ttMiniLine: {
    width: '80%',
    height: 2.5,
    borderRadius: 1.5,
  },
  ttMiniDecorTopLeft: {
    position: 'absolute',
    top: -8,
    left: -4,
    fontSize: 11,
    zIndex: 10,
  },
  ttMiniDecorTopRight: {
    position: 'absolute',
    top: -8,
    right: -4,
    fontSize: 11,
    zIndex: 10,
  },
  ttMiniDecorBottomLeft: {
    position: 'absolute',
    bottom: -6,
    left: -4,
    fontSize: 10,
    zIndex: 10,
  },
  ttMiniDecorBottomRight: {
    position: 'absolute',
    bottom: -6,
    right: -4,
    fontSize: 10,
    zIndex: 10,
  },
  ttPresetLabel: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    textAlign: 'center',
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
