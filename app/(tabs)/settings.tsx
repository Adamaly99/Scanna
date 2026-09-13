import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import { Text, Card } from '@/components/atoms';
import { useAppStore } from '@/stores/appStore';
import { colors, spacing } from '@/constants/theme';

export default function SettingsScreen() {
  const { theme, setTheme, locale, setLocale, appLock, setAppLock, initialize, isInitialized } =
    useAppStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Theme Section */}
        <Text variant="h3" style={styles.sectionTitle}>
          Apparence
        </Text>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <Text variant="body">Thème sombre</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
              trackColor={{ false: colors.neutrals[300], true: colors.primary }}
            />
          </View>
        </Card>

        {/* Language Section */}
        <Text variant="h3" style={styles.sectionTitle}>
          Langue
        </Text>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <Text variant="body">Français</Text>
            <Switch
              value={locale === 'fr'}
              onValueChange={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              trackColor={{ false: colors.neutrals[300], true: colors.primary }}
            />
          </View>
        </Card>

        {/* Security Section */}
        <Text variant="h3" style={styles.sectionTitle}>
          Sécurité
        </Text>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <Text variant="body">Verrouillage par code PIN</Text>
            <Switch
              value={appLock.enabled}
              onValueChange={(value) =>
                setAppLock({
                  ...appLock,
                  enabled: value,
                })
              }
              trackColor={{ false: colors.neutrals[300], true: colors.primary }}
            />
          </View>

          {appLock.enabled && (
            <View style={styles.settingRow}>
              <Text variant="body">Biométrie</Text>
              <Switch
                value={appLock.biometricEnabled}
                onValueChange={(value) =>
                  setAppLock({
                    ...appLock,
                    biometricEnabled: value,
                  })
                }
                trackColor={{ false: colors.neutrals[300], true: colors.primary }}
              />
            </View>
          )}
        </Card>

        {/* About Section */}
        <Text variant="h3" style={styles.sectionTitle}>
          À propos
        </Text>
        <Card style={styles.card}>
          <View style={styles.settingRow}>
            <Text variant="body">Version</Text>
            <Text variant="caption" color={colors.neutrals[500]}>
              2.0.0
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutrals[50],
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    color: colors.primary,
  },
  card: {
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutrals[200],
  },
});