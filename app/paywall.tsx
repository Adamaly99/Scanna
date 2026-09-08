import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { subscriptionService } from '@/subscription/subscriptionService';
import { useAppStore } from '@/stores/appStore';
import { useToast } from '@/components/ui/Toast';

interface Offering {
  identifier: string;
  priceString: string;
  title: string;
}

export default function Paywall() {
  const params = useLocalSearchParams<{ message?: string }>();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const refresh = useAppStore((s) => s.refreshPremium);

  useEffect(() => {
    void subscriptionService.offerings().then((res) => {
      setLoading(false);
      if (!res.ok) { setOfferings([]); return; }
      const pkgs = res.value.all['premium']?.availablePackages ?? [];
      setOfferings(pkgs.map((p) => ({
        identifier: p.identifier,
        priceString: p.product.priceString,
        title: p.product.title,
      })));
    });
  }, []);

  const buy = async (pkgId: string) => {
    setPurchasing(true);
    const res = await subscriptionService.purchase(pkgId);
    setPurchasing(false);
    if (res.ok && res.value.isPremium) {
      toast('Bienvenue dans Scana Premium', 'success');
      await refresh();
      router.back();
    } else if (!res.ok && res.error.message !== 'cancelled') {
      toast(res.error.message, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Fermer"
          style={{ alignSelf: 'flex-end' }}>
          <Icon name="close" size={22} color={colors.textSecondary} />
        </Pressable>

        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <View style={styles.iconWrap}>
            <Icon name="starFill" size={40} color={colors.primary} />
          </View>
          <Text style={[typography.h1, { color: colors.text, textAlign: 'center' }]}>Scana Premium</Text>
          {params.message ? (
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
              {params.message}
            </Text>
          ) : null}
        </View>

        {[
          'OCR avancé et copie de texte illimitée',
          'Export PDF haute qualité',
          'Compression avancée',
          'Signature et outils premium',
        ].map((f) => (
          <View key={f} style={styles.featureRow}>
            <Icon name="checkCircle" size={20} color={colors.success} />
            <Text style={[typography.body, { color: colors.text }]}>{f}</Text>
          </View>
        ))}

        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : offerings.length === 0 ? (
          <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
            Offres indisponibles pour le moment (hors-ligne ou configuration en attente).
          </Text>
        ) : (
          offerings.map((o) => (
            <Pressable key={o.identifier} style={styles.offer} onPress={() => void buy(o.identifier)}
              disabled={purchasing} accessibilityRole="button"
              accessibilityLabel={`${o.title}, ${o.priceString}`}>
              <Text style={[typography.h3, { color: colors.text }]}>{o.title}</Text>
              <Text style={[typography.body, { color: colors.primary }]}>{o.priceString}</Text>
            </Pressable>
          ))
        )}

        <Button label="Restaurer mes achats" variant="ghost" onPress={() => {
          void subscriptionService.restore().then(async (r) => {
            if (r.ok) { toast('Achats restaurés', 'success'); await refresh(); router.back(); }
            else toast('Aucun achat à restaurer', 'info');
          });
        }} />
        <Text style={[typography.caption, { color: colors.textTertiary, textAlign: 'center' }]}>
          Paiement via App Store / Google Play. Annulable à tout moment.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  offer: {
    borderWidth: 2, borderColor: colors.primary, borderRadius: radius.lg,
    padding: spacing.lg, alignItems: 'center', gap: spacing.xs,
  },
});
