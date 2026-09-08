import React from 'react';
import { Tabs } from 'expo-router';
import { Icon, IconName } from '@/components/ui/Icon';
import { colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Accueil',
        tabBarIcon: ({ color, size }) => <Icon name="grid" color={color} size={size ?? 24} />,
      }} />
      <Tabs.Screen name="files" options={{
        title: 'Fichiers',
        tabBarIcon: ({ color, size }) => <Icon name="folder" color={color} size={size ?? 24} />,
      }} />
      <Tabs.Screen name="settings" options={{
        title: 'Réglages',
        tabBarIcon: ({ color, size }) => <Icon name="dots" color={color} size={size ?? 24} />,
      }} />
    </Tabs>
  );
}
