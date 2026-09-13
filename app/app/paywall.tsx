import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, Card } from '@/components/atoms';
import { useSubscription } from '@/hooks/useSubscription';
import { colors, spacing } from '@/constants/theme';

export default function PaywallScreen() {
  const router = useRouter();
  const { setTier } = useSubscription();

  const tiers = [
    {
      name: 'Free',
      price: 'Gratuit',
      features: [
        '100 documents',
        '500 pages',
        '3 langues OCR',
        'Sans synchronisation cloud',
      ],
    },
    {
      name: 'Pro',
      price: '$4.99/mois',
      features: [
        '1000 documents',
        '5000 pages',
        '9 langues OCR',
        'Synchronisation cloud (5GB)',
        'Annotations et signatures',
      ],
      popular: true,
    },
    {
      name: 'Premium',
      price: '$9.99/mois',
      features: [
        'Documents illimités',
        'Pages illimitées',
        'Toutes les langues',
        'Synchronisation cloud illimitée',
        'Toutes les fonctionnalités',
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          Débloquez le potentiel complet
        </Text>

        <Text variant="body" color={colors.neutrals[600]} style={styles.subtitle}>
          Choisissez le plan qui vous convient
        </Text>

        {tiers.map((tier) => (
          <Card
            key={tier.name}
            style={[styles.tierCard, tier.popular && styles.tierCardPopular]}
          >
            {tier.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>POPULAIRE</Text>
              </View>
            )}

            <Text variant="h2" style={styles.tierName}>
              {tier.name}
            </Text>

            <Text variant="display" style={styles.tierPrice}>
              {tier.price}
            </Text>

            <View style={styles.featuresList}>
              {tier.features.map((feature, index) => (
                <Text
                  key={index}
                  variant="body"
                  style={styles.feature}
                >
                  ✓ {feature}
                </Text>
              ))}
            </View>

            <Button
              label="Sélectionner"
              variant={tier.popular ? 'primary' : 'outlined'}
              onPress={() => {
                setTier(tier.name.toLowerCase() as any);
                router.back();
              }}
              style={styles.selectButton}
            />
          </Card>
        ))}
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
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  tierCard: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  tierCardPopular: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  popularBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  popularBadgeText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 10,
  },
  tierName: {
    marginBottom: spacing.sm,
  },
  tierPrice: {
    marginBottom: spacing.lg,
    color: colors.primary,
  },
  featuresList: {
    marginBottom: spacing.lg,
  },
  feature: {
    marginBottom: spacing.md,
    color: colors.neutrals[700],
  },
  selectButton: {
    width: '100%',
  },
});