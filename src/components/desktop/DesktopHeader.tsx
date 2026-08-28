import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { useAuthStore } from '../../store/useAuthStore';
import { useDesktopStore } from '../../store/useDesktopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { RemixIcon } from '../ui/RemixIcon';
import { LanguageToggle } from '../ui/LanguageToggle';
import { ModernAvatar } from '../ui/ModernAvatar';

// macOS Panel Layout Icons (Matching Arc / Native macOS Toolbars)
const PanelLeftIcon: React.FC<{ active?: boolean; size?: number; color?: string }> = ({
  active = false,
  size = 15,
  color = '#475569',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Rect x="2.5" y="3" width="15" height="14" rx="3" stroke={color} strokeWidth="1.5" />
    <Path d="M7.5 3V17" stroke={color} strokeWidth="1.5" />
    {active && <Rect x="3.2" y="3.8" width="3.6" height="12.4" rx="1.5" fill={color} />}
  </Svg>
);

const PanelBottomIcon: React.FC<{ active?: boolean; size?: number; color?: string }> = ({
  active = false,
  size = 15,
  color = '#475569',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Rect x="2.5" y="3" width="15" height="14" rx="3" stroke={color} strokeWidth="1.5" />
    <Path d="M2.5 12H17.5" stroke={color} strokeWidth="1.5" />
    {active && <Rect x="3.2" y="12.8" width="13.6" height="3.4" rx="1.5" fill={color} />}
  </Svg>
);

const PanelRightIcon: React.FC<{ active?: boolean; size?: number; color?: string }> = ({
  active = false,
  size = 15,
  color = '#475569',
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Rect x="2.5" y="3" width="15" height="14" rx="3" stroke={color} strokeWidth="1.5" />
    <Path d="M12.5 3V17" stroke={color} strokeWidth="1.5" />
    {active && <Rect x="13.2" y="3.8" width="3.6" height="12.4" rx="1.5" fill={color} />}
  </Svg>
);

import { UserProfileModal } from './UserProfileModal';
import { ThemePickerModal } from './ThemePickerModal';

export const DesktopHeader: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const activeModule = useDesktopStore((state) => state.activeModule);
  const setActiveModule = useDesktopStore((state) => state.setActiveModule);
  const isSidebarVisible = useDesktopStore((state) => state.isSidebarVisible);
  const toggleSidebar = useDesktopStore((state) => state.toggleSidebar);
  const sidebarMode = useDesktopStore((state) => state.sidebarMode);
  const toggleSidebarMode = useDesktopStore((state) => state.toggleSidebarMode);
  const isRightPanelVisible = useDesktopStore((state) => state.isRightPanelVisible);
  const toggleRightPanel = useDesktopStore((state) => state.toggleRightPanel);
  const t = useLanguageStore((state) => state.t);

  const syncGithubEvents = useDesktopStore((state) => state.syncGithubEvents);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBottomOpen, setIsBottomOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleGlobalRefresh = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await syncGithubEvents();
    } catch (err) {
      console.error('Failed to sync events in navbar:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const isSidebarExpanded = sidebarMode === 'expanded';

  return (
    <View style={styles.header}>
      {/* 1. Left: Native macOS Traffic Light Spacing */}
      <View style={styles.leftSpacer} />

      {/* 2. Right: macOS Toolbar Controls (Matching Arc Browser / macOS Topbar) */}
      <View style={styles.rightSection}>
        {/* Left Sidebar Panel Toggle (Expands / Collapses Labels) */}
        <TouchableOpacity
          style={[styles.toolIconBtn, isSidebarExpanded && styles.toolIconBtnActive]}
          onPress={toggleSidebarMode}
          activeOpacity={0.7}
        >
          <PanelLeftIcon active={isSidebarExpanded} size={15} color={isSidebarExpanded ? '#0F172A' : '#64748B'} />
        </TouchableOpacity>

        {/* Bottom Panel Toggle */}
        <TouchableOpacity
          style={[styles.toolIconBtn, isBottomOpen && styles.toolIconBtnActive]}
          onPress={() => setIsBottomOpen(!isBottomOpen)}
          activeOpacity={0.7}
        >
          <PanelBottomIcon active={isBottomOpen} size={15} color={isBottomOpen ? '#0F172A' : '#64748B'} />
        </TouchableOpacity>

        {/* Right Sidebar / Details Panel Toggle (Only in Calendar Module) */}
        {activeModule === 'calendar' && (
          <TouchableOpacity
            style={[styles.toolIconBtn, isRightPanelVisible && styles.toolIconBtnActive]}
            onPress={toggleRightPanel}
            activeOpacity={0.7}
          >
            <PanelRightIcon active={isRightPanelVisible} size={15} color={isRightPanelVisible ? '#0F172A' : '#64748B'} />
          </TouchableOpacity>
        )}

        {/* Global Refresh / Sync Action Button (Icon Only) */}
        <TouchableOpacity
          style={[styles.toolIconBtn, isSyncing && styles.toolIconBtnActive]}
          onPress={handleGlobalRefresh}
          activeOpacity={0.7}
          disabled={isSyncing}
        >
          <RemixIcon name="refresh-line" size={14} color={isSyncing ? '#2563EB' : '#64748B'} />
        </TouchableOpacity>

        {/* Quick Search Button */}
        <TouchableOpacity style={styles.toolIconBtn} activeOpacity={0.7}>
          <RemixIcon name="search-line" size={14} color="#64748B" />
        </TouchableOpacity>

        {/* Subtle Vertical Divider */}
        <View style={styles.vDivider} />

        {/* AI Copilot Quick Jump Button */}
        <TouchableOpacity
          style={[styles.toolIconBtn, activeModule === 'copilot' && styles.toolIconBtnActive]}
          onPress={() => setActiveModule('copilot')}
          activeOpacity={0.7}
        >
          <RemixIcon name="sparkles-fill" size={14} color={activeModule === 'copilot' ? '#6366F1' : '#64748B'} />
        </TouchableOpacity>

        {/* Theme Palette Customizer Button */}
        <TouchableOpacity
          style={[styles.toolIconBtn, themeModalOpen && styles.toolIconBtnActive]}
          onPress={() => setThemeModalOpen(true)}
          activeOpacity={0.7}
        >
          <RemixIcon name="palette-line" size={14} color={themeModalOpen ? '#6366F1' : '#64748B'} />
        </TouchableOpacity>

        {/* Settings Gear Button */}
        <TouchableOpacity
          style={[styles.toolIconBtn, activeModule === 'settings' && styles.toolIconBtnActive]}
          onPress={() => setActiveModule('settings')}
          activeOpacity={0.7}
        >
          <RemixIcon name="settings-3-line" size={14} color={activeModule === 'settings' ? '#0F172A' : '#64748B'} />
        </TouchableOpacity>

        {/* Unified Profile Pill with Avatar & Dropdown Chevron */}
        {user ? (
          <TouchableOpacity
            style={[styles.userProfileBtn, menuOpen && styles.userProfileBtnActive]}
            onPress={() => setMenuOpen(!menuOpen)}
            activeOpacity={0.8}
          >
            <ModernAvatar
              name={user.name}
              avatarUrl={user.avatar}
              size={22}
              showPresence={true}
              isOnline={true}
            />
            <RemixIcon name="chevron-down-line" size={11} color="#64748B" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* User Profile Dropdown Menu Modal */}
      {menuOpen && (
        <Modal transparent visible={menuOpen} onRequestClose={() => setMenuOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setMenuOpen(false)}>
            <Pressable style={styles.menuDropdown} onPress={(e) => e.stopPropagation()}>
              {/* Profile Card Header -> Opens Profile Modal */}
              {user && (
                <TouchableOpacity
                  style={styles.menuProfileHeader}
                  onPress={() => {
                    setMenuOpen(false);
                    setProfileModalOpen(true);
                  }}
                  activeOpacity={0.75}
                >
                  <ModernAvatar
                    name={user.name}
                    avatarUrl={user.avatar}
                    size={34}
                    showPresence={true}
                    isOnline={true}
                  />
                  <View style={styles.menuProfileInfo}>
                    <Text style={styles.menuProfileName} numberOfLines={1}>
                      {user.name}
                    </Text>
                    <Text style={styles.menuProfileEmail} numberOfLines={1}>
                      {user.email || 'Admin'}
                    </Text>
                  </View>
                  <RemixIcon name="arrow-right-s-line" size={14} color="#94A3B8" />
                </TouchableOpacity>
              )}

              <View style={styles.menuDivider} />

              {/* Theme Settings Item */}
              <TouchableOpacity
                style={styles.menuItemBtn}
                onPress={() => {
                  setMenuOpen(false);
                  setThemeModalOpen(true);
                }}
                activeOpacity={0.7}
              >
                <RemixIcon name="palette-line" size={14} color="#64748B" />
                <Text style={styles.menuItemText}>Appearance & Theme</Text>
              </TouchableOpacity>

              {/* Settings Item */}
              <TouchableOpacity
                style={styles.menuItemBtn}
                onPress={() => {
                  setMenuOpen(false);
                  setActiveModule('settings');
                }}
                activeOpacity={0.7}
              >
                <RemixIcon name="settings-3-line" size={14} color="#64748B" />
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              {/* Sign Out Button */}
              <TouchableOpacity
                style={styles.menuLogoutBtn}
                onPress={() => {
                  setMenuOpen(false);
                  logout();
                }}
                activeOpacity={0.7}
              >
                <RemixIcon name="logout-box-r-line" size={14} color="#EF4444" />
                <Text style={styles.menuLogoutText}>{t.signOut}</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Full User Profile Modal */}
      <UserProfileModal
        visible={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Telegram-Grade Theme Customizer Modal */}
      <ThemePickerModal
        visible={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 14,
    zIndex: 100,
  },
  leftSpacer: {
    width: 68, // Clear space for native macOS traffic lights (red, yellow, green)
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  toolIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toolIconBtnActive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  vDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  userProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 2,
    paddingRight: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginLeft: 4,
  },
  userProfileBtnActive: {
    backgroundColor: '#EEF2F6',
    borderColor: '#CBD5E1',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuDropdown: {
    position: 'absolute',
    top: 48,
    right: 14,
    width: 245,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  menuProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 4,
    marginBottom: 6,
  },
  menuProfileInfo: {
    flex: 1,
  },
  menuProfileName: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  menuProfileEmail: {
    fontSize: 10,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 1,
  },
  menuRowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  statusLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    gap: 5,
  },
  statusLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  statusLiveText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    color: '#64748B',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  menuItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
  },
  menuItemText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    color: '#334155',
    fontWeight: '600',
  },
  menuLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 6,
    gap: 7,
    backgroundColor: '#FEF2F2',
  },
  menuLogoutText: {
    fontSize: 11,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#EF4444',
  },
});
