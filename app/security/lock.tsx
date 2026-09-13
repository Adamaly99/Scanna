import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Input } from '@/components/atoms';
import { useAppStore } from '@/stores/appStore';
import { colors, spacing } from '@/constants/theme';

export default function AppLockScreen() {
  const { unlockApp, appLock } = useAppStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = () => {
    if (pin === appLock.pinCode) {
      setPin('');
      setError('');
      unlockApp();
    } else {
      setError('Code PIN incorrect');
      setPin('');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="h1" style={styles.title}>
        Scana Verrouillée
      </Text>

      <Text variant="body" color={colors.neutrals[600]} style={styles.subtitle}>
        Entrez votre code PIN pour déverrouiller
      </Text>

      <Input
        placeholder="Code PIN"
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        keyboardType="number-pad"
        error={error}
        style={styles.input}
      />

      <Button
        label="Déverrouiller"
        onPress={handleUnlock}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  button: {
    width: '100%',
  },
});