import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { RemixIcon } from '../ui/RemixIcon';
import { LanguageToggle } from '../ui/LanguageToggle';

export const AuthenticatedView: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const currentRole = useAuthStore((state) => state.currentRole);
  const logout = useAuthStore((state) => state.logout);
  const t = useLanguageStore((state) => state.t);

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* Top Floating Bar */}
      <View style={styles.topBar}>
        <LanguageToggle />
      </View>

      {/* Main Authenticated Card */}
      <View style={styles.card}>
        {/* Header with Green Pulse */}
        <View style={styles.headerRow}>
          <View style={styles.livePill}>
            <View style={styles.greenPulse} />
            <Text style={styles.liveText}>AUTHENTICATED SESSION</Text>
          </View>
          <Text style={styles.tierText}>{currentRole}</Text>
        </View>

        {/* User Profile Block */}
        <View style={styles.profileBlock}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.fallbackLetter}>{user.name.charAt(0)}</Text>
            </View>
          )}

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge}>
                <RemixIcon name="shield-check-line" size={13} color="#2A9D8F" />
                <Text style={styles.roleBadgeText}>{user.role}</Text>
              </View>
              <View style={styles.deptBadge}>
                <Text style={styles.deptBadgeText}>{user.department}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Backend Connectivity Status */}
        <View style={styles.backendCard}>
          <View style={styles.backendRow}>
            <RemixIcon name="sparkles-fill" size={15} color="#10B981" />
            <Text style={styles.backendStatusTitle}>Backend API Connected</Text>
          </View>
          <Text style={styles.backendDetails}>
            Live REST & WebSocket sync active on http://localhost:4000
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={logout}
            activeOpacity={0.8}
          >
            <RemixIcon name="lock-line" size={16} color="#EF4444" />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
  },
  topBar: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 10,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 10,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#065F46',
    letterSpacing: 0.6,
  },
  tierText: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#64748B',
  },
  profileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E2E8F0',
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2A9D8F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackLetter: {
    fontSize: 22,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'KantumruyPro-Bold',
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 12,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 4,
  },
  roleBadgeText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F766E',
  },
  deptBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  deptBadgeText: {
    fontSize: 10.5,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
  },
  backendCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    marginVertical: 18,
  },
  backendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  backendStatusTitle: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  backendDetails: {
    fontSize: 11,
    fontFamily: 'Krasar-Regular',
    color: '#64748B',
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  logoutBtnText: {
    fontSize: 12,
    fontFamily: 'Krasar-Bold',
    fontWeight: '700',
    color: '#EF4444',
  },
});
