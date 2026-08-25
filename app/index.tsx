import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useAuthStore } from '../src/store/useAuthStore';
import { AuthCard } from '../src/components/auth/AuthCard';
import { DesktopWorkspace } from '../src/components/desktop/DesktopWorkspace';
import { MinimalToast } from '../src/components/ui/MinimalToast';

export default function IndexPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <MinimalToast />
      {isAuthenticated ? <DesktopWorkspace /> : <AuthCard />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
  },
});
