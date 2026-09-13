import { Tabs } from 'expo-router';
import { colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutrals[400],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.neutrals[200],
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          headerTitle: 'Scana',
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: 'Documents',
          headerTitle: 'Mes Documents',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Paramètres',
          headerTitle: 'Paramètres',
        }}
      />
    </Tabs>
  );
}