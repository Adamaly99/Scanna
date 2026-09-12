/**
 * useSubscriptionGate Hook - Gate premium
 * Compatibilité avec ancien code
 */

import { useRouter } from 'expo-router';
import { useSubscription } from './useSubscription';
import { useCallback } from 'react';

/**
 * Hook pour gérer les restrictions premium
 * Redirige vers le paywall si l'utilisateur n'a pas accès
 */
export function usePremium() {
  const { isPremium } = useSubscription();
  const router = useRouter();

  const goPremium = useCallback(
    (message?: string) => {
      router.push({
        pathname: '/(tabs)/paywall',
        params: message ? { message } : undefined,
      });
    },
    [router]
  );

  return {
    premium: isPremium,
    isPremium,
    goPremium,
  };
}