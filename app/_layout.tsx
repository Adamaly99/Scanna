import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAppStore } from '@/stores/appStore';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  const { initialize, isInitialized } = useAppStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="scan/index"
        options={{
          title: 'Nouveau scan',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="scan/review"
        options={{
          title: 'Révision',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="document/[id]"
        options={{
          title: 'Document',
          headerShown: true,
        }}
      />
    </Stack>
  );
}