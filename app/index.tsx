import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/stores/appStore';

export default function RootRedirect() {
  const router = useRouter();
  const { onboardingComplete, initialize } = useAppStore();

  useEffect(() => {
    initialize().then(() => {
      if (onboardingComplete) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    });
  }, []);

  return null;
}