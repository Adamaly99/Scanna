import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ToastProvider } from '@/components/ui/Toast';
import { useAppStore } from '@/stores/appStore';
import { useSecurityGate } from '@/hooks/useSecurityGate';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const locked = useAppStore((s) => s.locked);
  const bootstrap = useAppStore((s) => s.bootstrap);
  const router = useRouter();
  const segments = useSegments();
  useSecurityGate();

  useEffect(() => { void bootstrap(); }, [bootstrap]);

  useEffect(() => {
    if (!hydrated) return;
    const inOnboarding = segments[0] === 'onboarding';
    const inLock = segments[0] === 'security';
    if (!onboardingDone && !inOnboarding) router.replace('/onboarding');
    else if (onboardingDone && inOnboarding) router.replace('/');
    else if (locked && !inLock) router.replace('/security/lock');
    else if (!locked && inLock) router.replace('/');
  }, [hydrated, onboardingDone, locked, segments, router]);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="scan" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="document/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="search" />
            <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          </Stack>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
