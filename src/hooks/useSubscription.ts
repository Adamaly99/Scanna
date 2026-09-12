/**
 * useSubscription Hook - Gestion des souscriptions
 * Intégration avec Zustand store
 */

import { useCallback, useState, useEffect } from 'react';
import { SubscriptionStatus, SubscriptionTier } from '@/types';
import { SUBSCRIPTION_LIMITS } from '@/constants/app';
import { database } from '@/services/database';
import { logger } from '@/services/logger';

// État fictif pour Phase 1 - sera remplacé par Zustand store en Phase 2
const DEFAULT_SUBSCRIPTION: SubscriptionStatus = {
  tier: 'free',
  isPremium: false,
  autoRenew: false,
  features: SUBSCRIPTION_LIMITS.free,
};

/**
 * Hook pour accéder et manipuler l'état de souscription
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus>(DEFAULT_SUBSCRIPTION);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Charger l'état de souscription depuis la base de données
   */
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setIsLoading(true);
        const stored = await database.getAppState('subscription');

        if (stored) {
          const parsed = JSON.parse(stored);
          setSubscription(parsed);
          logger.debug('Subscription loaded', { tier: parsed.tier });
        } else {
          // Première utilisation: libre
          setSubscription(DEFAULT_SUBSCRIPTION);
          await database.setAppState('subscription', JSON.stringify(DEFAULT_SUBSCRIPTION));
        }
      } catch (error) {
        logger.error('Failed to load subscription', error);
        setSubscription(DEFAULT_SUBSCRIPTION);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscription();
  }, []);

  /**
   * Définir un nouveau tier de souscription
   */
  const setTier = useCallback(
    async (tier: SubscriptionTier) => {
      try {
        const newSubscription: SubscriptionStatus = {
          tier,
          isPremium: tier !== 'free',
          autoRenew: false,
          features: SUBSCRIPTION_LIMITS[tier],
        };

        setSubscription(newSubscription);
        await database.setAppState('subscription', JSON.stringify(newSubscription));
        logger.info(`Subscription upgraded to ${tier}`);
      } catch (error) {
        logger.error('Failed to update subscription', error);
      }
    },
    []
  );

  /**
   * Vérifier si une fonctionnalité est disponible
   */
  const hasFeature = useCallback(
    (feature: keyof typeof SUBSCRIPTION_LIMITS.free): boolean => {
      const featureValue = subscription.features[feature];

      if (typeof featureValue === 'boolean') {
        return featureValue;
      }

      // Pour les limites numériques (maxDocuments, etc.)
      return featureValue > 0;
    },
    [subscription]
  );

  /**
   * Récupérer la limite d'une ressource
   */
  const getLimit = useCallback(
    (resource: 'maxDocuments' | 'maxPages' | 'cloudStorage' | 'ocrLanguages'): number => {
      return subscription.features[resource] as number;
    },
    [subscription]
  );

  return {
    subscription,
    isLoading,
    isPremium: subscription.isPremium,
    tier: subscription.tier,
    setTier,
    hasFeature,
    getLimit,
  };
}

/**
 * Hook pour les restrictions liées à la souscription
 * Redirige vers paywall si nécessaire
 */
export function usePremiumGate() {
  const { isPremium, tier } = useSubscription();
  const [requiresPremium, setRequiresPremium] = useState(false);

  const checkPremium = useCallback(
    (required: boolean = true): boolean => {
      if (required && !isPremium) {
        setRequiresPremium(true);
        return false;
      }
      return true;
    },
    [isPremium]
  );

  const reset = useCallback(() => {
    setRequiresPremium(false);
  }, []);

  return {
    isPremium,
    tier,
    requiresPremium,
    checkPremium,
    reset,
  };
}

/**
 * Hook pour les limites de ressources
 */
export function useSubscriptionLimits() {
  const { subscription } = useSubscription();

  return {
    maxDocuments: subscription.features.maxDocuments,
    maxPages: subscription.features.maxPages,
    maxOCRLanguages: subscription.features.ocrLanguages,
    cloudStorage: subscription.features.cloudStorage,
    canUseAnnotations: subscription.features.annotations,
    canUseSignatures: subscription.features.signatures,
    canUseCloudSync: subscription.features.cloudSync,
  };
}