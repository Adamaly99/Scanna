import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppStore } from '@/stores/appStore';
import { setPin, verifyPin, clearPin } from '@/security/pinService';
import { authenticate } from '@/security/biometricService';
import { subscriptionService } from '@/subscription/subscriptionService';
import { useRouter } from 'expo-router';
import { useToast } from '@/components/ui/Toast';

export default function Settings() {
  const { pinEnabled, biometricEnabled, biometricAvailable, setPinEnabled, setBiometricEnabled, refreshPremium } = useAppStore();
  const [pinModal, setPinModal] = useState<null | 'create' | 'disable'>(null);
  const [pin, setPinValue] = useState('');
  const router = useRouter();
  const toast = useToast();

  const togglePin = async (enable: boolean) => {
    if (enable) { setPinValue(''); setPinModal('create'); return; }
    setPinModal('disable');
  };

  const confirmCreate = async () => {
    const res = await setPin(pin);
    if (res.ok) { setPinEnabled(true); setPinModal(null); toast('Code PIN activé', 'success'); }
    else toast(res.error, 'error');
  };

  const confirmDisable = async () => {
    const res = await verifyPin(pin);
    if (res.ok) { await clearPin(); setPinEnabled(false); setPinModal(null); toast('Code PIN désactivé', 'success'); }
    else toast(res.error, 'error');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={[typography.h1, { color: colors.text }]}>Réglages</Text>

        <Section title="Sécurité">
          <Row icon="lock" label="Code PIN" sub="Protège l’accès à l’app">
            <Switch value={pinEnabled} onValueChange={(v) => void togglePin(v)}
              trackColor={{ true: colors.primary }} accessibilityLabel="Activer le code PIN" />
          </Row>
          <Row icon="fingerprint" label={biometricAvailable ? 'Biométrie' : 'Biométrie indisponible'}
            sub={biometricAvailable ? 'Face ID / empreinte' : 'Aucune méthode enregistrée sur l’appareil'}>
            <Switch value={biometricEnabled} disabled={!biometricAvailable}
              onValueChange={(v) => {
                if (v) void authenticate().then((r) => { if (r.ok) setBiometricEnabled(true); });
                else setBiometricEnabled(false);
              }}
              trackColor={{ true: colors.primary }} accessibilityLabel="Activer la biométrie" />
          </Row>
        </Section>

        <Section title="Abonnement">
          <Row icon="star" label="Scana Premium" sub="OCR avancé, outils premium">
            <Button label="Gérer" size="sm" variant="secondary"
              onPress={() => router.push('/paywall')} />
          </Row>
          <Row icon="rotate" label="Restaurer les achats" sub="Récupère vos achats store">
            <Button size="sm" variant="ghost" label="Restaurer" onPress={() => {
              void subscriptionService.restore().then((r) => {
                if (r.ok) { toast('Achats restaurés', 'success'); void refreshPremium(); }
                else toast(r.error.message, 'error');
              });
            }} />
          </Row>
        </Section>

        <Section title="À propos">
          <Row icon="info" label="Version" sub="Scana 2.0.0 — offline-first" />
        </Section>
      </ScrollView>

      <Modal visible={pinModal !== null}
        title={pinModal === 'create' ? 'Créer un code PIN' : 'Confirmer votre PIN'}
        onClose={() => setPinModal(null)}
        confirmLabel={pinModal === 'create' ? 'Activer' : 'Désactiver'}
        onConfirm={() => void (pinModal === 'create' ? confirmCreate() : confirmDisable())}
        destructive={pinModal === 'disable'}>
        <Input label="Code PIN (4 à 8 chiffres)" value={pin} onChangeText={setPinValue}
          placeholder="••••" autoFocus keyboardType="number-pad" maxLength={8}
          accessibilityLabel="Saisir le code PIN" secureTextEntry />
      </Modal>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[typography.caption, styles.sectionTitle]}>{title.toUpperCase()}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ icon, label, sub, children }: {
  icon: IconName; label: string; sub: string; children?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <Icon name={icon} size={20} color={colors.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { color: colors.text }]}>{label}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{sub}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.textTertiary, paddingLeft: spacing.xs },
  card: { backgroundColor: colors.background, borderRadius: radius.lg, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border, minHeight: 56,
  },
});
