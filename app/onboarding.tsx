import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Text, Card } from '@/components/atoms';
import { useAppStore } from '@/stores/appStore';
import { colors, spacing } from '@/constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingComplete } = useAppStore();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Bienvenue dans Scana',
      description: 'L\'application de numérisation de documents la plus puissante',
      icon: '📱',
    },
    {
      title: 'Numérisez facilement',
      description: 'Capturez vos documents avec la caméra de votre téléphone',
      icon: '📷',
    },
    {
      title: 'Organisez et recherchez',
      description: 'Organisez vos documents et trouvez-les rapidement avec OCR',
      icon: '📚',
    },
    {
      title: 'Prêt à commencer',
      description: 'Appuyez sur le bouton ci-dessous pour démarrer',
      icon: '🚀',
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setOnboardingComplete(true);
      router.replace('/(tabs)');
    } else {
      setStep(step + 1);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{currentStep.icon}</Text>
        </View>

        <Text variant="h1" style={styles.title}>
          {currentStep.title}
        </Text>

        <Text variant="body" color={colors.neutrals[600]} style={styles.description}>
          {currentStep.description}
        </Text>

        <View style={styles.dotsContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === step && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Button
          label={isLastStep ? 'Commencer' : 'Suivant'}
          onPress={handleNext}
          size="lg"
          style={styles.button}
        />

        {!isLastStep && (
          <Button
            label="Passer"
            variant="ghost"
            onPress={() => {
              setOnboardingComplete(true);
              router.replace('/(tabs)');
            }}
            style={styles.skipButton}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neutrals[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutrals[300],
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  button: {
    width: '100%',
    marginBottom: spacing.md,
  },
  skipButton: {
    width: '100%',
  },
});