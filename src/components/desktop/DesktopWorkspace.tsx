import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useDesktopStore } from '../../store/useDesktopStore';
import { DesktopHeader } from './DesktopHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { useThemeStore } from '../../store/useThemeStore';
import { AICopilotModule } from './modules/AICopilotModule';
import { PersonalPlannerModule } from './modules/PersonalPlannerModule';
import { PersonalFinanceModule } from './modules/PersonalFinanceModule';
import { LifeDashboardModule } from './modules/LifeDashboardModule';
import { ProjectsModule } from './modules/ProjectsModule';
import { ChatModule } from './modules/ChatModule';
import { CalendarModule } from './modules/CalendarModule';
import { MarketRadarModule } from './modules/MarketRadarModule';
import { SettingsModule } from './modules/SettingsModule';
import { ForwardMessageModal } from './modules/chat/ForwardMessageModal';

export const DesktopWorkspace: React.FC = () => {
  const activeModule = useDesktopStore((state) => state.activeModule);
  const fetchInitialData = useDesktopStore((state) => state.fetchInitialData);
  const connectWebSocket = useDesktopStore((state) => state.connectWebSocket);
  const isLoading = useDesktopStore((state) => state.isLoading);
  const isSidebarVisible = useDesktopStore((state) => state.isSidebarVisible);
  const isTopNavVisible = useDesktopStore((state) => state.isTopNavVisible);
  const tokens = useThemeStore((state) => state.tokens);

  useEffect(() => {
    fetchInitialData();
    connectWebSocket();
  }, []);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'copilot':
        return <AICopilotModule />;
      case 'planner':
        return <PersonalPlannerModule />;
      case 'calendar':
        return <CalendarModule />;
      case 'goals':
        return <ProjectsModule />;
      case 'finances':
        return <PersonalFinanceModule />;
      case 'market':
        return <MarketRadarModule />;
      case 'dashboard':
        return <LifeDashboardModule />;
      case 'chat':
        return <ChatModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <AICopilotModule />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.windowBg }]}>
      {/* Top Titlebar Header */}
      {isTopNavVisible && <DesktopHeader />}

      {/* Main Workspace Body */}
      <View style={styles.workspaceBody}>
        {/* Left Vertical Rail */}
        {isSidebarVisible && <DesktopSidebar />}

        {/* Dynamic Domain Canvas */}
        <View style={[styles.canvasContainer, { backgroundColor: tokens.windowBg }]}>
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={tokens.accentColor} />
            </View>
          ) : (
            renderActiveModule()
          )}
        </View>
      </View>

      {/* Global Telegram Forward / Share Modal */}
      <ForwardMessageModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  workspaceBody: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    height: '100%',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
