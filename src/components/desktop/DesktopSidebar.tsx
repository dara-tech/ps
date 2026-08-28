import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDesktopStore, DesktopNavModule } from '../../store/useDesktopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useThemeStore } from '../../store/useThemeStore';
import { MultiColorSidebarIcon } from '../ui/MultiColorSidebarIcon';

interface NavItem {
  id: DesktopNavModule;
  label: string;
}

export const DesktopSidebar: React.FC = () => {
  const activeModule = useDesktopStore((state) => state.activeModule);
  const setActiveModule = useDesktopStore((state) => state.setActiveModule);
  const sidebarMode = useDesktopStore((state) => state.sidebarMode);
  const isTopNavVisible = useDesktopStore((state) => state.isTopNavVisible);
  const tokens = useThemeStore((state) => state.tokens);
  const t = useLanguageStore((state) => state.t);

  const isExpanded = sidebarMode === 'expanded';

  const navItems: NavItem[] = [
    { id: 'copilot', label: t.navCopilot },
    { id: 'planner', label: t.navPlanner },
    { id: 'calendar', label: t.navCalendar },
    { id: 'goals', label: t.navGoals },
    { id: 'finances', label: t.navFinances },
    { id: 'market', label: t.navMarket },
    { id: 'dashboard', label: t.navDashboard },
    { id: 'chat', label: t.navMessenger },
  ];

  return (
    <View
      style={[
        styles.sidebar,
        { backgroundColor: tokens.surfaceBg, borderRightColor: tokens.borderSubtle },
        isExpanded && styles.sidebarExpanded,
        !isTopNavVisible && { paddingTop: 38 },
      ]}
    >
      {/* Top Main Navigation Items */}
      <View style={[styles.navGroup, isExpanded && styles.navGroupExpanded]}>
        {navItems.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.iconButton,
                isExpanded && styles.iconButtonExpanded,
                isActive && {
                  backgroundColor: tokens.accentSoft,
                  borderColor: tokens.accentBorder,
                },
              ]}
              onPress={() => setActiveModule(item.id)}
              activeOpacity={0.75}
            >
              <MultiColorSidebarIcon
                name={item.id}
                isActive={isActive}
                size={20}
              />
              {isExpanded && (
                <Text
                  style={[
                    styles.navLabel,
                    { color: isActive ? tokens.textPrimary : tokens.textSecondary },
                    isActive && { fontFamily: 'Krasar-Bold', fontWeight: '700' },
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom Settings Item */}
      <View style={[styles.bottomGroup, isExpanded && styles.bottomGroupExpanded]}>
        <TouchableOpacity
          style={[
            styles.iconButton,
            isExpanded && styles.iconButtonExpanded,
            activeModule === 'settings' && {
              backgroundColor: tokens.accentSoft,
              borderColor: tokens.accentBorder,
            },
          ]}
          onPress={() => setActiveModule('settings')}
          activeOpacity={0.75}
        >
          <MultiColorSidebarIcon
            name="settings"
            isActive={activeModule === 'settings'}
            size={20}
          />
          {isExpanded && (
            <Text
              style={[
                styles.navLabel,
                { color: activeModule === 'settings' ? tokens.textPrimary : tokens.textSecondary },
                activeModule === 'settings' && { fontFamily: 'Krasar-Bold', fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              {t.navSettings}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 52,
    backgroundColor: '#F1F5F9',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    overflow: 'hidden',
    transitionProperty: 'width',
    transitionDuration: '200ms',
  } as any,
  sidebarExpanded: {
    width: 185,
    paddingHorizontal: 10,
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  navGroup: {
    alignItems: 'center',
    gap: 6,
    width: '100%',
    overflow: 'hidden',
  },
  navGroupExpanded: {
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  iconButtonExpanded: {
    width: '100%',
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    gap: 10,
    borderRadius: 8,
  },
  iconButtonActive: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  iconButtonActiveExpanded: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  navLabel: {
    fontSize: 12.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '600',
    color: '#475569',
    flex: 1,
  },
  navLabelActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  bottomGroup: {
    alignItems: 'center',
    width: '100%',
  },
  bottomGroupExpanded: {
    alignItems: 'stretch',
  },
});
