import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Icon, IconName } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/appStore';

const { width } = Dimensions.get('window');

const SLIDES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'scan', title: 'Scannez en un instant', text: 'Détection automatique du document, correction de perspective, capture rapide.' },
  { icon: 'pdf', title: 'Des PDF impeccables', text: 'Multi-pages, filtres document, export PDF réel et partage natif.' },
  { icon: 'text', title: 'OCR et recherche, 100% hors-ligne', text: 'Le texte est extrait sur l’appareil et cherchable. Aucune donnée ne quitte votre téléphone.' },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const complete = useAppStore((s) => s.completeOnboarding);
  const router = useRouter();
  const slide = SLIDES[index]!;
  const last = index === SLIDES.length - 1;

  const finish = () => { complete(); router.replace('/'); };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.skipRow}>
        {!last && (
          <Pressable onPress={finish} accessibilityLabel="Passer l’introduction" hitSlop={12}>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>Passer</Text>
          </Pressable>
        )}
      </View>
      <Animated.View key={index} entering={SlideInRight} style={styles.slide}>
        <View style={styles.iconWrap}>
          <Icon name={slide.icon} size={56} color={colors.primary} strokeWidth={1.6} />
        </View>
        <Text style={[typography.h1, styles.title]}>{slide.title}</Text>
        <Text style={[typography.body, styles.text]}>{slide.text}</Text>
      </Animated.View>
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]}
            accessibilityLabel={`Étape ${i + 1}`} />
        ))}
      </View>
      <View style={styles.footer}>
        <Button
          label={last ? 'Commencer' : 'Suivant'}
          onPress={() => (last ? finish() : setIndex(index + 1))}
          size="lg"
          style={{ alignSelf: 'stretch' }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  skipRow: { alignItems: 'flex-end', minHeight: 24 },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  iconWrap: {
    width: 128, height: 128, borderRadius: radius.xl,
    backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  title: { color: colors.text, textAlign: 'center' },
  text: { color: colors.textSecondary, textAlign: 'center', maxWidth: 320 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginVertical: spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  footer: { paddingBottom: spacing.lg },
});
