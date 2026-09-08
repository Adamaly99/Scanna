import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { Shake } from 'react-native-reanimated';
import { colors, spacing, typography } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { useAppStore } from '@/stores/appStore';
import { verifyPin, getLockoutRemainingMs } from '@/security/pinService';
import { authenticate } from '@/security/biometricService';
import { useToast } from '@/components/ui/Toast';

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','del'] as const;

export default function LockScreen() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [lockMs, setLockMs] = useState(0);
  const unlock = useAppStore((s) => s.unlock);
  const biometricEnabled = useAppStore((s) => s.biometricEnabled);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    void getLockoutRemainingMs().then(setLockMs);
    if (biometricEnabled) {
      void authenticate('Déverrouiller Scana').then((r) => { if (r.ok) unlock(); });
    }
  }, [biometricEnabled, unlock]);

  useEffect(() => {
    if (lockMs <= 0) return;
    const t = setInterval(() => {
      void getLockoutRemainingMs().then((ms) => {
        setLockMs(ms);
        if (ms <= 0) setPin('');
      });
    }, 1000);
    return () => clearInterval(t);
  }, [lockMs]);

  const press = async (k: string) => {
    if (lockMs > 0) return;
    if (k === 'del') { setPin((p) => p.slice(0, -1)); return; }
    if (k === '') return;
    const next = (pin + k).slice(0, 8);
    setPin(next);
    if (next.length >= 4) {
      const res = await verifyPin(next);
      if (res.ok) { unlock(); router.replace('/'); }
      else {
        setError(true);
        setTimeout(() => { setPin(''); setError(false); }, 500);
        toast(res.error, 'error');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Icon name="lock" size={40} color={colors.primary} />
      <Text style={[typography.h2, { color: colors.text }]}>Scana est verrouillé</Text>
      {lockMs > 0 ? (
        <Text style={[typography.body, { color: colors.danger }]}>
          Réessayez dans {Math.ceil(lockMs / 1000)} s
        </Text>
      ) : (
        <Animated.View style={styles.dots} key={`${error}-${pin.length}`}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View key={i} style={[
              styles.dot,
              i < pin.length && { backgroundColor: error ? colors.danger : colors.primary },
            ]} />
          ))}
        </Animated.View>
      )}

      <View style={styles.pad}>
        {KEYS.map((k, i) => (
          <Pressable key={i} style={styles.key} onPress={() => void press(k)}
            disabled={k === '' || lockMs > 0}
            accessibilityRole="button"
            accessibilityLabel={k === 'del' ? 'Effacer' : k === '' ? '' : `Chiffre ${k}`}>
            {k === 'del' ? <Icon name="arrowLeft" size={22} color={colors.text} />
              : <Text style={[typography.h3, { color: colors.text }]}>{k}</Text>}
          </Pressable>
        ))}
      </View>

      {biometricEnabled ? (
        <Pressable onPress={() => {
          void authenticate('Déverrouiller Scana').then((r) => {
            if (r.ok) { unlock(); router.replace('/'); }
          });
        }} accessibilityLabel="Utiliser la biométrie" hitSlop={12}>
          <Icon name="fingerprint" size={36} color={colors.primary} />
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl,
  },
  dots: { flexDirection: 'row', gap: spacing.sm, minHeight: 20 },
  dot: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 1.5, borderColor: colors.borderStrong,
  },
  pad: { flexDirection: 'row', flexWrap: 'wrap', width: 280, gap: spacing.md, justifyContent: 'center' },
  key: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
  },
});
